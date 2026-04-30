# agent/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # 0G
    OG_RPC_URL: str = "https://evmrpc-testnet.0g.ai"
    OG_COMPUTE_URL: str = "https://compute-testnet.0g.ai"
    OG_STORAGE_URL: str = "https://storage-testnet.0g.ai"
    OG_PRIVATE_KEY: str = "0x0000000000000000000000000000000000000000000000000000000000000001"
    OG_CHAIN_ID: int = 16600

    # ENS
    ENS_SUBNAME_REGISTRAR: str = "0x0000000000000000000000000000000000000000"

    # AXL
    AXL_BOOTSTRAP_PEER_1: str = ""
    AXL_BOOTSTRAP_PEER_2: str = ""

    # KeeperHub
    KEEPERHUB_MCP_URL: str = "https://api.keeperhub.io/mcp"
    KEEPERHUB_API_KEY: str = ""

    # Contracts
    PANTHEON_AGENT_ADDRESS: str = "0x0000000000000000000000000000000000000000"
    BATTLE_ARENA_ADDRESS: str = "0x0000000000000000000000000000000000000000"

    # Backend
    REFEREE_PRIVATE_KEY: str = "0x0000000000000000000000000000000000000000000000000000000000000001"
    AGENT_PRIVATE_KEY: str = "0x0000000000000000000000000000000000000000000000000000000000000001"

    # SSE
    SSE_HOST: str = "0.0.0.0"
    SSE_PORT: int = 8000

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
