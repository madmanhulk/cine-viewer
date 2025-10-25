#!/bin/bash

# Version Management Script for Cine Viewer
# Usage: ./version.sh [new_version]
# Example: ./version.sh 0.22

if [ $# -eq 0 ]; then
    echo "Current version information:"
    echo "=========================="
    
    # Show current version from VERSION file
    if [ -f "VERSION" ]; then
        echo "VERSION file: $(cat VERSION)"
    fi
    
    # Show version in app.py
    if [ -f "app.py" ]; then
        echo "app.py: $(grep '__version__' app.py | cut -d'"' -f2)"
    fi
    
    # Show version in index.html
    if [ -f "templates/index.html" ]; then
        echo "index.html: $(grep -o 'v[0-9]*\.[0-9]*' templates/index.html)"
    fi
    
    # Show git tags
    echo ""
    echo "Git tags:"
    git tag -l "v*" | sort -V | tail -5
    
    echo ""
    echo "Usage: ./version.sh [new_version]"
    echo "Example: ./version.sh 0.22"
    exit 0
fi

NEW_VERSION=$1

echo "Updating version to $NEW_VERSION..."

# Update VERSION file
echo "$NEW_VERSION" > VERSION

# Update app.py
sed -i.bak "s/__version__ = \".*\"/__version__ = \"$NEW_VERSION\"/" app.py

# Update index.html
sed -i.bak "s/v[0-9]*\.[0-9]*/v$NEW_VERSION/" templates/index.html

# Update README.md
sed -i.bak "s/Web Edition v[0-9]*\.[0-9]*/Web Edition v$NEW_VERSION/" README.md

# Clean up backup files
rm -f app.py.bak templates/index.html.bak README.md.bak

echo "Version updated to $NEW_VERSION in all files!"
echo ""
echo "Next steps:"
echo "1. Test your changes"
echo "2. git add ."
echo "3. git commit -m \"Bump version to v$NEW_VERSION\""
echo "4. git tag -a v$NEW_VERSION -m \"Release version $NEW_VERSION\""
echo "5. git push origin main --tags"