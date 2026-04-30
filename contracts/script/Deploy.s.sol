// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {PantheonAgent} from "../src/PantheonAgent.sol";
import {BattleArena} from "../src/BattleArena.sol";
import {AgoraPool} from "../src/AgoraPool.sol";
import {BreedingForge} from "../src/BreedingForge.sol";
import {PantheonSubnames} from "../src/PantheonSubnames.sol";

// Mock IPoolManager for deployment compilation since we don't have Uniswap V4 repo pulled in fully
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address referee     = vm.envAddress("REFEREE_ADDRESS");
        address treasury    = vm.envAddress("TREASURY_ADDRESS");
        address poolManager = vm.envAddress("UNISWAP_V4_POOL_MANAGER");

        vm.startBroadcast(deployerKey);

        // 1. Deploy PantheonAgent
        PantheonAgent pantheonAgent = new PantheonAgent();
        console.log("PantheonAgent:", address(pantheonAgent));

        // 2. Deploy PantheonSubnames
        PantheonSubnames subnames = new PantheonSubnames(
            address(0), // pantheonNode
            address(0), // ensRegistry
            address(0), // battleArena
            address(pantheonAgent)
        );
        console.log("PantheonSubnames:", address(subnames));

        // 3. Deploy AgoraPool
        AgoraPool agoraPool = new AgoraPool(
            IPoolManager(poolManager),
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
