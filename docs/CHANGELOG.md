# Changelog

All notable changes to Cine Viewer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.7] - 2025-11-21

### Added
- **Aspect Ratio Overlay Feature**: New cinematic framing tool with 7 preset aspect ratios
  - Original: Displays native image aspect ratio (no overlay)
  - 16:9: Standard widescreen format (1.78:1)
  - 9:16: Vertical/portrait format
  - 1:1: Square format
  - 2:1: Streaming format (Univisium)
  - 2.35:1: Anamorphic/cinematic widescreen
  - 4:3: Classic TV/monitor format
  - Black letterbox/pillarbox bars overlay based on target aspect ratio
  - Dynamic "Original" button text showing actual image aspect ratio in format "Original (X.XX:1)"
  - Active button highlighting with green accent color
- **Adaptive Overlay System**: Thirds grid and center cross now adapt to selected aspect ratio
  - Thirds grid lines calculate based on visible aspect ratio area (excluding black bars)
  - Center cross positions at the center of the visible aspect ratio area
  - Provides accurate framing guides for different cinematic formats

### Technical
- Added `showAspectRatio` and `aspectRatioType` to application state
- Implemented aspect ratio calculations in `drawOverlays()` function
- Enhanced `updateSubButtonStates()` to support aspect ratio button highlighting
- Solid black overlay bars (`rgba(0, 0, 0, 1)`) for accurate framing visualization
- Automatic top/bottom or left/right bar placement based on aspect ratio comparison
- Added `visibleWidth`, `visibleHeight`, `visibleX`, `visibleY` calculations for overlay positioning
- Thirds grid and center cross now use visible area dimensions instead of full canvas

## [1.1.6] - 2025-10-28

### Added
- **Enhanced Logging System**: Comprehensive admin logging improvements
  - Periodic memory usage logging (every 30 seconds by default)
  - Memory usage displayed in MB and percentage of system memory
  - Configurable logging interval for debugging purposes
- **Real Client IP Detection**: Fixed client IP logging for Docker/proxy environments
  - Added `get_client_ip()` function to detect real client IP addresses
  - Checks X-Forwarded-For and X-Real-IP headers
  - Properly logs actual host IP instead of Docker bridge IP (172.x.x.x)
  - Works correctly behind reverse proxies (Nginx, Apache, etc.)

### Fixed
- Suppressed NumPy runtime warnings (divide by zero, invalid values)
  - Added warning filters for RuntimeWarning
  - Configured NumPy error handling to ignore divide/invalid operations
  - Cleaner logs without harmless mathematical warnings

### Technical
- Added `warnings` module import for filtering specific warning types
- Implemented `log_memory_usage()` daemon thread for continuous monitoring
- Enhanced `track_client()` to use real IP detection
- Updated all client IP references to use `get_client_ip()` helper function

## [1.1.4] - 2025-10-27

### Added
- **Contrast Ratio Calculation**: Added Rec. 709 standard luminance-based contrast ratio measurement
  - Displays as whole number ratio (e.g., "255:1")
  - Uses 99th/1st percentile to avoid outlier pixels
  - Applied WCAG formula for accurate perceptual contrast
- **UI Spacing Improvements**: Enhanced sidebar spacing between control groups
  - Added visual separation between "Open Image" and overlay controls
  - Added separation between "Thirds Grid" and "False Color"
  - Improved visual hierarchy without adding divider lines

### Fixed
- Contrast ratio now rounds to nearest whole number (no decimals)

### Documentation
- Updated README with all v1.1 features and improvements
- Comprehensive Docker Deployment guide overhaul
- Added automated update scheduling documentation for Portainer

## [1.1.0] - 2025-10-27

### Added
- **Color Palette Extraction**: AI-powered 8-color dominant color extraction
  - K-means clustering with enhanced feature space (RGB + saturation + brightness)
  - Saturation-weighted sampling (70% saturation bias, 30% uniform)
  - Analyzes 50,000 pixels for accurate representation
  - Brightness-ordered display (lightest to darkest)
  - Click-to-copy hex codes with visual feedback
  - Hover to display hex values overlaid on swatches
  - Vertical layout positioned left of image viewer
  - Smart "interest score" ranking balancing frequency and vibrancy

