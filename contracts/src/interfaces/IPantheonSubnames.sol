// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IPantheonSubnames — ENS L2 subname registrar interface
interface IPantheonSubnames {
    function registerSubname(string calldata name, uint256 tokenId) external;
    function updateRecords(uint256 tokenId, uint16 newElo) external;
}
