# Cine Viewer

A web-based cinematography and production tool for image analysis, false color, and color palette extraction.

## Features

### Image Analysis Tools
- **Image Upload**: Upload and analyze images via browser (drag & drop supported)
- **False Color Grading**: Industry-standard false color modes (ARRI, Blackmagic)
- **Vectorscope**: Professional video measurement tool for color analysis with reference markers (R, G, B, Cy, Mg, Yl)
- **Histogram**: Real-time RGB histogram with reference lines for exposure analysis
- **Color Palette Extraction**: AI-powered extraction of 8 dominant colors using k-means clustering
  - Saturation-weighted sampling for vibrant color capture
  - Brightness-ordered display (lightest to darkest)
  - Click-to-copy hex codes
  - Hover to preview color values

### Overlay Tools
- **Center Cross**: Configurable center marker (Standard, Small, Square)
- **Thirds Grid**: Rule of thirds overlay with adjustable line thickness (1-5px)

### Image Information
- **Resolution**: Width x Height in pixels
- **Aspect Ratio**: Calculated ratio (e.g., 1.78:1)
- **Contrast Ratio**: Dynamic range measurement using Rec. 709 luminance calculation

## Installation

### Docker Deployment (Recommended)

```bash
docker pull ghcr.io/madmanhulk/cine-viewer:latest
docker run -d -p 8080:8080 --name cine-viewer ghcr.io/madmanhulk/cine-viewer:latest
```

Or use Docker Compose:
```bash
docker-compose up -d
```

See [DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md) for detailed deployment instructions.

### Manual Installation

#### Requirements
- Python 3.9+
- pip

#### Setup

1. Clone the repository:
```bash
git clone https://github.com/madmanhulk/cine-viewer.git
cd cine-viewer
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the App

### Production (Recommended)

The application uses Waitress WSGI server for production:

```bash
cd src/cineviewer
python app.py
```

The app will be available at `http://localhost:8080`

### Development

For development with auto-reload:

```bash
cd src/cineviewer
FLASK_ENV=development python app.py
```

## Usage

### Basic Workflow

1. **Open an Image**
   - Click "Open Image" button
   - Or drag and drop an image into the viewer
   - Supported formats: PNG, JPG, JPEG, BMP, TIFF

2. **Enable Analysis Tools**
   - **Color Palette**: Extract and display 8 dominant colors
   - **Vectorscope**: Show chrominance distribution
   - **False Color**: Apply exposure analysis overlay
   - **Center Cross**: Show precise center marker
   - **Thirds Grid**: Composition guide overlay

3. **View Image Data**
   - Check resolution, aspect ratio, and contrast ratio in the sidebar
   - Hover over palette colors to see hex values
   - Click palette swatches to copy hex codes to clipboard

### False Color Standards

#### ARRI Mode
- Purple (0-2.5%): Black clipping
- Blue (2.5-4%): Just above black
- Green (38-42%): 18% gray
- Pink (52-56%): One stop over
- Yellow (97-99%): Just below white
- Red (99%+): White clipping

#### Blackmagic Mode
- Purple (0-5%): Black clipping
- Blue (5-10%): Shadows
- Green (40-45%): 18% gray
- Yellow (90-95%): Highlights
- Red (95%+): White clipping

## Architecture

### Backend (Flask + Waitress)
- `app.py`: Main Flask application with Waitress WSGI server
- Image processing with NumPy and PIL
- Machine learning color extraction with scikit-learn
- RESTful API endpoints for image processing
- Memory-efficient processing with garbage collection
- Client session management with automatic cleanup

### Frontend (Vanilla JavaScript)
- `templates/index.html`: Semantic HTML5 structure
- `static/css/style.css`: Modern dark theme with responsive design
- `static/js/app.js`: Canvas-based rendering and real-time analysis

### Color Palette Algorithm
- K-means clustering in enhanced feature space (RGB + saturation + brightness)
- Saturation-weighted sampling (70% saturation, 30% uniform)
- Perceptual color grouping with 50,000 pixel samples
- Interest score ranking balancing frequency and vibrancy
- Brightness-based sorting for intuitive display

## Project Structure

```
cine-viewer/
├── docker/
│   └── Dockerfile              # Container build configuration
├── docs/
│   ├── CHANGELOG.md            # Version history
│   └── DOCKER_DEPLOYMENT.md    # Deployment guide
├── scripts/
│   ├── install_deps.py         # Dependency installer
│   ├── run.sh                  # Launch script
│   └── version.sh              # Version management
├── src/
│   └── cineviewer/
│       ├── __init__.py
│       ├── app.py              # Main application
│       ├── VERSION             # Current version
│       ├── static/
│       │   ├── css/
│       │   │   └── style.css   # Styling
│       │   └── js/
│       │       └── app.js      # Frontend logic
│       ├── templates/
│       │   └── index.html      # Main template
│       └── uploads/            # Temporary upload storage
├── docker-compose.yml          # Compose configuration
├── requirements.txt            # Python dependencies
└── README.md
```

## Dependencies

### Core
- Flask 3.0.0 - Web framework
- NumPy ≥1.24.0 - Numerical computing
- Pillow ≥10.0.0 - Image processing
- scikit-learn ≥1.3.0 - Machine learning (color clustering)

### Production
- Waitress ≥2.1.2 - Production WSGI server
- gunicorn ≥21.2.0 - Alternative WSGI server
- flask-cors ≥4.0.0 - CORS support

### Utilities
- psutil ≥5.9.0 - System monitoring
- werkzeug ≥3.0.0 - WSGI utilities

## Performance & Optimization

- **Vectorscope**: Downsampled to 2,000 points for real-time performance
- **Color Palette**: Intelligent sampling of 50,000 pixels with saturation weighting
- **Memory Management**: Automatic cleanup of inactive sessions every 5 minutes
- **Image Scaling**: Client-side canvas scaling maintains aspect ratio
- **Garbage Collection**: Aggressive cleanup after processing operations
- **Connection Limits**: Configurable concurrent connection management

## Browser Support

Requires modern browser with:
- Canvas API (2D rendering context)
- Fetch API (RESTful communication)
- FileReader API (local file processing)
- HTML5 Drag & Drop
- ES6+ JavaScript support

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Network Access

By default, the application binds to `0.0.0.0:8080`, accessible from any device on your network:
```
http://<your-ip-address>:8080
```

To restrict to localhost:
```python
# In app.py
serve(app, host='127.0.0.1', port=8080)
```

## Version History

See [CHANGELOG.md](docs/CHANGELOG.md) for detailed version history.

**Current Version: 1.1**

### Recent Updates (v1.1)
- Added 8-color palette extraction with AI-powered color analysis
- Implemented contrast ratio calculation (Rec. 709 standard)
- Improved color diversity with saturation-weighted sampling
- Added brightness-based palette sorting
- Enhanced UI spacing and layout
- Click-to-copy hex codes with visual feedback

### Previous Release (v1.0)
- Disabled vectorscope highlighting feature (kept in codebase)
- Refined false color modes
- Improved histogram visualization
- Enhanced memory management

## Contributing

Contributions welcome! Please open issues or pull requests on GitHub.

## License

Reid Petro

## Author

**Reid Petro**  
Cinematographer & Developer  
[reidpetro.com](https://www.reidpetro.com)