### Changed
- Upgraded color extraction algorithm for better diversity
  - Increased sampling from 10,000 to 50,000 pixels
  - Enhanced k-means iterations (n_init=20, max_iter=500)
  - Improved perceptual color grouping
- UI refinements for equal padding throughout layout
- Removed padding inconsistencies in image container

### Technical
- Added scikit-learn dependency for machine learning-based clustering
- Implemented saturation calculation for pixel weighting
- Optimized memory usage during color extraction

## [1.0.0] - 2025-10-27

### Changed
- **Vectorscope Highlighting**: Temporarily disabled mouse hover highlighting feature
  - Feature remains in codebase for future re-enablement
  - Improves performance and simplifies feature set
  - `/api/pixel-color` endpoint preserved but unused

### Milestone
- Official 1.0 release with stable core features
- Production-ready false color modes (ARRI, Blackmagic)
- Reliable vectorscope and histogram analysis
- Professional-grade overlay tools

## [0.29.0] - 2025-10-26

### Added
- Vectorscope pixel highlighting on mouse hover
- Real-time pixel color tracking with UV coordinates
- Enhanced vectorscope visualization with highlighted points

### Technical
- Added `/api/pixel-color` endpoint for real-time color analysis
- Implemented throttled mouse tracking (50ms throttle)
- Client-side coordinate mapping for canvas precision

## [0.21.0] - 2025-10-24

### Added
- **Docker Support**: Complete containerized deployment
  - Docker Compose configuration
  - Production-ready setup with health checks
  - GitHub Container Registry integration
  - Waitress WSGI server for production
- **Version Tracking**: API endpoint `/api/version` for version queries
- **Deployment Documentation**: Comprehensive Docker and Portainer guides

### Features (Initial Release)
- Image upload with drag & drop support
  - Supported formats: PNG, JPG/JPEG, BMP, TIFF
  - Maximum file size: 35MB
- **False Color Grading**:
  - ARRI profile (industry-standard exposure zones)
  - Blackmagic profile (BMD camera mapping)
  - Interactive legend with zone descriptions
- **Overlay Tools**:
  - Thirds Grid with adjustable line thickness (1-5px)
  - Center Cross with 3 styles (Standard, Small, Square)
- **Analysis Tools**:
  - Real-time RGB Histogram with reference lines
  - Interactive Vectorscope with color reference markers
  - Image metadata display (resolution, aspect ratio)
- **UI/UX**:
  - Dark theme optimized for cinematography
  - Responsive canvas-based rendering
  - Aspect ratio preservation
  - Professional sidebar controls

### Technical
- Flask backend with RESTful API architecture
- NumPy-optimized image processing
- Canvas-based frontend rendering
- Vectorscope downsampling to ~2,000 points for performance
- Server-side false color processing for accuracy
- Client session management with automatic cleanup
- Memory-efficient garbage collection
- Cross-platform browser compatibility

### Infrastructure
- Waitress WSGI production server
- Connection limiting and timeout management
- Automatic client cleanup (5-minute intervals)
- Memory threshold monitoring (1GB warning)
- Thread-based cleanup daemon

---

## Version History Summary

- **v1.1.x**: Color palette extraction, contrast ratio, UI enhancements
- **v1.0.0**: Stable release, disabled vectorscope highlighting
- **v0.29.x**: Vectorscope pixel tracking (experimental)
- **v0.21.0**: Initial public release with Docker support

---

## Planned Features

### Future Enhancements
- Additional false color profiles (RED, Sony)
- LUT (Look-Up Table) application
- Waveform monitor
- RGB parade display
- Batch image processing
- Export analyzed images
- Custom color palette management
- EXIF metadata extraction
- Zebra pattern overlay
- Focus peaking visualization

### Under Consideration
- Re-enable vectorscope highlighting (performance optimized)
- WebGL-accelerated rendering
- Multi-image comparison mode
- Annotation tools
- Image sequence playback
- HDR image support
- RAW image format support

---

## Migration Notes

### Upgrading to v1.1.x from v1.0.x
- New dependency: `scikit-learn>=1.3.0` (auto-installed via requirements.txt)
- No breaking changes to existing features
- Color palette data added to `/api/upload` response
- New UI element: palette container (hidden by default)

### Upgrading to v1.0.0 from v0.x
- Vectorscope highlighting disabled but code retained
- No API changes
- No data migration required

---