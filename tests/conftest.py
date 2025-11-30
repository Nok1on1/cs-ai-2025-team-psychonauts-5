import os
import sys
from pathlib import Path


def pytest_sessionstart(session):
    # Ensure project root is on sys.path so `import capstone` works when running pytest from repo root
    repo_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(repo_root))
