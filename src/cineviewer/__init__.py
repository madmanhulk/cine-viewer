"""
CineViewer - A web-based cinematography analysis tool
"""
import os

# Read version from VERSION file
with open(os.path.join(os.path.dirname(__file__), 'VERSION')) as f:
    __version__ = f.read().strip()

from .app import app  # noqa: F401