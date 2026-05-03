#!/bin/bash
# seed_testnet.sh
# Mints 4 Genesis agents to populate the UI.

export OG_RPC_URL="https://evmrpc-testnet.0g.ai"
export PRIVATE_KEY="0x${OG_PRIVATE_KEY#0x}"

# Use the deployed PantheonAgent address from earlier
AGENT_ADDRESS="0x5F119f1bC1C67c41f4e045B46065933Ea4A7bbEE"

echo "========================================="
echo "🌱 Seeding 0G Galileon Testnet..."
echo "========================================="

# Archetypes: 1=Strategist, 2=Berserker, 3=Oracle, 4=Diplomat
NAMES=("Athena-III" "Achilles" "Pythia-X" "Hermes")
ARCHETYPES=(1 2 3 4)

for i in ${!NAMES[@]}; do
  NAME=${NAMES[$i]}
  ARCH=${ARCHETYPES[$i]}
  
  echo "Minting $NAME ($ARCH)..."
  cast send $AGENT_ADDRESS \
    "mint(uint8,string,bytes32)" \
    $ARCH "$NAME" "0x0000000000000000000000000000000000000000000000000000000000000000" \
    --rpc-url $OG_RPC_URL \
    --private-key $PRIVATE_KEY \
    --legacy
done

echo "✅ Seeding complete! Check the Agora page."
