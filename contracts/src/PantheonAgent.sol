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
/// @dev ETHGlobal OpenAgents 2026 — 0G + ENS + KeeperHub + Uniswap + AXL
contract PantheonAgent is ERC721Enumerable, Ownable {

    // ── Errors ────────────────────────────────────────────────────────────
    error NotAuthorized();
    error InvalidArchetype();
    error NameTaken();
    error ZeroStorageHash();

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

    mapping(uint256 => AgentData) private _agents;
    mapping(string  => uint256)   private _nameToTokenId;
    mapping(uint256 => string)    private _tokenIdToName;

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
        if (uint8(archetype) > 3)           revert InvalidArchetype();
        if (_nameToTokenId[name] != 0)       revert NameTaken();
        if (storageHash == bytes32(0))        revert ZeroStorageHash();

        tokenId = ++_tokenIdCounter;

        _agents[tokenId] = AgentData({
            archetype:     archetype,
            elo:           1200,
            xp:            0,
            rank:          Rank.Demigod,
            battleCount:   0,
            wins:          0,
            losses:        0,
            storageHash:   storageHash,
            directiveHash: bytes32(0),
            parent1:       0,
            parent2:       0,
            mintedAt:      block.timestamp
        });

        _nameToTokenId[name]    = tokenId;
        _tokenIdToName[tokenId] = name;

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

    /// @notice Owner can update directive pointer (new encrypted blob on 0G).
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

    /// @notice Fully on-chain metadata — no IPFS dependency.
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
