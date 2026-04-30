// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {AgoraPool} from "../src/AgoraPool.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

contract AgoraPoolTest is Test {
    AgoraPool pool;
    address arena = makeAddr("arena");
    address treasury = makeAddr("treasury");

    function setUp() public {
        // Mock IPoolManager for test compilation
        IPoolManager manager = IPoolManager(makeAddr("poolManager"));
        pool = new AgoraPool(manager, arena, treasury);
    }

    function test_OpenPoolOnlyArena() public {
        vm.prank(makeAddr("notArena"));
        vm.expectRevert(AgoraPool.NotBattleArena.selector);
        pool.openPool(bytes32(uint256(1)), makeAddr("token"), 1, 2);
    }

    function test_OpenPool() public {
        bytes32 battleId = bytes32(uint256(1));
        address token = makeAddr("token");
        
        vm.prank(arena);
        pool.openPool(battleId, token, 1, 2);

        (bool active, bool settled, uint256 challenger, uint256 defender, address t, uint256 tc, uint256 td) = pool.pools(battleId);
        assertTrue(active);
        assertFalse(settled);
        assertEq(challenger, 1);
        assertEq(defender, 2);
        assertEq(t, token);
        assertEq(tc, 0);
        assertEq(td, 0);
    }
}
