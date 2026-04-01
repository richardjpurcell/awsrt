from __future__ import annotations

import secrets


def new_id(prefix: str) -> str:
    # 10 hex chars => 40 bits, plenty for local dev.
    return f"{prefix}-{secrets.token_hex(5)}"
