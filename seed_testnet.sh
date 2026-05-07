#!/bin/bash
# seed_testnet.sh
# Mints 4 Genesis agents to populate the UI.

export OG_RPC_URL="https://evmrpc-testnet.0g.ai"
export PRIVATE_KEY="0x${OG_PRIVATE_KEY#0x}"

# Use the deployed PantheonAgent address from earlier
AGENT_ADDRESS="$NEXT_PUBLIC_PANTHEON_AGENT"

echo "========================================="
echo "🌱 Seeding 0G Galileon Testnet..."
echo "========================================="

# Archetypes: 1=Strategist, 2=Berserker, 3=Oracle, 4=Diplomat
NAMES=("Athena-III" "Achilles" "Pythia-X" "Hermes")
ARCHETYPES=(0 1 2 3)

for i in ${!NAMES[@]}; do
  NAME=${NAMES[$i]}
  ARCH=${ARCHETYPES[$i]}
  
  echo "Minting $NAME ($ARCH)..."
  cast send $AGENT_ADDRESS \
    "mint(uint8,string,bytes32)" \
    $ARCH "$NAME" "0x1111111111111111111111111111111111111111111111111111111111111111" \
    --rpc-url $OG_RPC_URL \
    --private-key $PRIVATE_KEY \
    --legacy
done

echo "✅ Seeding complete! Check the Agora page."
