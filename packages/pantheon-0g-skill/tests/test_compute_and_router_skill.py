from src.compute_skill import ZeroGComputeSkill
from src.router_skill import ZeroGRouterSkill


def test_compute_skill_uses_direct_endpoint(monkeypatch):
    monkeypatch.setenv("OG_COMPUTE_URL", "https://compute-testnet.0g.ai")

    skill = ZeroGComputeSkill()

    assert skill.base_url == "https://compute-testnet.0g.ai"


def test_router_skill_prefers_router_when_key_present(monkeypatch):
    monkeypatch.setenv("OG_COMPUTE_API_KEY", "test-key")
    monkeypatch.setenv("OG_COMPUTE_ROUTER_URL", "https://router-api-testnet.integratenetwork.work/v1")

    skill = ZeroGRouterSkill()

    assert skill.base_url == "https://router-api-testnet.integratenetwork.work/v1"
    assert skill.headers["Authorization"] == "Bearer test-key"