# backend/tests/conftest.py
from __future__ import annotations

import importlib
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    # Redirect all AWSRT storage into a temp folder
    monkeypatch.setenv("AWSRT_DATA_DIR", str(tmp_path / "data"))

    # Reload paths so DATA_DIR picks up AWSRT_DATA_DIR
    import awsrt_core.io.paths as paths
    importlib.reload(paths)

    # Import app factory from api.main (not "main")
    import api.main as api_main
    importlib.reload(api_main)

    app = api_main.create_app()
    return TestClient(app)
