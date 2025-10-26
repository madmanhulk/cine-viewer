from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import numpy as np
from PIL import Image
import io
import base64
import os
import time
import logging
import threading
from datetime import datetime
from collections import defaultdict

# Read version from VERSION file
with open(os.path.join(os.path.dirname(__file__), 'VERSION')) as f:
    __version__ = f.read().strip()

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)  # Enable CORS for all routes
app.config['MAX_CONTENT_LENGTH'] = 35 * 1024 * 1024  # 35MB max upload
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Client tracking
clients = defaultdict(lambda: {"last_seen": 0})
client_lock = threading.Lock()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'tiff'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def compute_histogram(image_array):
    """Compute RGB histograms from image array."""
    if len(image_array.shape) == 3:
        if image_array.shape[2] == 4:  # RGBA
            image_array = image_array[:,:,:3]
        r = image_array[:,:,0].flatten()
        g = image_array[:,:,1].flatten()
        b = image_array[:,:,2].flatten()
    else:
        r = g = b = image_array.flatten()
    
    hist_r = np.bincount(r.astype(int), minlength=256)
    hist_g = np.bincount(g.astype(int), minlength=256)
    hist_b = np.bincount(b.astype(int), minlength=256)
    
    return hist_r.tolist(), hist_g.tolist(), hist_b.tolist()

def apply_false_color(image_array, fc_type="ARRI"):
    """Apply false color grading to image."""
    if len(image_array.shape) == 3 and image_array.shape[2] == 4:
        image_array = image_array[:,:,:3]
    
    height, width = image_array.shape[:2]
    out = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Calculate brightness
    r = image_array[:,:,0].astype(float)
    g = image_array[:,:,1].astype(float)
    b = image_array[:,:,2].astype(float)
    brightness = np.maximum.reduce([r, g, b]) / 255.0 * 100.0
    
    if fc_type == "ARRI":
        mask_red = brightness >= 99
        mask_yellow = (brightness >= 97) & (brightness < 99)
        mask_pink = (brightness >= 52) & (brightness < 56)
        mask_green = (brightness >= 38) & (brightness < 42)
        mask_blue = (brightness >= 2.5) & (brightness < 4)
        mask_purple = (brightness >= 0) & (brightness < 2.5)
        mask_gray = ~(mask_red | mask_yellow | mask_pink | mask_green | mask_blue | mask_purple)
        
        out[mask_red] = [255, 0, 0]
        out[mask_yellow] = [255, 255, 0]
        out[mask_pink] = [255, 0, 255]
        out[mask_green] = [0, 255, 0]
        out[mask_blue] = [0, 0, 255]
        out[mask_purple] = [128, 0, 128]
        
        gray_vals = (brightness / 100 * 255).astype(np.uint8)
        out[mask_gray] = np.stack([gray_vals[mask_gray]]*3, axis=-1)
    
    elif fc_type == "Blackmagic":
        mask_red = brightness >= 91
        mask_yellow = (brightness >= 88) & (brightness < 91)
        mask_pink = (brightness >= 45) & (brightness < 50)
        mask_green = (brightness >= 36) & (brightness < 42)
        mask_blue = (brightness >= 15) & (brightness < 18)
        mask_purple = (brightness >= 0) & (brightness < 15)
        mask_gray = ~(mask_red | mask_yellow | mask_pink | mask_green | mask_blue | mask_purple)
        
        out[mask_red] = [255, 0, 0]
        out[mask_yellow] = [255, 255, 0]
        out[mask_pink] = [255, 0, 255]
        out[mask_green] = [0, 255, 0]
        out[mask_blue] = [0, 0, 255]
        out[mask_purple] = [128, 0, 128]
        
        gray_vals = (brightness / 100 * 255).astype(np.uint8)
        out[mask_gray] = np.stack([gray_vals[mask_gray]]*3, axis=-1)
    
    else:
        # RED and Sony default to copy
        out = image_array.astype(np.uint8)
    
    return out

