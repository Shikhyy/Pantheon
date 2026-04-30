// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPantheonAgent} from "./interfaces/IPantheonAgent.sol";
import {IAgoraPool} from "./interfaces/IAgoraPool.sol";
import {IPantheonSubnames} from "./interfaces/IPantheonSubnames.sol";

/// @title BattleArena — Pantheon challenge and settlement engine
/// @notice Routes all TXs through KeeperHub MCP for nonce management,
///         gas estimation, and MEV protection.
contract BattleArena is ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using SafeERC20 for IERC20;

    // ── Errors ────────────────────────────────────────────────────────────
    error NotTokenOwner();
    error BattleNotFound();
    error BattleAlreadyActive();
    error NotDefender();
    error BattleExpired();
    error AlreadySettled();
    error InvalidSignature();
    error DisputeWindowClosed();
    error InsufficientWager();

    // ── Enums ─────────────────────────────────────────────────────────────
    enum BattlePhase { Pending, Active, Settled, Disputed, Complete }

    // ── Structs ───────────────────────────────────────────────────────────
    struct Battle {
        uint256     challengerTokenId;
        uint256     defenderTokenId;
        address     challengerOwner;
        address     defenderOwner;
        address     wagerToken;     // ERC-20 (address(0) = native ETH)
        uint256     wagerAmount;
        BattlePhase phase;
        uint256     createdAt;
        uint256     startedAt;
        address     winner;
        bytes32     transcriptHash;
    }

    // ── State ─────────────────────────────────────────────────────────────
    IPantheonAgent    public immutable agentContract;
    IAgoraPool        public immutable agoraPool;
    IPantheonSubnames public immutable subnames;
    address           public immutable referee;
    address           public          treasury;

    uint256 public constant CHALLENGE_EXPIRY  = 24 hours;
    uint256 public constant DISPUTE_WINDOW    = 1 hours;
    uint256 public constant BATTLE_TIMEOUT    = 2 hours;
    uint16  public constant K_FACTOR_NEW      = 32;
    uint16  public constant K_FACTOR_VETERAN  = 16;
    uint32  public constant VETERAN_THRESHOLD = 20;

    mapping(bytes32 => Battle)   public battles;
    mapping(uint256 => bytes32)  public activeBattle;

    // ── Events ────────────────────────────────────────────────────────────
    event BattleCreated(bytes32 indexed battleId, uint256 challenger, uint256 defender, uint256 wagerAmount);
    event BattleStarted(bytes32 indexed battleId, uint256 startedAt);
    event BattleSettled(bytes32 indexed battleId, address indexed winner, uint256 winnerEloGain);
    event DisputeRaised(bytes32 indexed battleId, address raisedBy);
    event BattleForfeited(bytes32 indexed battleId, uint256 forfeiterTokenId);

    constructor(
        address _agentContract,
        address _agoraPool,
        address _subnames,
        address _referee,
        address _treasury
    ) {
        agentContract = IPantheonAgent(_agentContract);
        agoraPool     = IAgoraPool(_agoraPool);
        subnames      = IPantheonSubnames(_subnames);
        referee       = _referee;
        treasury      = _treasury;
    }

    // ── Challenge Flow ────────────────────────────────────────────────────

    function challenge(
        uint256 challengerTokenId,
        uint256 defenderTokenId,
        address wagerToken,
        uint256 wagerAmount
    ) external payable nonReentrant returns (bytes32 battleId) {
        if (agentContract.ownerOf(challengerTokenId) != msg.sender) revert NotTokenOwner();
        if (activeBattle[challengerTokenId] != bytes32(0))           revert BattleAlreadyActive();
        if (wagerAmount == 0)                                         revert InsufficientWager();

        if (wagerToken == address(0)) {
            require(msg.value >= wagerAmount, "Insufficient ETH");
        } else {
            IERC20(wagerToken).safeTransferFrom(msg.sender, address(this), wagerAmount);
        }

        battleId = keccak256(abi.encodePacked(
            challengerTokenId, defenderTokenId, block.timestamp, block.number
        ));

        battles[battleId] = Battle({
            challengerTokenId: challengerTokenId,
            defenderTokenId:   defenderTokenId,
            challengerOwner:   msg.sender,
            defenderOwner:     agentContract.ownerOf(defenderTokenId),
            wagerToken:        wagerToken,
            wagerAmount:       wagerAmount,
            phase:             BattlePhase.Pending,
            createdAt:         block.timestamp,
            startedAt:         0,
            winner:            address(0),
            transcriptHash:    bytes32(0)
        });

        activeBattle[challengerTokenId] = battleId;
        emit BattleCreated(battleId, challengerTokenId, defenderTokenId, wagerAmount);
    }

    function accept(bytes32 battleId) external payable nonReentrant {
        Battle storage b = battles[battleId];
        if (b.createdAt == 0)                                          revert BattleNotFound();
        if (msg.sender != b.defenderOwner)                             revert NotDefender();
        if (block.timestamp > b.createdAt + CHALLENGE_EXPIRY)          revert BattleExpired();
        if (b.phase != BattlePhase.Pending)                            revert AlreadySettled();

        if (b.wagerToken == address(0)) {
            require(msg.value >= b.wagerAmount, "Insufficient ETH");
        } else {
            IERC20(b.wagerToken).safeTransferFrom(msg.sender, address(this), b.wagerAmount);
        }

        b.phase     = BattlePhase.Active;
        b.startedAt = block.timestamp;
        activeBattle[b.defenderTokenId] = battleId;

        agoraPool.openPool(battleId, b.wagerToken, b.challengerTokenId, b.defenderTokenId);
        emit BattleStarted(battleId, block.timestamp);
    }

    function submitResult(
        bytes32 battleId,
        address winner,
        bytes32 transcriptHash,
        bytes calldata signature
    ) external nonReentrant {
        Battle storage b = battles[battleId];
        if (b.phase != BattlePhase.Active) revert AlreadySettled();

        bytes32 msgHash = keccak256(abi.encodePacked(battleId, winner, transcriptHash))
            .toEthSignedMessageHash();
        if (msgHash.recover(signature) != referee) revert InvalidSignature();

        b.winner         = winner;
        b.transcriptHash = transcriptHash;
        b.phase          = BattlePhase.Settled;

        bool challengerWon = (winner == b.challengerOwner);
        uint256 winnerTokenId = challengerWon ? b.challengerTokenId : b.defenderTokenId;
        uint256 loserTokenId  = challengerWon ? b.defenderTokenId   : b.challengerTokenId;

        (uint16 winnerNewElo, uint16 loserNewElo, uint16 eloDelta) = _calculateElo(
            winnerTokenId,
            loserTokenId
        );

        agentContract.updateStats(winnerTokenId, winnerNewElo, 100, true);
        agentContract.updateStats(loserTokenId,  loserNewElo,  25,  false);

        subnames.updateRecords(winnerTokenId, winnerNewElo);
        subnames.updateRecords(loserTokenId,  loserNewElo);

        uint256 totalPot      = b.wagerAmount * 2;
        uint256 winnerShare   = (totalPot * 90) / 100;
        uint256 treasuryShare = totalPot - winnerShare;

        _transferOut(b.wagerToken, winner, winnerShare);
        _transferOut(b.wagerToken, treasury, treasuryShare);

        agoraPool.settle(battleId, winner);

        delete activeBattle[b.challengerTokenId];
        delete activeBattle[b.defenderTokenId];

        emit BattleSettled(battleId, winner, eloDelta);
    }

    function dispute(bytes32 battleId) external {
        Battle storage b = battles[battleId];
        if (b.phase != BattlePhase.Settled) revert AlreadySettled();
        if (block.timestamp > b.startedAt + BATTLE_TIMEOUT + DISPUTE_WINDOW)
            revert DisputeWindowClosed();
        if (msg.sender != b.challengerOwner && msg.sender != b.defenderOwner)
            revert NotTokenOwner();

        b.phase = BattlePhase.Disputed;
        emit DisputeRaised(battleId, msg.sender);
    }

    // ── Internal ──────────────────────────────────────────────────────────

    function _calculateElo(
        uint256 winnerTokenId,
        uint256 loserTokenId
    ) internal view returns (uint16 winnerNew, uint16 loserNew, uint16 delta) {
        IPantheonAgent.AgentData memory winner = agentContract.getAgent(winnerTokenId);
        IPantheonAgent.AgentData memory loser  = agentContract.getAgent(loserTokenId);

        uint16 k = (winner.battleCount < VETERAN_THRESHOLD) ? K_FACTOR_NEW : K_FACTOR_VETERAN;

        int256 eloDiff = int256(uint256(loser.elo)) - int256(uint256(winner.elo));
        int256 expected400 = 400 + eloDiff / 2;
        int256 deltaCalc = (int256(uint256(k)) * (800 - (800 - expected400))) / 800;
        delta = uint16(deltaCalc < 0 ? 0 : (uint256(deltaCalc) > uint256(k) ? k : uint256(deltaCalc)));

        winnerNew = uint16(winner.elo + delta > type(uint16).max ? type(uint16).max : winner.elo + delta);
        loserNew  = loser.elo > delta ? loser.elo - delta : 0;
    }

    function _transferOut(address token, address to, uint256 amount) internal {
        if (token == address(0)) {
            (bool ok,) = payable(to).call{value: amount}("");
            require(ok, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    receive() external payable {}
}
