// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IAgoraPool
interface IAgoraPool {
    function openPool(
        bytes32 battleId,
        address settlementToken,
        uint256 challengerTokenId,
        uint256 defenderTokenId
    ) external;

    function settle(bytes32 battleId, address battleWinner) external;
}
