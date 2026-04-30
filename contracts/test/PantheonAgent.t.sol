// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {PantheonAgent} from "../src/PantheonAgent.sol";

contract PantheonAgentTest is Test {
    PantheonAgent agent;
    address alice = makeAddr("alice");
    address arena = makeAddr("arena");
    address forge = makeAddr("forge");

    function setUp() public {
        agent = new PantheonAgent();
        agent.setBattleArena(arena);
        agent.setBreedingForge(forge);
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
