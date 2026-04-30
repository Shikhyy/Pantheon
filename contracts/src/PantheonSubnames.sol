// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPantheonSubnames} from "./interfaces/IPantheonSubnames.sol";

/// @title PantheonSubnames — ENS L2 Subname Registrar
/// @notice Registers agent.pantheon.eth subnames and manages ENS text records
///         for ELO, rank, wins, and losses. Updated by BattleArena post-battle.
contract PantheonSubnames is Ownable, IPantheonSubnames {

    // ── Errors ────────────────────────────────────────────────────────────
    error NameAlreadyRegistered();
    error NotAuthorized();

    // ── State ─────────────────────────────────────────────────────────────
    address public battleArena;
    address public pantheonAgent;

    /// tokenId → name (e.g. "achilles")
    mapping(uint256 => string)  public tokenIdToName;
    /// name → tokenId
    mapping(string => uint256)  public nameToTokenId;

    /// All ENS text records for a token (key → value)
    mapping(uint256 => mapping(string => string)) private _records;

    // ── Events ────────────────────────────────────────────────────────────
    event SubnameRegistered(uint256 indexed tokenId, string name, string ensName);
    event RecordsUpdated(uint256 indexed tokenId, uint16 newElo);

    constructor() Ownable(msg.sender) {}

    // ── Admin ─────────────────────────────────────────────────────────────
    function setBattleArena(address _battleArena) external onlyOwner {
        battleArena = _battleArena;
    }

    function setPantheonAgent(address _pantheonAgent) external onlyOwner {
        pantheonAgent = _pantheonAgent;
    }

    // ── Registration ──────────────────────────────────────────────────────

    /// @notice Register a new subname for an agent. Called after mint.
    function registerSubname(string calldata name, uint256 tokenId) external override {
        if (nameToTokenId[name] != 0) revert NameAlreadyRegistered();

        tokenIdToName[tokenId] = name;
        nameToTokenId[name]    = tokenId;

        // Set initial text records
        _records[tokenId]["elo"]  = "1200";
        _records[tokenId]["rank"] = "Demigod";
        _records[tokenId]["wins"] = "0";
        _records[tokenId]["losses"] = "0";

        emit SubnameRegistered(tokenId, name, string(abi.encodePacked(name, ".pantheon.eth")));
    }

    /// @notice Batch update ELO and rank text records post-battle.
    function updateRecords(uint256 tokenId, uint16 newElo) external override {
        if (msg.sender != battleArena) revert NotAuthorized();

        _records[tokenId]["elo"] = _uint16ToString(newElo);
        _records[tokenId]["rank"] = _eloToRank(newElo);

        emit RecordsUpdated(tokenId, newElo);
    }

    /// @notice Set any text record directly (owner only — for admin corrections).
    function setRecord(uint256 tokenId, string calldata key, string calldata value) external onlyOwner {
        _records[tokenId][key] = value;
    }

    // ── Views ─────────────────────────────────────────────────────────────

    function getRecord(uint256 tokenId, string calldata key) external view returns (string memory) {
        return _records[tokenId][key];
    }

    function getEnsName(uint256 tokenId) external view returns (string memory) {
        return string(abi.encodePacked(tokenIdToName[tokenId], ".pantheon.eth"));
    }

    // ── Internal ──────────────────────────────────────────────────────────

    function _eloToRank(uint16 elo) internal pure returns (string memory) {
        if (elo >= 1800) return "Olympian";
        if (elo >= 1600) return "Titan";
        if (elo >= 1400) return "God";
        if (elo >= 1200) return "Hero";
        return "Demigod";
    }

    function _uint16ToString(uint16 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 temp = v;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (v != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(v % 10)));
            v /= 10;
        }
        return string(buffer);
    }
}
