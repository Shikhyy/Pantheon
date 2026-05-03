#!/bin/bash
# deploy_0g.sh
# Deploys the Pantheon contracts to the 0G Newton Testnet

# Ensure we have the required environment variables
if [ -z "$OG_PRIVATE_KEY" ]; then
    echo "❌ Error: OG_PRIVATE_KEY is not set in your environment."
    echo "Please set it: export OG_PRIVATE_KEY=your_private_key"
    echo "Or add it to your .env file."
    exit 1
fi

export OG_RPC_URL="https://evmrpc-testnet.0g.ai"
export PRIVATE_KEY="0x${OG_PRIVATE_KEY#0x}"
export OG_PRIVATE_KEY=$PRIVATE_KEY

# Set dummy addresses for testing if not set
export REFEREE_ADDRESS=${REFEREE_ADDRESS:-0x70997970C51812dc3A010C7d01b50e0d17dc79C8}
export TREASURY_ADDRESS=${TREASURY_ADDRESS:-0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC}

echo "========================================="
echo "🚀 Deploying to 0G Galileon Testnet..."
echo "========================================="

cd contracts

# Run the deployment script via Forge
forge script script/Deploy.s.sol:Deploy \
    --rpc-url $OG_RPC_URL \
    --private-key $OG_PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key "mock" \
    --legacy \
    -vvvv

echo ""
echo "✅ Deployment complete!"
echo "Check the 'contracts/broadcast' directory for the deployed addresses."
echo "Please copy the deployed addresses into 'apps/web/lib/contracts.ts'."
