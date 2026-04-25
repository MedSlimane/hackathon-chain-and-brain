// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BiomassTraceability {
    struct Batch {
        address farmer;
        string biomassType;
        uint256 quantityKg;
        uint256 carbonSavedKg;
        bool exists;
        bool delivered;
    }

    mapping(bytes32 => Batch) private batches;
    mapping(bytes32 => bytes32[]) private batchTransactions;

    event BatchCreated(bytes32 indexed batchId, address indexed farmer, string biomassType, uint256 quantityKg);
    event TransactionCreated(bytes32 indexed batchId, bytes32 indexed transactionId, address indexed buyer);
    event DeliveryConfirmed(bytes32 indexed batchId, bytes32 indexed transactionId);
    event CarbonImpactRecorded(bytes32 indexed batchId, uint256 carbonSavedKg);

    function createBatch(bytes32 batchId, string calldata biomassType, uint256 quantityKg) external {
        require(!batches[batchId].exists, "Batch already exists");
        batches[batchId] = Batch(msg.sender, biomassType, quantityKg, 0, true, false);
        emit BatchCreated(batchId, msg.sender, biomassType, quantityKg);
    }

    function createTransaction(bytes32 batchId, bytes32 transactionId) external {
        require(batches[batchId].exists, "Unknown batch");
        batchTransactions[batchId].push(transactionId);
        emit TransactionCreated(batchId, transactionId, msg.sender);
    }

    function confirmDelivery(bytes32 batchId, bytes32 transactionId) external {
        require(batches[batchId].exists, "Unknown batch");
        batches[batchId].delivered = true;
        emit DeliveryConfirmed(batchId, transactionId);
    }

    function recordCarbonImpact(bytes32 batchId, uint256 carbonSavedKg) external {
        require(batches[batchId].exists, "Unknown batch");
        batches[batchId].carbonSavedKg = carbonSavedKg;
        emit CarbonImpactRecorded(batchId, carbonSavedKg);
    }

    function getBatch(bytes32 batchId) external view returns (Batch memory) {
        require(batches[batchId].exists, "Unknown batch");
        return batches[batchId];
    }
}
