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
        address, PoolKey calldata, IPoolManager.SwapParams calldata, bytes calldata hookData
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
