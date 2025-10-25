#!/usr/bin/env python3
"""Install dependencies for Cine Viewer Web App"""

import subprocess
import sys

packages = [
    "Flask==3.0.0",
    "numpy>=1.24.0",
    "Pillow>=10.0.0",
    "werkzeug>=3.0.0"
]

print("Installing dependencies for Cine Viewer Web App...")
print("=" * 50)

for package in packages:
    print(f"Installing {package}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", package])

print("\n✓ All dependencies installed successfully!")
print("\nTo run the app, use: python app.py")
print("Then visit: http://localhost:5000")