def compute_vectorscope(image_array):
    """Compute vectorscope data from image."""
    if len(image_array.shape) == 3 and image_array.shape[2] == 4:
        image_array = image_array[:,:,:3]
    
    height, width = image_array.shape[:2]
    r = image_array[:,:,0].astype(float) / 255.0
    g = image_array[:,:,1].astype(float) / 255.0
    b = image_array[:,:,2].astype(float) / 255.0
    
    # Convert to UV (chrominance)
    Y = 0.299 * r + 0.587 * g + 0.114 * b
    u = 0.492 * (b - Y)
    v = 0.877 * (r - Y)
    
    # Clip to valid range
    u = np.clip(u, -0.5, 0.5)
    v = np.clip(v, -0.5, 0.5)
    
    # Sample points (downsample for performance)
    flat_u = u.flatten()
    flat_v = v.flatten()
    step = max(1, len(flat_u) // 2000)
    
    points = []
    for i in range(0, len(flat_u), step):
        points.append({
            'u': float(flat_u[i]),
            'v': float(flat_v[i])
        })
    
    return points

def image_to_base64(image_array):
    """Convert numpy array to base64 PNG."""
    img = Image.fromarray(image_array.astype('uint8'), 'RGB')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

def cleanup_clients():
    """Remove clients that haven't been seen in the last 10 seconds"""
    while True:
        time.sleep(5)  # Check every 5 seconds
        current_time = time.time()
        active_count = 0
        
        with client_lock:
            # Remove clients not seen in the last 10 seconds
            for client_ip, data in list(clients.items()):
                if current_time - data["last_seen"] > 10:
                    del clients[client_ip]
                else:
                    active_count += 1
            
            logger.info(f"Active clients: {active_count}")

@app.before_request
def track_client():
    """Track client connection"""
    client_ip = request.remote_addr
    with client_lock:
        clients[client_ip]["last_seen"] = time.time()

@app.route('/')
def index():
    return render_template('index.html', version=__version__)

@app.route('/api/version')
def get_version():
    return jsonify({'version': __version__})

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        img = Image.open(file.stream)
        img_array = np.array(img)
        
        # Convert to RGB if necessary
        if len(img_array.shape) == 2:  # Grayscale
            img_array = np.stack([img_array]*3, axis=-1)
        elif img_array.shape[2] == 4:  # RGBA
            img_array = img_array[:,:,:3]
        elif img_array.shape[2] != 3:  # Other format
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Compute histogram
        hist_r, hist_g, hist_b = compute_histogram(img_array)
        
        # Compute vectorscope
        vectorscope_points = compute_vectorscope(img_array)
        
        # Get image info
        height, width = img_array.shape[:2]
        aspect_ratio = width / height
        
        return jsonify({
            'success': True,
            'width': width,
            'height': height,
            'aspect_ratio': f"{aspect_ratio:.2f}" if not aspect_ratio.is_integer() else f"{int(aspect_ratio)}",
            'histogram': {
                'r': hist_r,
                'g': hist_g,
                'b': hist_b
            },
            'vectorscope': vectorscope_points,
            'image_data': image_to_base64(img_array)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pixel-color', methods=['POST'])
def pixel_color():
    try:
        logger.info(f"Received pixel-color request from {request.remote_addr}")
        data = request.get_json()
        if not data:
            logger.error("No JSON data received in request")
            return jsonify({'error': 'No JSON data received'}), 400
            
        image_base64 = data.get('image')
        x = data.get('x')
        y = data.get('y')
        
        logger.info(f"Processing pixel at coordinates: ({x}, {y})")
        
        if not image_base64 or x is None or y is None:
            logger.error(f"Missing data - image: {bool(image_base64)}, x: {x}, y: {y}")
            return jsonify({'error': 'Missing required data'}), 400
            
        # Decode image
        image_data = base64.b64decode(image_base64)
        img = Image.open(io.BytesIO(image_data))
        img_array = np.array(img)
        
        # Convert to RGB if necessary
        if len(img_array.shape) == 2:  # Grayscale
            img_array = np.stack([img_array]*3, axis=-1)
        elif img_array.shape[2] == 4:  # RGBA
            img_array = img_array[:,:,:3]
            
        # Get pixel color and convert to UV
        r = float(img_array[y, x, 0]) / 255.0
        g = float(img_array[y, x, 1]) / 255.0
        b = float(img_array[y, x, 2]) / 255.0
        
        # Convert to UV (chrominance)
        Y = 0.299 * r + 0.587 * g + 0.114 * b
        u = 0.492 * (b - Y)
        v = 0.877 * (r - Y)
        
        return jsonify({
            'success': True,
            'color': {
                'r': int(r * 255),
                'g': int(g * 255),
                'b': int(b * 255)
            },
            'vectorscope': {
                'u': float(u),
                'v': float(v)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/false-color', methods=['POST'])
def false_color():
    try:
        data = request.get_json()
        image_base64 = data.get('image')
        fc_type = data.get('type', 'ARRI')
        
        if not image_base64:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode image
        image_data = base64.b64decode(image_base64)
        img = Image.open(io.BytesIO(image_data))
        img_array = np.array(img)
        
        # Apply false color
        fc_array = apply_false_color(img_array, fc_type)
        
        return jsonify({
            'success': True,
            'image_data': image_to_base64(fc_array)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Start the cleanup thread
    cleanup_thread = threading.Thread(target=cleanup_clients, daemon=True)
    cleanup_thread.start()
    
    from waitress import serve
    serve(app, 
          host='0.0.0.0', 
          port=8080,
          threads=6,
          connection_limit=1000,  # Max concurrent connections
          channel_timeout=300,    # 5 minutes max for large image processing
          cleanup_interval=30,    # Cleanup every 30 seconds
          max_request_body_size=35*1024*1024  # 35MB max upload limit
    )
