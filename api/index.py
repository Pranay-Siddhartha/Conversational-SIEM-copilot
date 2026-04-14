import sys
import os

# Add the root and backend directories to sys.path
# This allows 'from app.main import app' to work if we add 'backend' to path
path = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, path)

from app.main import app

# This is required for Vercel Python functions
# The 'app' variable is already correctly named for FastAPI
