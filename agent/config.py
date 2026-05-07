# agent/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # 0G
    OG_RPC_URL: str = "https://evmrpc-testnet.0g.ai"
    OG_COMPUTE_MODE: str = "auto"
    OG_COMPUTE_URL: str = "https://compute-testnet.0g.ai"
    OG_COMPUTE_ROUTER_URL: str = "https://router-api-testnet.integratenetwork.work/v1"
    OG_COMPUTE_API_KEY: str = ""
    OG_STORAGE_URL: str = "https://storage-testnet.0g.ai"
    OG_PRIVATE_KEY: str = "0x0000000000000000000000000000000000000000000000000000000000000001"
    OG_CHAIN_ID: int = 16602

    # ENS
    ENS_SUBNAME_REGISTRAR: str = "0x0000000000000000000000000000000000000000"

    # AXL
    AXL_BOOTSTRAP_PEER_1: str = ""
    AXL_BOOTSTRAP_PEER_2: str = ""

    # KeeperHub
    KEEPERHUB_MCP_URL: str = "https://api.keeperhub.io/mcp"
    KEEPERHUB_API_KEY: str = ""

    # Gensyn
    GENSYN_URL: str = "https://api.gensyn.io/v1"
    GENSYN_API_KEY: str = ""

    # Contracts
    PANTHEON_AGENT_ADDRESS: str = "0x5F119f1bC1C67c41f4e045B46065933Ea4A7bbEE"
    BATTLE_ARENA_ADDRESS: str = "0xE53e1Ba2105f1c6bC88Af523652E0938eccb7945"
    ENS_SUBNAME_REGISTRAR: str = "0x39CF69380C8D66037305655Ebb7B4C9163aE4E18"
    AGORA_POOL_ADDRESS: str = "0xb73A2Da54734D227747e5BD837498172853740ba"
    BREEDING_FORGE_ADDRESS: str = "0x07e3998E05DC4A5CCADae9979E539397D92B794E"

    # Backend
    REFEREE_PRIVATE_KEY: str = "0x0000000000000000000000000000000000000000000000000000000000000001"
    AGENT_PRIVATE_KEY: str = "0x0000000000000000000000000000000000000000000000000000000000000001"
    TEE_API_KEY: str = ""

    # SSE
    SSE_HOST: str = "0.0.0.0"
    SSE_PORT: int = 8000
    SSE_URL: str = "http://127.0.0.1:8000"

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    # Log computed modes for debugging
    compute_key_present = bool(settings.OG_COMPUTE_API_KEY)
    logger.info(
        f"Initialized Pantheon settings: "
        f"compute_mode={settings.OG_COMPUTE_MODE}, "
        f"router_key_present={compute_key_present}, "
        f"chain_id={settings.OG_CHAIN_ID}"
    )
    return settings

settings = get_settings()
