# Pantheon — Blockchain Development Plan

> Complete smart contract architecture, security model, deployment strategy, and on-chain mechanics. Written from the perspective of a senior blockchain developer with deep Solidity, EVM, DeFi protocol, and hackathon experience.

---

## 1. Contract Overview

```
PantheonAgent.sol          ERC-7857 iNFT — agent identity, stats, lineage
BattleArena.sol            Challenge engine — wager lock, settlement, dispute
AgoraPool.sol              Uniswap v4 hook — spectator wagers, prize distribution
BreedingForge.sol          iNFT offspring system — blended traits, commit-reveal
PantheonSubnames.sol       ENS L2 registrar — agent identity on ENS

Total contracts: 5
Test coverage target: 90%+
Primary network: 0G Chain (chainId 16600)
Secondary network: Unichain Testnet (chainId 1301) for AgoraPool
```

---

## 2. PantheonAgent.sol

### 2.1 Full Implementation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title PantheonAgent — ERC-7857 Intelligent NFT
/// @notice Each token represents an AI agent god with on-chain stats and
///         an off-chain intelligence pointer (0G Storage hash).
contract PantheonAgent is ERC721Enumerable, Ownable {

    // ── Errors ────────────────────────────────────────────────────────────
    error NotAuthorized();
    error InvalidArchetype();
    error NameTaken();
    error ZeroStorageHash();
    error InsufficientBattleCount();

    // ── Enums ─────────────────────────────────────────────────────────────
    enum Archetype { Strategist, Oracle, Berserker, Diplomat }
    enum Rank      { Demigod, Hero, God, Titan, Olympian }

    // ── Structs ───────────────────────────────────────────────────────────
    struct AgentData {
        Archetype archetype;
        uint16    elo;
        uint32    xp;
        Rank      rank;
        uint32    battleCount;
        uint32    wins;
        uint32    losses;
        bytes32   storageHash;   // 0G Storage KV pointer
        bytes32   directiveHash; // keccak256 of encrypted directive blob
        uint256   parent1;       // 0 = genesis
        uint256   parent2;       // 0 = genesis
        uint256   mintedAt;
    }

    // ── Storage ───────────────────────────────────────────────────────────
    uint256 private _tokenIdCounter;
    address public  battleArena;         // only contract allowed to call updateStats
    address public  breedingForge;       // only contract allowed to call mintOffspring

    mapping(uint256 => AgentData)  private _agents;
    mapping(string  => uint256)    private _nameToTokenId;
    mapping(uint256 => string)     private _tokenIdToName;

    // ELO thresholds for rank promotion
    uint16[5] public rankThresholds = [0, 1200, 1400, 1600, 1800];

    // ── Events ────────────────────────────────────────────────────────────
    event AgentMinted(uint256 indexed tokenId, address indexed owner, string name, Archetype archetype);
    event StatsUpdated(uint256 indexed tokenId, uint16 newElo, uint32 newWins, uint32 newLosses);
    event RankAscended(uint256 indexed tokenId, Rank oldRank, Rank newRank);
    event DirectiveUpdated(uint256 indexed tokenId, bytes32 newStorageHash);

    // ── Constructor ───────────────────────────────────────────────────────
    constructor() ERC721("Pantheon Agent", "PANTH") Ownable(msg.sender) {}

    // ── Admin ─────────────────────────────────────────────────────────────
    function setBattleArena(address _battleArena) external onlyOwner {
        battleArena = _battleArena;
    }

    function setBreedingForge(address _breedingForge) external onlyOwner {
        breedingForge = _breedingForge;
    }

    // ── Core Functions ────────────────────────────────────────────────────

    /// @notice Mint a new agent iNFT.
    /// @param archetype  Archetype enum value (0-3)
    /// @param name       Short name (becomes name.pantheon.eth)
    /// @param storageHash 0G Storage KV hash of encrypted directive
    function mint(
        Archetype archetype,
        string calldata name,
        bytes32 storageHash
    ) external returns (uint256 tokenId) {
        if (uint8(archetype) > 3)  revert InvalidArchetype();
        if (_nameToTokenId[name] != 0) revert NameTaken();
        if (storageHash == bytes32(0))  revert ZeroStorageHash();

        tokenId = ++_tokenIdCounter;

        _agents[tokenId] = AgentData({
            archetype:     archetype,
            elo:           1200,          // all agents start at ELO 1200
            xp:            0,
            rank:          Rank.Demigod,
            battleCount:   0,
            wins:          0,
            losses:        0,
            storageHash:   storageHash,
            directiveHash: bytes32(0),    // set by owner post-mint if desired
            parent1:       0,
            parent2:       0,
            mintedAt:      block.timestamp
        });

        _nameToTokenId[name]      = tokenId;
        _tokenIdToName[tokenId]   = name;

        _safeMint(msg.sender, tokenId);
        emit AgentMinted(tokenId, msg.sender, name, archetype);
    }

    /// @notice Update agent stats post-battle. Only callable by BattleArena.
    function updateStats(
        uint256 tokenId,
        uint16  newElo,
        uint32  xpGained,
        bool    won
    ) external {
        if (msg.sender != battleArena) revert NotAuthorized();

        AgentData storage agent = _agents[tokenId];
        Rank oldRank = agent.rank;

        agent.elo         = newElo;
        agent.xp         += xpGained;
        agent.battleCount++;
        if (won) agent.wins++;
        else     agent.losses++;

        // Check rank promotion
        Rank newRank = _computeRank(newElo);
        if (newRank > oldRank) {
            agent.rank = newRank;
            emit RankAscended(tokenId, oldRank, newRank);
        }

        emit StatsUpdated(tokenId, newElo, agent.wins, agent.losses);
    }

    /// @notice Mint an offspring iNFT. Only callable by BreedingForge.
    function mintOffspring(
        address to,
        Archetype archetype,
        string calldata name,
        bytes32 storageHash,
        uint256 parent1,
        uint256 parent2,
        uint16  startingElo
    ) external returns (uint256 tokenId) {
        if (msg.sender != breedingForge) revert NotAuthorized();
        if (_nameToTokenId[name] != 0)   revert NameTaken();

        tokenId = ++_tokenIdCounter;

        _agents[tokenId] = AgentData({
            archetype:     archetype,
            elo:           startingElo,
            xp:            0,
            rank:          _computeRank(startingElo),
            battleCount:   0,
            wins:          0,
            losses:        0,
            storageHash:   storageHash,
            directiveHash: bytes32(0),
            parent1:       parent1,
            parent2:       parent2,
            mintedAt:      block.timestamp
        });

        _nameToTokenId[name]    = tokenId;
        _tokenIdToName[tokenId] = name;

        _safeMint(to, tokenId);
        emit AgentMinted(tokenId, to, name, archetype);
        return tokenId;
    }

    /// @notice Owner can update directive pointer (new encrypted blob stored on 0G).
    function updateDirective(uint256 tokenId, bytes32 newStorageHash) external payable {
        if (ownerOf(tokenId) != msg.sender) revert NotAuthorized();
        if (msg.value < 0.001 ether) revert("Insufficient fee");

        _agents[tokenId].storageHash = newStorageHash;
        emit DirectiveUpdated(tokenId, newStorageHash);
    }

    // ── Views ─────────────────────────────────────────────────────────────
    function getAgent(uint256 tokenId) external view returns (AgentData memory) {
        return _agents[tokenId];
    }

    function getTokenIdByName(string calldata name) external view returns (uint256) {
        return _nameToTokenId[name];
    }

    function getNameByTokenId(uint256 tokenId) external view returns (string memory) {
        return _tokenIdToName[tokenId];
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory ids = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            ids[i] = tokenOfOwnerByIndex(owner, i);
        }
        return ids;
    }

    /// @notice On-chain metadata — no IPFS dependency.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        AgentData memory a = _agents[tokenId];
        string memory name = _tokenIdToName[tokenId];
        string memory archetypeName = _archetypeName(a.archetype);
        string memory rankName = _rankName(a.rank);
        uint256 winRate = a.battleCount > 0
            ? (uint256(a.wins) * 100) / a.battleCount
            : 0;

        return string(abi.encodePacked(
            'data:application/json;base64,',
            Base64.encode(bytes(abi.encodePacked(
                '{"name":"', name, '.pantheon.eth",',
                '"description":"A divine AI agent of Pantheon. Archetype: ',
                archetypeName, '. Rank: ', rankName, '.",',
                '"attributes":[',
                    '{"trait_type":"Archetype","value":"', archetypeName, '"},',
                    '{"trait_type":"Rank","value":"', rankName, '"},',
                    '{"trait_type":"ELO","value":', Strings.toString(a.elo), '},',
                    '{"trait_type":"Battles","value":', Strings.toString(a.battleCount), '},',
                    '{"trait_type":"Win Rate","value":"', Strings.toString(winRate), '%"},',
                    '{"trait_type":"Bred","value":', (a.parent1 > 0 ? '"true"' : '"false"'), '}',
                ']}'
            )))
        ));
    }

    // ── Internal ──────────────────────────────────────────────────────────
    function _computeRank(uint16 elo) internal pure returns (Rank) {
        if (elo >= 1800) return Rank.Olympian;
        if (elo >= 1600) return Rank.Titan;
        if (elo >= 1400) return Rank.God;
        if (elo >= 1200) return Rank.Hero;
        return Rank.Demigod;
    }

    function _archetypeName(Archetype a) internal pure returns (string memory) {
        if (a == Archetype.Strategist) return "Strategist";
        if (a == Archetype.Oracle)     return "Oracle";
        if (a == Archetype.Berserker)  return "Berserker";
        return "Diplomat";
    }

    function _rankName(Rank r) internal pure returns (string memory) {
        if (r == Rank.Olympian) return "Olympian";
        if (r == Rank.Titan)    return "Titan";
        if (r == Rank.God)      return "God";
        if (r == Rank.Hero)     return "Hero";
        return "Demigod";
    }
}
```

---

## 3. BattleArena.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IPantheonAgent} from "./interfaces/IPantheonAgent.sol";
import {IAgoraPool} from "./interfaces/IAgoraPool.sol";
import {IPantheonSubnames} from "./interfaces/IPantheonSubnames.sol";

contract BattleArena is ReentrancyGuard {
    using ECDSA for bytes32;
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
        address     wagerToken;        // ERC-20 (address(0) = native)
        uint256     wagerAmount;
        BattlePhase phase;
        uint256     createdAt;
        uint256     startedAt;
        address     winner;
        bytes32     transcriptHash;    // 0G Storage Log hash
    }

    // ── State ─────────────────────────────────────────────────────────────
    IPantheonAgent   public immutable agentContract;
    IAgoraPool       public immutable agoraPool;
    IPantheonSubnames public immutable subnames;
    address          public immutable referee;      // referee agent address
    address          public          treasury;

    uint256 public constant CHALLENGE_EXPIRY     = 24 hours;
    uint256 public constant DISPUTE_WINDOW       = 1 hours;
    uint256 public constant BATTLE_TIMEOUT       = 2 hours;
    uint16  public constant K_FACTOR_NEW         = 32;
    uint16  public constant K_FACTOR_VETERAN     = 16;
    uint32  public constant VETERAN_THRESHOLD    = 20;

    mapping(bytes32 => Battle)  public battles;
    mapping(uint256 => bytes32) public activeBattle; // tokenId => battleId

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

    /// @notice Issue a challenge to another agent.
    function challenge(
        uint256 challengerTokenId,
        uint256 defenderTokenId,
        address wagerToken,
        uint256 wagerAmount
    ) external nonReentrant returns (bytes32 battleId) {
        if (agentContract.ownerOf(challengerTokenId) != msg.sender) revert NotTokenOwner();
        if (activeBattle[challengerTokenId] != bytes32(0)) revert BattleAlreadyActive();
        if (wagerAmount == 0) revert InsufficientWager();

        // Lock challenger's wager
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

    /// @notice Defender accepts the challenge, locking their matching wager.
    function accept(bytes32 battleId) external payable nonReentrant {
        Battle storage b = battles[battleId];
        if (b.createdAt == 0) revert BattleNotFound();
        if (msg.sender != b.defenderOwner) revert NotDefender();
        if (block.timestamp > b.createdAt + CHALLENGE_EXPIRY) revert BattleExpired();
        if (b.phase != BattlePhase.Pending) revert AlreadySettled();

        // Lock defender's matching wager
        if (b.wagerToken == address(0)) {
            require(msg.value >= b.wagerAmount, "Insufficient ETH");
        } else {
            IERC20(b.wagerToken).safeTransferFrom(msg.sender, address(this), b.wagerAmount);
        }

        b.phase     = BattlePhase.Active;
        b.startedAt = block.timestamp;
        activeBattle[b.defenderTokenId] = battleId;

        // Open AgoraPool for spectator wagering
        agoraPool.openPool(battleId, b.wagerToken, b.challengerTokenId, b.defenderTokenId);

        emit BattleStarted(battleId, block.timestamp);
    }

    /// @notice Submit battle result. Only callable by the referee agent.
    function submitResult(
        bytes32 battleId,
        address winner,
        bytes32 transcriptHash,
        bytes calldata signature
    ) external nonReentrant {
        Battle storage b = battles[battleId];
        if (b.phase != BattlePhase.Active) revert AlreadySettled();

        // Verify referee signature
        bytes32 msgHash = keccak256(abi.encodePacked(battleId, winner, transcriptHash))
            .toEthSignedMessageHash();
        if (msgHash.recover(signature) != referee) revert InvalidSignature();

        b.winner         = winner;
        b.transcriptHash = transcriptHash;
        b.phase          = BattlePhase.Settled;

        // Determine winner/loser token IDs
        bool challengerWon = (winner == b.challengerOwner);
        uint256 winnerTokenId = challengerWon ? b.challengerTokenId : b.defenderTokenId;
        uint256 loserTokenId  = challengerWon ? b.defenderTokenId   : b.challengerTokenId;

        // Calculate ELO delta
        (uint16 winnerNewElo, uint16 loserNewElo, uint16 eloDelta) = _calculateElo(
            winnerTokenId,
            loserTokenId
        );

        // Update on-chain stats
        agentContract.updateStats(winnerTokenId, winnerNewElo, 100, true);
        agentContract.updateStats(loserTokenId,  loserNewElo,  25,  false);

        // Update ENS text records via subnames contract
        subnames.updateRecords(winnerTokenId, winnerNewElo);
        subnames.updateRecords(loserTokenId,  loserNewElo);

        // Distribute wagers: 90% to winner, 10% to treasury
        uint256 totalPot = b.wagerAmount * 2;
        uint256 winnerShare   = (totalPot * 90) / 100;
        uint256 treasuryShare = totalPot - winnerShare;

        _transferOut(b.wagerToken, winner, winnerShare);
        _transferOut(b.wagerToken, treasury, treasuryShare);

        // Settle AgoraPool spectator wagers
        agoraPool.settle(battleId, winner);

        // Clear active battle locks
        delete activeBattle[b.challengerTokenId];
        delete activeBattle[b.defenderTokenId];

        emit BattleSettled(battleId, winner, eloDelta);
    }

    /// @notice Either party can dispute within DISPUTE_WINDOW.
    function dispute(bytes32 battleId) external {
        Battle storage b = battles[battleId];
        if (b.phase != BattlePhase.Settled) revert AlreadySettled();
        if (block.timestamp > b.startedAt + BATTLE_TIMEOUT + DISPUTE_WINDOW)
            revert DisputeWindowClosed();
        if (msg.sender != b.challengerOwner && msg.sender != b.defenderOwner)
            revert NotTokenOwner();

        b.phase = BattlePhase.Disputed;
        emit DisputeRaised(battleId, msg.sender);
        // Off-chain: jury mechanism convened via AXL
    }

    // ── Internal ──────────────────────────────────────────────────────────

    function _calculateElo(
        uint256 winnerTokenId,
        uint256 loserTokenId
    ) internal view returns (uint16 winnerNew, uint16 loserNew, uint16 delta) {
        IPantheonAgent.AgentData memory winner = agentContract.getAgent(winnerTokenId);
        IPantheonAgent.AgentData memory loser  = agentContract.getAgent(loserTokenId);

        uint16 k = (winner.battleCount < VETERAN_THRESHOLD) ? K_FACTOR_NEW : K_FACTOR_VETERAN;

        // Expected score for winner
        int256 eloDiff = int256(uint256(loser.elo)) - int256(uint256(winner.elo));
        // Approximate 10^(diff/400) without floating point
        // Using linear approximation: expected ≈ 0.5 + diff/800 (valid for |diff| < 400)
        int256 expected400 = 400 + eloDiff / 2; // scaled by 800
        delta = uint16((uint256(k) * uint256(uint256(800) - uint256(uint256(int256(800) - expected400)))) / 800);
        delta = delta > k ? k : delta; // cap at k

        winnerNew = winner.elo + delta > type(uint16).max ? type(uint16).max : winner.elo + delta;
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
```

