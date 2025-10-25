# Cine Viewer - Web Edition

A self-hosted web application for cinematography image analysis and false color grading.

## Features

- **Image Upload**: Upload and analyze images in your browser
- **False Color Grading**: Multiple false color standards (ARRI, Blackmagic, RED, Sony)
- **Center Cross**: Mark image center with configurable styles
- **Thirds Grid**: Rule of thirds overlay with adjustable line thickness
- **Histogram**: Real-time RGB histogram analysis
- **Vectorscope**: Video measurement tool for color analysis
- **Image Information**: Display resolution and aspect ratio

## Installation

### Requirements
- Python 3.8+
- pip

### Setup

1. Navigate to the web_app directory:
```bash
cd web_app
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the App

### Development Mode
```bash
python app.py
```

The application will be available at `http://localhost:8080`

### Production Mode

For self-hosting in production, use a production WSGI server:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8080 app:app
```

Or with Waitress (Windows compatible):
```bash
pip install waitress
waitress-serve --port=8080 app:app
```

## Usage

1. **Open an image** by clicking "Open Image" or dragging an image into the viewer
2. **Enable overlays**:
   - Click "Center Cross" to show image center marker
   - Click "Thirds Grid" to show rule of thirds overlay
   - Click "False Color" to apply false color grading
   - Click "Vectorscope" to display color vector analysis
3. **Adjust settings**:
   - Use sub-buttons to change center marker type or false color standard
   - Adjust line thickness for thirds grid with the slider
4. **View image information** in the sidebar (resolution, aspect ratio)

## Architecture

### Backend (Flask)
- `app.py`: Main Flask application
- Image processing with NumPy and PIL
- Endpoints for image upload and false color processing
- Histogram and vectorscope computation

### Frontend (Vanilla JavaScript)
- `templates/index.html`: Main HTML structure
- `static/css/style.css`: Styling with dark theme
- `static/js/app.js`: Application logic and canvas rendering

## File Structure

```
web_app/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── css/
    │   └── style.css     # Styling
    └── js/
        └── app.js        # Frontend application logic
```

## Supported Image Formats

- PNG
- JPG/JPEG
- BMP
- TIFF

## False Color Standards

- **ARRI**: ARRI camera false color mapping
- **Blackmagic**: Blackmagic camera false color mapping
- **RED**: RED camera false color (placeholder)
- **Sony**: Sony camera false color (placeholder)

## Browser Support

Works in all modern browsers supporting:
- Canvas API
- Fetch API
- FileReader API
- Drag & Drop

## Network Access

By default, the Flask server binds to `0.0.0.0` on port 5000, making it accessible from any device on the network at:
```
http://<your-ip-address>:5000
```

To restrict access to localhost only, modify `app.py`:
```python
app.run(debug=True, host='127.0.0.1', port=5000)
```

## Performance Notes

- Vectorscope downsamples to ~2000 points for performance
- False color processing is done server-side
- Histogram computation is optimized with NumPy
- All images are scaled to fit container while maintaining aspect ratio

## License

Reid Petro
