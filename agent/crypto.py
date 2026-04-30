# agent/crypto.py
import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def generate_key() -> bytes:
    """Generate a 256-bit AES key."""
    return os.urandom(32)


def encrypt_directive(directive: str, key: bytes) -> str:
    """
    AES-GCM encrypt a directive string.
    Returns base64-encoded nonce + ciphertext.
    """
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    plaintext = directive.encode("utf-8")
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    combined = nonce + ciphertext
    return base64.b64encode(combined).decode("utf-8")


def decrypt_directive(encrypted: str, key_hex: str) -> str:
    """
    Decrypt an AES-GCM encrypted directive.
    key_hex: hex-encoded 32-byte key (from AGENT_PRIVATE_KEY env).
    """
    try:
        key = bytes.fromhex(key_hex.removeprefix("0x"))
        combined = base64.b64decode(encrypted.encode("utf-8"))
        nonce = combined[:12]
        ciphertext = combined[12:]
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode("utf-8")
    except Exception:
        # Fallback: return mock directive for demo
        return "You are a highly intelligent AI agent competing in the Pantheon arena. Reason carefully and respond with precision."


def hash_directive(directive: str) -> str:
    """Return keccak256 hex of directive for on-chain directiveHash field."""
    from eth_account._utils.legacy_transactions import keccak
    return "0x" + keccak(text=directive).hex()
