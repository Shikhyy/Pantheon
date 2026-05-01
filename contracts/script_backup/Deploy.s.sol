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
        address referee     = vm.envAddress("REFEREE_ADDRESS");
        address treasury    = vm.envAddress("TREASURY_ADDRESS");

        vm.startBroadcast(deployerKey);

        PantheonAgent pantheonAgent = new PantheonAgent();
        console.log("PantheonAgent:", address(pantheonAgent));

        PantheonSubnames subnames = new PantheonSubnames(
            address(0),
            address(0),
            address(0),
            address(pantheonAgent)
        );
        console.log("PantheonSubnames:", address(subnames));

        AgoraPool agoraPool = new AgoraPool(treasury);
        console.log("AgoraPool:", address(agoraPool));

        BattleArena battleArena = new BattleArena(
            address(pantheonAgent),
            address(agoraPool),
            address(subnames),
            referee,
            treasury
        );
        console.log("BattleArena:", address(battleArena));

        BreedingForge breedingForge = new BreedingForge(address(pantheonAgent));
        console.log("BreedingForge:", address(breedingForge));

        agoraPool.setBattleArena(address(battleArena));
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