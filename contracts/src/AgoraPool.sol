// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title AgoraPool — Battle Spectator Wagering
/// @notice Spectators deposit any ERC-20 into pools for active battles.
///         On battle end, settle() distributes: 70% winners, 20% battle winner, 10% treasury.
contract AgoraPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Errors ────────────────────────────────────────────────────────────
    error BattleNotActive();
    error BattleAlreadySettled();
    error NotBattleArena();
    error ZeroAmount();
    error AlreadyClaimed();

    // ── Structs ─────────────────────────────────────────────────────────
    struct PoolState {
        bool     active;
        bool     settled;
        uint256  challengerTokenId;
        uint256  defenderTokenId;
        address  settlementToken;
        uint256  totalChallenger;
        uint256  totalDefender;
    }

    struct Position {
        uint256 amount;
        bool    onChallenger;
    }

    // ── State ─────────────────────────────────────────────────────────────
    address public battleArena;

    mapping(bytes32 => PoolState)                          public pools;
    mapping(bytes32 => mapping(address => Position))       public positions;

    uint256 public constant WINNER_SPECTATOR_SHARE = 70;
    uint256 public constant BATTLE_WINNER_SHARE    = 20;
    uint256 public constant TREASURY_SHARE         = 10;

    // ── Events ────────────────────────────────────────────────────────────
    event PoolOpened(bytes32 indexed battleId, uint256 challenger, uint256 defender);
    event WagerPlaced(bytes32 indexed battleId, address indexed spectator, uint256 amount, bool onChallenger);
    event PoolSettled(bytes32 indexed battleId, address winner, uint256 totalPool);

    // ── Constructor ────────────────────────────────────────────────
    constructor(address _treasury) Ownable(_treasury) {
        battleArena = msg.sender;
    }

    function setBattleArena(address _battleArena) external onlyOwner {
        battleArena = _battleArena;
    }

    // ── Arena Interface ───────────────────────────────────────────────────

    function openPool(
        bytes32 battleId,
        address settlementToken,
        uint256 challengerTokenId,
        uint256 defenderTokenId
    ) external {
        require(msg.sender == battleArena, NotBattleArena());
        pools[battleId] = PoolState({
            active:            true,
            settled:           false,
            challengerTokenId: challengerTokenId,
            defenderTokenId:   defenderTokenId,
            settlementToken:   settlementToken,
            totalChallenger:   0,
            totalDefender:     0
        });
        emit PoolOpened(battleId, challengerTokenId, defenderTokenId);
    }

    function placeWager(
        bytes32 battleId,
        uint256 amount,
        bool    onChallenger
    ) external nonReentrant {
        PoolState storage pool = pools[battleId];
        require(pool.active && !pool.settled, BattleNotActive());
        require(amount > 0, ZeroAmount());

        IERC20(pool.settlementToken).safeTransferFrom(msg.sender, address(this), amount);

        Position storage pos = positions[battleId][msg.sender];
        pos.amount        += amount;
        pos.onChallenger   = onChallenger;

        if (onChallenger) pool.totalChallenger += amount;
        else              pool.totalDefender   += amount;

        emit WagerPlaced(battleId, msg.sender, amount, onChallenger);
    }

    function settle(bytes32 battleId, address battleWinner) external nonReentrant {
        require(msg.sender == battleArena, NotBattleArena());
        PoolState storage pool = pools[battleId];
        require(pool.active, BattleNotActive());
        require(!pool.settled, BattleAlreadySettled());

        pool.active   = false;
        pool.settled  = true;

        uint256 total = pool.totalChallenger + pool.totalDefender;
        if (total == 0) return;

        bool challengerWon = (battleWinner == address(uint160(pool.challengerTokenId)));
        uint256 winnerTotal = challengerWon ? pool.totalChallenger : pool.totalDefender;

        uint256 spectatorPool   = (total * WINNER_SPECTATOR_SHARE) / 100;
        uint256 battleWinnerCut = (total * BATTLE_WINNER_SHARE) / 100;
        uint256 treasuryCut     = total - spectatorPool - battleWinnerCut;

        if (battleWinnerCut > 0) {
            IERC20(pool.settlementToken).safeTransfer(battleWinner, battleWinnerCut);
        }
        if (treasuryCut > 0) {
            IERC20(pool.settlementToken).safeTransfer(owner(), treasuryCut);
        }

        _settlementData[battleId] = SettlementData({
            spectatorPool: spectatorPool,
            winnerTotal:   winnerTotal,
            challengerWon: challengerWon,
            claimable:     true
        });

        emit PoolSettled(battleId, battleWinner, total);
    }

    // ── Settlement Claim ──────────────────────────────────────────────────

    struct SettlementData {
        uint256 spectatorPool;
        uint256 winnerTotal;
        bool    challengerWon;
        bool    claimable;
    }

    mapping(bytes32 => SettlementData)          private _settlementData;
    mapping(bytes32 => mapping(address => bool)) private _claimed;

    function claimWinnings(bytes32 battleId) external nonReentrant {
        SettlementData storage sd = _settlementData[battleId];
        require(sd.claimable, "Not claimable");
        require(!_claimed[battleId][msg.sender], AlreadyClaimed());

        Position memory pos = positions[battleId][msg.sender];
        require(pos.amount > 0, "No position");
        require(pos.onChallenger == sd.challengerWon, "Wrong side");

        uint256 share = (pos.amount * sd.spectatorPool) / sd.winnerTotal;
        require(share > 0, "No winnings");

        _claimed[battleId][msg.sender] = true;

        IERC20(pools[battleId].settlementToken).safeTransfer(msg.sender, share);
    }
}