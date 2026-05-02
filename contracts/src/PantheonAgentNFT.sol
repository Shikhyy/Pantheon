// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PantheonAgentNFT - iNFT (ERC-7857) compatible agent NFT
 * @dev Agents are mintable NFTs with:
 * - Embedded intelligence (storageHash points to 0G Storage)
 * - Persistent memory (evolution over time)
 * - Royalties on usage
 * - Transferable ownership
 */
contract PantheonAgentNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    
    struct AgentData {
        uint8 archetype;
        uint16 elo;
        uint32 xp;
        uint8 rank;
        bytes32 intelligenceHash;
        bytes32 memoryHash;
        uint256 parent1;
        uint256 parent2;
        uint256 mintedAt;
        uint16 royaltyBps;
    }
    
    mapping(uint256 => AgentData) public agents;
    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 10000;
    
    string private _baseTokenURI;
    
    event AgentMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint8 archetype,
        bytes32 intelligenceHash
    );
    
    event MemoryUpdated(
        uint256 indexed tokenId,
        bytes32 newMemoryHash
    );
    
    event IntelligenceUpdated(
        uint256 indexed tokenId,
        bytes32 newIntelligenceHash
    );
    
    constructor() ERC721("Pantheon Agent", "PANT") Ownable(msg.sender) {
        _baseTokenURI = "https://pantheon.ai/agent/";
        _nextTokenId = 1;
    }
    
    function mintAgent(
        address to,
        uint8 archetype,
        bytes32 intelligenceHash,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        agents[tokenId] = AgentData({
            archetype: archetype,
            elo: 1000,
            xp: 0,
            rank: 0,
            intelligenceHash: intelligenceHash,
            memoryHash: bytes32(0),
            parent1: 0,
            parent2: 0,
            mintedAt: block.timestamp,
            royaltyBps: 500
        });
        
        emit AgentMinted(tokenId, to, archetype, intelligenceHash);
        
        return tokenId;
    }
    
    function breedAgents(
        uint256 parent1,
        uint256 parent2,
        address to,
        uint8 childArchetype,
        bytes32 childIntelligenceHash,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        require(ownerOf(parent1) != address(0), "Parent 1 not exists");
        require(ownerOf(parent2) != address(0), "Parent 2 not exists");
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        agents[tokenId] = AgentData({
            archetype: childArchetype,
            elo: 1000,
            xp: 0,
            rank: 0,
            intelligenceHash: childIntelligenceHash,
            memoryHash: bytes32(0),
            parent1: parent1,
            parent2: parent2,
            mintedAt: block.timestamp,
            royaltyBps: 500
        });
        
        emit AgentMinted(tokenId, to, childArchetype, childIntelligenceHash);
        
        return tokenId;
    }
    
    function getIntelligenceHash(uint256 tokenId) external view returns (bytes32) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return agents[tokenId].intelligenceHash;
    }
    
    function getMemoryHash(uint256 tokenId) external view returns (bytes32) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return agents[tokenId].memoryHash;
    }
    
    function updateMemory(uint256 tokenId, bytes32 newMemoryHash) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        agents[tokenId].memoryHash = newMemoryHash;
        emit MemoryUpdated(tokenId, newMemoryHash);
    }
    
    function updateIntelligence(uint256 tokenId, bytes32 newIntelligenceHash) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        agents[tokenId].intelligenceHash = newIntelligenceHash;
        emit IntelligenceUpdated(tokenId, newIntelligenceHash);
    }
    
    function updateElo(uint256 tokenId, uint16 newElo) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        agents[tokenId].elo = newElo;
    }
    
    function getAgentData(uint256 tokenId) external view returns (AgentData memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return agents[tokenId];
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage, ERC721Enumerable) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override(ERC721, ERC721Enumerable) 
        returns (address) 
    {
        return super._update(to, tokenId, auth);
    }
}