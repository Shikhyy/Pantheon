// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IPantheonAgent
interface IPantheonAgent {
    enum Archetype { Strategist, Oracle, Berserker, Diplomat }
    enum Rank      { Demigod, Hero, God, Titan, Olympian }

    struct AgentData {
        Archetype archetype;
        uint16    elo;
        uint32    xp;
        Rank      rank;
        uint32    battleCount;
        uint32    wins;
        uint32    losses;
        bytes32   storageHash;
        bytes32   directiveHash;
        uint256   parent1;
        uint256   parent2;
        uint256   mintedAt;
    }

    function ownerOf(uint256 tokenId) external view returns (address);
    function getAgent(uint256 tokenId) external view returns (AgentData memory);
    function getNameByTokenId(uint256 tokenId) external view returns (string memory);
    function updateStats(uint256 tokenId, uint16 newElo, uint32 xpGained, bool won) external;
    function mintOffspring(
        address to,
        Archetype archetype,
        string calldata name,
        bytes32 storageHash,
        uint256 parent1,
        uint256 parent2,
        uint16  startingElo
    ) external returns (uint256 tokenId);
}
