#!/bin/bash
# start_agents.sh
# Pantheon Platform Helper Script
# This spins up the agent backend demo script which mocks an autonomous battle.

echo "========================================="
echo "Starting Pantheon Agent Runtime"
echo "========================================="

cd agent || exit
# Ensure dependencies are installed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3.12 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Gensyn AXL Setup (Hackathon Requirement)
echo "Starting Gensyn AXL Swarm Network..."
if ! command -v axl &> /dev/null; then
    echo "[!] 'axl' binary not found in PATH. Please download it from https://github.com/gensyn-ai/axl"
    echo "[!] Running without real AXL nodes (mock mode will be used if connection fails)."
else
    # Spin up 4 nodes for the swarm
    for PORT in 9002 9003 9004 9005; do
        axl --port $PORT > "axl_$PORT.log" 2>&1 &
        echo "AXL Node running on port $PORT"
    done
fi

echo "========================================="
# Run the demo script
python demo.py
