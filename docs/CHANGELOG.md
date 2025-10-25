# Changelog

All notable changes to Cine Viewer Web Edition will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.21.0] - 2025-10-24

### Added
- Initial Docker support with Docker Compose configuration
- Complete containerized deployment setup
- Production-ready Docker configuration with health checks
- Version tracking system with API endpoint `/api/version`
- Comprehensive deployment documentation

### Features
- Image upload and drag & drop support (PNG, JPG/JPEG, BMP, TIFF; up to 50MB)
- False Color grading: ARRI and Blackmagic profiles with legend
- Thirds Grid with adjustable line thickness
- Center Cross overlays (standard, small, square styles)
- Real-time RGB Histogram display
- Interactive Vectorscope visualization
- Image metadata display (resolution and aspect ratio)
- Dark theme UI optimized for cinematography work

### Technical
- Flask backend with RESTful API
- Canvas-based frontend rendering
- Optimized vectorscope sampling (~2000 points)
- Server-side false color processing for accuracy
- Responsive design with aspect ratio preservation
- Cross-platform browser compatibility

### Documentation
- Complete setup and deployment guides
- Docker deployment instructions
- Architecture overview and project background

---

## Version Format

- **Major.Minor.Patch** (e.g., 1.0.0)
- **Major**: Breaking changes or significant new features
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes, minor improvements

## Release Process

1. Update version with `./version.sh [new_version]`
2. Update this CHANGELOG.md
3. Test changes thoroughly
4. Commit changes: `git commit -m "Bump version to vX.X.X"`
5. Create tag: `git tag -a vX.X.X -m "Release version X.X.X"`
6. Push: `git push origin main --tags`