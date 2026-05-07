"""TEE integration shim and mock implementation.

Provides a pluggable interface for a Trusted Execution Environment (TEE).
The `MockTEE` class can be used for local development and the project
can add a real provider (Intel SGX, AWS Nitro Enclaves, or similar) by
implementing the same interface.
"""
from __future__ import annotations
from typing import Protocol
import os
from eth_account import Account
from eth_account.messages import encode_defunct


class TEE(Protocol):
    def get_status(self) -> dict:
        ...

    def sign(self, payload: bytes) -> bytes:
        ...


class MockTEE:
    """Simple in-process signer that simulates a hardware TEE.

    WARNING: This is NOT secure and only intended for local development.
    Replace with a proper TEE provider in production.
    """

    def __init__(self, private_key_hex: str | None = None):
        self._private_key = private_key_hex

    def get_status(self) -> dict:
        return {
            "provider": "mock",
            "ready": True if self._private_key else False,
            "public_key": None,
        }

    def sign(self, payload: bytes) -> bytes:
        # If a private key is configured, produce a real ECDSA signature
        if not self._private_key:
            raise RuntimeError("MockTEE: no private key configured")
        # Use eth-account to produce an Ethereum ECDSA signature over the
        # provided payload (treated as a 32-byte hash). This mirrors how
        # on-chain ECDSA verification expects signed messages.
        msg = encode_defunct(primitive=payload)
        signed = Account.sign_message(msg, private_key=self._private_key)
        return signed.signature


_default_tee: TEE | None = None
_default_tee_key: str | None = None


def get_default_tee() -> TEE:
    global _default_tee, _default_tee_key

    key = os.environ.get("REFEREE_PRIVATE_KEY")
    if not key:
        raise RuntimeError("REFEREE_PRIVATE_KEY is not configured")

    if _default_tee is None or _default_tee_key != key:
        _default_tee = MockTEE(key)
        _default_tee_key = key

    return _default_tee


if __name__ == "__main__":
    t = get_default_tee()
    print(t.get_status())
