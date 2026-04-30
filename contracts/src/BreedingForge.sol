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