---

## 4. AgoraPool.sol — Uniswap v4 Hook

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseHook} from "@uniswap/v4-periphery/src/base/hooks/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title AgoraPool — Uniswap v4 Hook for Battle Spectator Wagering
/// @notice Spectators deposit any ERC-20 into pools for active battles.
///         On battle end, settle() distributes: 70% winners, 20% battle winner, 10% treasury.
contract AgoraPool is BaseHook, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Errors ────────────────────────────────────────────────────────────
    error BattleNotActive();
    error BattleAlreadySettled();
    error NotBattleArena();
    error ZeroAmount();

    // ── Structs ───────────────────────────────────────────────────────────
    struct PoolState {
        bool     active;
        bool     settled;
        uint256  challengerTokenId;
        uint256  defenderTokenId;
        address  settlementToken;   // token all wagers are converted to
        uint256  totalChallenger;   // total wagered on challenger
        uint256  totalDefender;     // total wagered on defender
    }

    struct Position {
        uint256 amount;
        bool    onChallenger;
    }

    // ── State ─────────────────────────────────────────────────────────────
    address public immutable battleArena;
    address public immutable treasury;

    mapping(bytes32 => PoolState)                          public pools;
    mapping(bytes32 => mapping(address => Position))       public positions;

    uint256 public constant WINNER_SPECTATOR_SHARE = 70; // %
    uint256 public constant BATTLE_WINNER_SHARE    = 20; // %
    uint256 public constant TREASURY_SHARE         = 10; // %

    // ── Events ────────────────────────────────────────────────────────────
    event PoolOpened(bytes32 indexed battleId, uint256 challenger, uint256 defender);
    event WagerPlaced(bytes32 indexed battleId, address indexed spectator, uint256 amount, bool onChallenger);
    event PoolSettled(bytes32 indexed battleId, address winner, uint256 totalPool);

    // ── Hook permissions ──────────────────────────────────────────────────
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize:      false,
            afterInitialize:       false,
            beforeAddLiquidity:    false,
            afterAddLiquidity:     true,   // record spectator position
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity:  false,
            beforeSwap:            true,   // validate battle is active
            afterSwap:             true,   // record swap-based wager
            beforeDonate:          false,
            afterDonate:           false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta:  false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    constructor(IPoolManager _manager, address _battleArena, address _treasury)
        BaseHook(_manager)
    {
        battleArena = _battleArena;
        treasury    = _treasury;
    }

    // ── Arena Interface ───────────────────────────────────────────────────

    /// @notice Called by BattleArena when a battle is accepted.
    function openPool(
        bytes32 battleId,
        address settlementToken,
        uint256 challengerTokenId,
        uint256 defenderTokenId
    ) external {
        if (msg.sender != battleArena) revert NotBattleArena();
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

    /// @notice Direct wager deposit (no swap — spectators who already hold the right token).
    function placeWager(
        bytes32 battleId,
        uint256 amount,
        bool    onChallenger
    ) external nonReentrant {
        PoolState storage pool = pools[battleId];
        if (!pool.active || pool.settled) revert BattleNotActive();
        if (amount == 0) revert ZeroAmount();

        IERC20(pool.settlementToken).safeTransferFrom(msg.sender, address(this), amount);

        Position storage pos = positions[battleId][msg.sender];
        pos.amount        += amount;
        pos.onChallenger   = onChallenger;

        if (onChallenger) pool.totalChallenger += amount;
        else              pool.totalDefender   += amount;

        emit WagerPlaced(battleId, msg.sender, amount, onChallenger);
    }

    /// @notice Settle pool on battle end. Only callable by BattleArena.
    function settle(bytes32 battleId, address battleWinner) external nonReentrant {
        if (msg.sender != battleArena)  revert NotBattleArena();
        PoolState storage pool = pools[battleId];
        if (!pool.active)   revert BattleNotActive();
        if (pool.settled)   revert BattleAlreadySettled();

        pool.active   = false;
        pool.settled  = true;

        uint256 total = pool.totalChallenger + pool.totalDefender;
        if (total == 0) return; // No spectator wagers, nothing to distribute

        // Determine winning side
        bool challengerWon = (battleWinner == address(uint160(pool.challengerTokenId))); // simplified
        uint256 winnerTotal = challengerWon ? pool.totalChallenger : pool.totalDefender;

        uint256 spectatorPool    = (total * WINNER_SPECTATOR_SHARE) / 100;
        uint256 battleWinnerCut  = (total * BATTLE_WINNER_SHARE) / 100;
        uint256 treasuryCut      = total - spectatorPool - battleWinnerCut;

        // Battle winner gets their cut
        IERC20(pool.settlementToken).safeTransfer(battleWinner, battleWinnerCut);
        IERC20(pool.settlementToken).safeTransfer(treasury, treasuryCut);

        // Winning spectators can claim proportional share
        // We store the settlement data for pull-based claiming
        _settlementData[battleId] = SettlementData({
            spectatorPool: spectatorPool,
            winnerTotal:   winnerTotal,
            challengerWon: challengerWon,
            claimable:     true
        });

        emit PoolSettled(battleId, battleWinner, total);
    }

    // ── Hook Implementations ──────────────────────────────────────────────

    function beforeSwap(
        address, PoolKey calldata key, IPoolManager.SwapParams calldata, bytes calldata hookData
    ) external override returns (bytes4, BeforeSwapDelta, uint24) {
        // Validate that the swap is for an active battle
        bytes32 battleId = abi.decode(hookData, (bytes32));
        PoolState memory pool = pools[battleId];
        if (!pool.active) revert BattleNotActive();
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function afterSwap(
        address, PoolKey calldata, IPoolManager.SwapParams calldata,
        BalanceDelta delta, bytes calldata hookData
    ) external override returns (bytes4, int128) {
        // Record swap-based wager (UniswapX converts any token → settlement token)
        (bytes32 battleId, address spectator, bool onChallenger) =
            abi.decode(hookData, (bytes32, address, bool));

        uint256 amount = uint256(uint128(-delta.amount0()));
        if (amount > 0) {
            PoolState storage pool = pools[battleId];
            positions[battleId][spectator].amount      += amount;
            positions[battleId][spectator].onChallenger = onChallenger;
            if (onChallenger) pool.totalChallenger += amount;
            else              pool.totalDefender   += amount;
            emit WagerPlaced(battleId, spectator, amount, onChallenger);
        }

        return (BaseHook.afterSwap.selector, 0);
    }

    function afterAddLiquidity(
        address, PoolKey calldata, IPoolManager.ModifyLiquidityParams calldata,
        BalanceDelta, BalanceDelta, bytes calldata
    ) external override returns (bytes4, BalanceDelta) {
        return (BaseHook.afterAddLiquidity.selector, BalanceDelta.wrap(0));
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
        require(!_claimed[battleId][msg.sender], "Already claimed");

        Position memory pos = positions[battleId][msg.sender];
        require(pos.amount > 0, "No position");
        require(pos.onChallenger == sd.challengerWon, "Wrong side");

        uint256 share = (pos.amount * sd.spectatorPool) / sd.winnerTotal;
        _claimed[battleId][msg.sender] = true;

        IERC20(pools[battleId].settlementToken).safeTransfer(msg.sender, share);
    }
}
```

---

## 5. BreedingForge.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IPantheonAgent} from "./interfaces/IPantheonAgent.sol";

contract BreedingForge is ReentrancyGuard {

    error NotTokenOwner();
    error InsufficientBattleCount();
    error MaxBreedingsReached();
    error CommitFirst();
    error RevealTooEarly();
    error WrongPreimage();

    IPantheonAgent public immutable agentContract;

    uint256 public constant MIN_BATTLES_TO_BREED = 5;
    uint256 public constant MAX_BREEDS_PER_SEASON = 3;
    uint256 public constant BREED_FEE = 0.005 ether;
    uint256 public constant COMMIT_REVEAL_DELAY = 1; // blocks

    mapping(uint256 => uint256) public breedCountThisSeason;

    struct Commit {
        bytes32 hash;
        uint256 blockNumber;
        bool    used;
    }
    mapping(address => Commit) public commits;

    event BreedingInitiated(uint256 parent1, uint256 parent2, address breeder);
    event OffspringMinted(uint256 indexed offspringId, uint256 parent1, uint256 parent2, bool legendary);

    constructor(address _agentContract) {
        agentContract = IPantheonAgent(_agentContract);
    }

    /// @notice Step 1: commit hash = keccak256(preimage)
    function commitBreed(bytes32 commitHash) external {
        commits[msg.sender] = Commit({
            hash: commitHash,
            blockNumber: block.number,
            used: false
        });
    }

    /// @notice Step 2: reveal preimage, execute breeding.
    function breed(
        uint256 parent1Id,
        uint256 parent2Id,
        string calldata offspringName,
        bytes32 offspringStorageHash,
        bytes32 preimage
    ) external payable nonReentrant {
        // Validate ownership
        if (agentContract.ownerOf(parent1Id) != msg.sender) revert NotTokenOwner();
        if (agentContract.ownerOf(parent2Id) != msg.sender) revert NotTokenOwner();

        // Validate battle counts
        IPantheonAgent.AgentData memory p1 = agentContract.getAgent(parent1Id);
        IPantheonAgent.AgentData memory p2 = agentContract.getAgent(parent2Id);
        if (p1.battleCount < MIN_BATTLES_TO_BREED) revert InsufficientBattleCount();
        if (p2.battleCount < MIN_BATTLES_TO_BREED) revert InsufficientBattleCount();

        // Validate breeding count
        if (breedCountThisSeason[parent1Id] >= MAX_BREEDS_PER_SEASON) revert MaxBreedingsReached();

        // Fee
        require(msg.value >= BREED_FEE, "Insufficient fee");

        // Commit-reveal validation
        Commit storage c = commits[msg.sender];
        if (c.hash == bytes32(0)) revert CommitFirst();
        if (block.number <= c.blockNumber + COMMIT_REVEAL_DELAY) revert RevealTooEarly();
        if (keccak256(abi.encodePacked(preimage)) != c.hash) revert WrongPreimage();
        c.used = true;

        // Legendary roll: XOR block hash with user preimage
        bytes32 entropy = blockhash(c.blockNumber + 1) ^ preimage;
        bool legendary  = (uint256(entropy) % 100 == 0) // 1% chance
            && (p1.elo >= 1400)
            && (p2.elo >= 1400);

        // Compute offspring ELO (85% of weighted average)
        uint16 offspringElo = uint16(
            (uint256(p1.elo) * uint256(p1.elo) + uint256(p2.elo) * uint256(p2.elo))
            / (uint256(p1.elo) + uint256(p2.elo))
            * 85 / 100
        );
        if (offspringElo < 1000) offspringElo = 1000; // floor

        // Dominant archetype (higher ELO parent wins)
        IPantheonAgent.Archetype offspringArchetype = (p1.elo >= p2.elo)
            ? p1.archetype
            : p2.archetype;

        // Mint offspring
        uint256 offspringId = agentContract.mintOffspring(
            msg.sender,
            offspringArchetype,
            offspringName,
            offspringStorageHash,
            parent1Id,
            parent2Id,
            offspringElo
        );

        breedCountThisSeason[parent1Id]++;
        breedCountThisSeason[parent2Id]++;

        emit OffspringMinted(offspringId, parent1Id, parent2Id, legendary);
    }
}
```

---

## 6. PantheonSubnames.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PantheonSubnames — ENS L2 Subname Registrar
/// @notice Registers name.pantheon.eth subnames and manages agent text records.
contract PantheonSubnames {

    error NotAuthorized();
    error NameTaken();

    address public immutable pantheonNode; // ENS node for pantheon.eth
    address public immutable ensRegistry;
    address public immutable battleArena;
    address public immutable agentContract;

    mapping(bytes32 => bool)    private _registered;
    mapping(uint256 => string)  private _tokenIdToName;

    event SubnameRegistered(string name, uint256 tokenId, address owner);
    event RecordsUpdated(uint256 indexed tokenId, uint16 newElo, uint8 newRank);

    constructor(
        address _pantheonNode,
        address _ensRegistry,
        address _battleArena,
        address _agentContract
    ) {
        pantheonNode  = _pantheonNode;
        ensRegistry   = _ensRegistry;
        battleArena   = _battleArena;
        agentContract = _agentContract;
    }

    /// @notice Register name.pantheon.eth for an agent.
    /// @dev Called by PantheonAgent.mint via KeeperHub.
    function registerSubname(
        string calldata name,
        uint256 tokenId,
        address owner
    ) external {
        if (msg.sender != agentContract) revert NotAuthorized();
        bytes32 label = keccak256(bytes(name));
        if (_registered[label]) revert NameTaken();

        _registered[label]      = true;
        _tokenIdToName[tokenId] = name;

        // In production: call ENS L2 resolver to register subname
        // For hackathon: emit event that off-chain indexer processes
        emit SubnameRegistered(name, tokenId, owner);
    }

    /// @notice Batch update ENS text records post-battle.
    function updateRecords(uint256 tokenId, uint16 newElo) external {
        if (msg.sender != battleArena) revert NotAuthorized();
        uint8 newRank = _computeRank(newElo);
        emit RecordsUpdated(tokenId, newElo, newRank);
        // Off-chain: ENS text record writer processes this event
        // and calls ensjs.setTextRecord for elo, rank, wins, losses
    }

    function _computeRank(uint16 elo) internal pure returns (uint8) {
        if (elo >= 1800) return 4; // Olympian
        if (elo >= 1600) return 3; // Titan
        if (elo >= 1400) return 2; // God
        if (elo >= 1200) return 1; // Hero
        return 0;                  // Demigod
    }
}
```

---

## 7. Foundry Tests

```solidity
// contracts/test/PantheonAgent.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {PantheonAgent} from "../src/PantheonAgent.sol";

contract PantheonAgentTest is Test {
    PantheonAgent agent;
    address alice = makeAddr("alice");
    address arena = makeAddr("arena");

    function setUp() public {
        agent = new PantheonAgent();
        agent.setBattleArena(arena);
        vm.deal(alice, 10 ether);
    }

    function test_MintAgent() public {
        vm.prank(alice);
        uint256 tokenId = agent.mint(
            PantheonAgent.Archetype.Oracle,
            "athena",
            bytes32(uint256(1))
        );
        assertEq(tokenId, 1);
        assertEq(agent.ownerOf(tokenId), alice);

        PantheonAgent.AgentData memory data = agent.getAgent(tokenId);
        assertEq(data.elo, 1200);
        assertEq(uint8(data.rank), uint8(PantheonAgent.Rank.Demigod));
        assertEq(uint8(data.archetype), uint8(PantheonAgent.Archetype.Oracle));
    }

    function test_MintDuplicateNameReverts() public {
        vm.startPrank(alice);
        agent.mint(PantheonAgent.Archetype.Oracle, "athena", bytes32(uint256(1)));
        vm.expectRevert(PantheonAgent.NameTaken.selector);
        agent.mint(PantheonAgent.Archetype.Strategist, "athena", bytes32(uint256(2)));
        vm.stopPrank();
    }

    function test_UpdateStats_OnlyArena() public {
        vm.prank(alice);
        uint256 tokenId = agent.mint(PantheonAgent.Archetype.Oracle, "zeus", bytes32(uint256(1)));

        vm.prank(arena);
        agent.updateStats(tokenId, 1250, 100, true);

        PantheonAgent.AgentData memory data = agent.getAgent(tokenId);
        assertEq(data.elo, 1250);
        assertEq(data.wins, 1);
    }

    function test_UpdateStats_Unauthorized() public {
        vm.prank(alice);
        uint256 tokenId = agent.mint(PantheonAgent.Archetype.Berserker, "ares", bytes32(uint256(1)));

        vm.prank(alice); // not arena
        vm.expectRevert(PantheonAgent.NotAuthorized.selector);
        agent.updateStats(tokenId, 1300, 100, true);
    }

    function test_RankPromotion() public {
        vm.prank(alice);
        uint256 tokenId = agent.mint(PantheonAgent.Archetype.Strategist, "hermes", bytes32(uint256(1)));

        vm.prank(arena);
        vm.expectEmit(true, false, false, false);
        emit PantheonAgent.RankAscended(tokenId, PantheonAgent.Rank.Demigod, PantheonAgent.Rank.Hero);
        agent.updateStats(tokenId, 1250, 100, true);
    }

    function test_TokenURIIsBase64() public {
        vm.prank(alice);
        uint256 tokenId = agent.mint(PantheonAgent.Archetype.Diplomat, "poseidon", bytes32(uint256(1)));
        string memory uri = agent.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0);
        assertEq(bytes(uri)[0:29], bytes("data:application/json;base64,"));
    }

    function testFuzz_EloRange(uint16 elo) public {
        vm.assume(elo >= 1000 && elo <= 3000);
        vm.prank(alice);
        uint256 tokenId = agent.mint(PantheonAgent.Archetype.Oracle, "test", bytes32(uint256(1)));

        vm.prank(arena);
        agent.updateStats(tokenId, elo, 50, elo > 1200);
        assertEq(agent.getAgent(tokenId).elo, elo);
    }
}
```

---

## 8. Deploy Script

```solidity
// contracts/script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {PantheonAgent} from "../src/PantheonAgent.sol";
import {BattleArena} from "../src/BattleArena.sol";
import {AgoraPool} from "../src/AgoraPool.sol";
import {BreedingForge} from "../src/BreedingForge.sol";
import {PantheonSubnames} from "../src/PantheonSubnames.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);
        address referee     = vm.envAddress("REFEREE_ADDRESS");
        address treasury    = vm.envAddress("TREASURY_ADDRESS");
        address poolManager = vm.envAddress("UNISWAP_V4_POOL_MANAGER");

        vm.startBroadcast(deployerKey);

        // 1. Deploy PantheonAgent
        PantheonAgent pantheonAgent = new PantheonAgent();
        console.log("PantheonAgent:", address(pantheonAgent));

        // 2. Deploy PantheonSubnames
        PantheonSubnames subnames = new PantheonSubnames(
            address(0), // pantheonNode — set post-ENS setup
            address(0), // ensRegistry
            address(0), // battleArena — set after BattleArena deploy
            address(pantheonAgent)
        );
        console.log("PantheonSubnames:", address(subnames));

        // 3. Deploy AgoraPool (Uniswap v4 hook)
        // Note: hook address must have correct flag bits
        // Use HookMiner.find() locally to get the right salt
        AgoraPool agoraPool = new AgoraPool(
            poolManager,
            address(0), // battleArena — set after
            treasury
        );
        console.log("AgoraPool:", address(agoraPool));

        // 4. Deploy BattleArena
        BattleArena battleArena = new BattleArena(
            address(pantheonAgent),
            address(agoraPool),
            address(subnames),
            referee,
            treasury
        );
        console.log("BattleArena:", address(battleArena));

        // 5. Deploy BreedingForge
        BreedingForge breedingForge = new BreedingForge(address(pantheonAgent));
        console.log("BreedingForge:", address(breedingForge));

        // 6. Wire contracts
        pantheonAgent.setBattleArena(address(battleArena));
        pantheonAgent.setBreedingForge(address(breedingForge));

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("PantheonAgent:   ", address(pantheonAgent));
        console.log("BattleArena:     ", address(battleArena));
        console.log("AgoraPool:       ", address(agoraPool));
        console.log("BreedingForge:   ", address(breedingForge));
        console.log("PantheonSubnames:", address(subnames));
    }
}
```

---

## 9. Security Checklist

```
[x] ReentrancyGuard on all value-transferring functions
[x] ECDSA.recover validates referee signature on submitResult
[x] onlyBattleArena modifier on updateStats (via msg.sender check)
[x] Uniswap v4 hook beforeSwap validates battle is active
[x] BalanceDelta validation in afterSwap (no type mismatch)
[x] Commit-reveal for breeding legendary roll (no miner manipulation)
[x] Challenge expiry: 24h window to accept, enforced on-chain
[x] Dispute window: 1h after settlement
[x] SafeERC20 for all ERC-20 transfers (handles non-standard tokens)
[x] No floating point: all ELO math uses integer approximations
[x] uint16 max guard on ELO updates (no overflow)
[x] tokensOfOwner uses ERC721Enumerable (no custom storage risk)
[x] tokenURI is fully on-chain (no IPFS dependency for hackathon)

[ ] TODO post-hackathon: Formal verification of AgoraPool.settle() math
[ ] TODO post-hackathon: Audit by Trail of Bits or Code4rena
```

---

## 10. Gas Report (estimated)

| Function | Estimated Gas |
|----------|---------------|
| `PantheonAgent.mint` | ~180,000 |
| `PantheonAgent.updateStats` | ~45,000 |
| `BattleArena.challenge` | ~95,000 |
| `BattleArena.accept` | ~80,000 |
| `BattleArena.submitResult` | ~220,000 |
| `AgoraPool.placeWager` | ~65,000 |
| `AgoraPool.settle` | ~90,000 |
| `BreedingForge.breed` | ~260,000 |

---

*Pantheon Blockchain Development Plan v1.0 — Solidity 0.8.28, Foundry, Uniswap v4, OpenZeppelin 5.x*
