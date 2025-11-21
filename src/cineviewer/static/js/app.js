// Application State
const appState = {
    originalImage: null,
    imageData: null,
    falseColorImage: null,  // Store false color version separately
    showCenter: false,
    centerType: 'small',
    showThirds: false,
    thirdsLineWidth: 1,
    showAspectRatio: false,
    aspectRatioType: 'original',
    showFalseColor: false,
    falseColorType: 'ARRI',
    showVectorscope: false,
    vectorscopePoints: [],
    histogram: { r: [], g: [], b: [] },
    highlightedPoint: null, // Store the currently highlighted vectorscope point
    showPalette: false,
    paletteColors: []
};

// Aspect Ratios (width:height)
const aspectRatios = {
    'original': null, // Will be calculated from image
    '16:9': 16/9,
    '9:16': 9/16,
    '1:1': 1/1,
    '2:1': 2/1,
    '2.35:1': 2.35/1,
    '4:3': 4/3
};

// Canvas Elements
const imageCanvas = document.getElementById('imageCanvas');
const histogramCanvas = document.getElementById('histogramCanvas');
const vectorscopeCanvas = document.getElementById('vectorscopeCanvas');
const legendCanvas = document.getElementById('legendCanvas');
const imageCtx = imageCanvas.getContext('2d', { willReadFrequently: true });
const histogramCtx = histogramCanvas.getContext('2d');
const vectorscopeCtx = vectorscopeCanvas.getContext('2d');
const legendCtx = legendCanvas.getContext('2d');
const placeholder = document.getElementById('placeholder');
const imageContainerEl = document.querySelector('.image-container');
const wrapperEl = document.querySelector('.image-vectorscope-wrapper');
const histogramContainerEl = document.querySelector('.histogram-container');

// UI Elements
const openImageBtn = document.getElementById('openImageBtn');
const fileInput = document.getElementById('fileInput');
const centerBtn = document.getElementById('centerBtn');
const centerControls = document.getElementById('centerControls');
const thirdsBtn = document.getElementById('thirdsBtn');
const thirdsControls = document.getElementById('thirdsControls');
const thirdsSlider = document.getElementById('thirdsSlider');
const aspectRatioBtn = document.getElementById('aspectRatioBtn');
const aspectRatioControls = document.getElementById('aspectRatioControls');
const falsecolorBtn = document.getElementById('falsecolorBtn');
const falsecolorControls = document.getElementById('falsecolorControls');
const vectorscopeBtn = document.getElementById('vectorscopeBtn');
const vectorscopeContainer = document.getElementById('vectorscopeContainer');
const legendContainer = document.getElementById('legendContainer');
const paletteBtn = document.getElementById('paletteBtn');
const paletteContainer = document.getElementById('paletteContainer');
const loadingSpinner = document.getElementById('loadingSpinner');

// Image Info Elements
const resolutionInfo = document.getElementById('resolutionInfo');
const aspectRatioInfo = document.getElementById('aspectRatioInfo');
const aspectRatioButtonText = document.getElementById('aspectRatioButtonText');
const contrastRatioInfo = document.getElementById('contrastRatioInfo');

// Event Listeners
openImageBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
centerBtn.addEventListener('click', toggleCenter);
thirdsBtn.addEventListener('click', toggleThirds);
aspectRatioBtn.addEventListener('click', toggleAspectRatio);
falsecolorBtn.addEventListener('click', toggleFalseColor);
vectorscopeBtn.addEventListener('click', toggleVectorscope);
paletteBtn.addEventListener('click', togglePalette);

// Mouse tracking for vectorscope highlighting - DISABLED
// imageCanvas.addEventListener('mousemove', handleMouseMove);
// imageCanvas.addEventListener('mouseleave', () => {
//     appState.highlightedPoint = null;
//     if (appState.showVectorscope) {
//         drawVectorscope();
//     }
// });
thirdsSlider.addEventListener('input', (e) => {
    appState.thirdsLineWidth = parseInt(e.target.value);
    document.getElementById('sliderValue').textContent = e.target.value;
    drawImage();
});

// Center Type Buttons
document.querySelectorAll('[data-center-type]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        appState.centerType = e.target.dataset.centerType;
        updateSubButtonStates('[data-center-type]', 'center-type');
        drawImage();
    });
});

// Aspect Ratio Type Buttons
document.querySelectorAll('[data-aspect-type]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        appState.aspectRatioType = e.target.dataset.aspectType;
        updateSubButtonStates('[data-aspect-type]', 'aspect-type');
        drawImage();
    });
});

// False Color Type Buttons
document.querySelectorAll('[data-fc-type]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        appState.falseColorType = e.target.dataset.fcType;
        updateSubButtonStates('[data-fc-type]', 'fc-type');
        if (appState.showFalseColor && appState.originalImage) {
            applyFalseColor();
        }
    });
});

// Drag and Drop
imageCanvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageCanvas.style.opacity = '0.5';
});

imageCanvas.addEventListener('dragleave', () => {
    imageCanvas.style.opacity = '1';
});

imageCanvas.addEventListener('drop', (e) => {
    e.preventDefault();
    imageCanvas.style.opacity = '1';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect({ target: { files } });
    }
});

// Helper Functions
function enableControlButtons() {
    // Enable all control buttons when an image is loaded
    centerBtn.disabled = false;
    thirdsBtn.disabled = false;
    aspectRatioBtn.disabled = false;
    falsecolorBtn.disabled = false;
    vectorscopeBtn.disabled = false;
    paletteBtn.disabled = false;
}

function updateSubButtonStates(selector, attrType) {
    document.querySelectorAll(selector).forEach(btn => {
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.style.borderColor = '';
    });
    
    let activeAttr, activeValue;
    if (attrType === 'center-type') {
        activeAttr = 'data-center-type';
        activeValue = appState.centerType;
    } else if (attrType === 'aspect-type') {
        activeAttr = 'data-aspect-type';
        activeValue = appState.aspectRatioType;
    } else {
        activeAttr = 'data-fc-type';
        activeValue = appState.falseColorType;
    }
    
    document.querySelector(`[${activeAttr}="${activeValue}"]`).style.backgroundColor = '#4CAF50';
    document.querySelector(`[${activeAttr}="${activeValue}"]`).style.color = 'white';
}

function toggleCenter() {
    appState.showCenter = !appState.showCenter;
    centerBtn.classList.toggle('active', appState.showCenter);
    centerControls.style.display = appState.showCenter ? 'flex' : 'none';
    drawImage();
}

function toggleThirds() {
    appState.showThirds = !appState.showThirds;
    thirdsBtn.classList.toggle('active', appState.showThirds);
    thirdsControls.style.display = appState.showThirds ? 'block' : 'none';
    drawImage();
}

function toggleAspectRatio() {
    appState.showAspectRatio = !appState.showAspectRatio;
    aspectRatioBtn.classList.toggle('active', appState.showAspectRatio);
    aspectRatioControls.style.display = appState.showAspectRatio ? 'flex' : 'none';
    drawImage();
}

function toggleFalseColor() {
    appState.showFalseColor = !appState.showFalseColor;
    falsecolorBtn.classList.toggle('active', appState.showFalseColor);
    falsecolorControls.style.display = appState.showFalseColor ? 'flex' : 'none';
    legendContainer.style.display = appState.showFalseColor ? 'block' : 'none';
    if (appState.showFalseColor && appState.originalImage) {
        applyFalseColor();
    } else {
        drawImage();
        drawLegend(); // Always redraw legend on toggle
    }
    // Ensure image re-fits after layout changes
    window.requestAnimationFrame(() => drawImage());
}

function toggleVectorscope() {
    appState.showVectorscope = !appState.showVectorscope;
    vectorscopeBtn.classList.toggle('active', appState.showVectorscope);
    vectorscopeContainer.style.display = appState.showVectorscope ? 'block' : 'none';
    drawVectorscope();
    // Ensure image re-fits when the right panel changes width
    window.requestAnimationFrame(() => drawImage());
}

function togglePalette() {
    appState.showPalette = !appState.showPalette;
    paletteBtn.classList.toggle('active', appState.showPalette);
    paletteContainer.style.display = appState.showPalette ? 'flex' : 'none';
    if (appState.showPalette && appState.paletteColors.length > 0) {
        displayPalette();
    }
    // Ensure image re-fits when the left panel changes width
    window.requestAnimationFrame(() => drawImage());
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
            appState.originalImage = img;
            
            // Show loading spinner
            loadingSpinner.style.display = 'flex';
            placeholder.style.display = 'none';
            
            // Upload to server for processing
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    appState.imageData = data.image_data;
                    appState.histogram = data.histogram;
                    appState.vectorscopePoints = data.vectorscope;
                    appState.paletteColors = data.palette || [];

                    resolutionInfo.textContent = `${data.width}x${data.height}`;
                    aspectRatioInfo.textContent = `${data.aspect_ratio}:1`;
                    aspectRatioButtonText.textContent = `${data.aspect_ratio}:1`;
                    contrastRatioInfo.textContent = data.contrast_ratio ? `${data.contrast_ratio}:1` : '-';

                    // Hide loading spinner
                    loadingSpinner.style.display = 'none';
                    placeholder.style.display = 'none';
                    imageCanvas.classList.add('visible');
                    
                    // Enable control buttons
                    enableControlButtons();
                    
                    drawImage();
                    drawHistogram();
                    drawLegend();
                    
                    if (appState.showVectorscope) {
                        drawVectorscope();
                    }
                    
                    if (appState.showPalette) {
                        displayPalette();
                    }
                } else {
                    loadingSpinner.style.display = 'none';
                    alert('Error processing image: ' + data.error);
                }
            } catch (error) {
                console.error('Upload error:', error);
                loadingSpinner.style.display = 'none';
                alert('Error uploading image');
            }
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function drawImage() {
    if (!appState.originalImage || !imageCanvas.parentElement) return;

    const container = imageCanvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Fit image inside container while maintaining aspect ratio.
    // Height will never exceed container height.
    const iw = appState.originalImage.width;
    const ih = appState.originalImage.height;
    const scale = Math.min(containerWidth / iw, containerHeight / ih);
    const canvasWidth = Math.max(1, Math.floor(iw * scale));
    const canvasHeight = Math.max(1, Math.floor(ih * scale));

    // Set canvas internal size and displayed size
    imageCanvas.width = canvasWidth;
    imageCanvas.height = canvasHeight;
    imageCanvas.style.width = canvasWidth + 'px';
    imageCanvas.style.height = canvasHeight + 'px';

    // Draw image
    if (appState.showFalseColor && appState.falseColorImage) {
        const fcImg = new Image();
        fcImg.onload = () => {
            imageCtx.drawImage(fcImg, 0, 0, canvasWidth, canvasHeight);
            drawOverlays();
        };
        fcImg.src = 'data:image/png;base64,' + appState.falseColorImage;
    } else {
        imageCtx.drawImage(appState.originalImage, 0, 0, canvasWidth, canvasHeight);
        drawOverlays();
    }
}

function drawOverlays() {
    const width = imageCanvas.width;
    const height = imageCanvas.height;

    // Calculate visible area dimensions if aspect ratio overlay is active
    let visibleWidth = width;
    let visibleHeight = height;
    let visibleX = 0;
    let visibleY = 0;

    if (appState.showAspectRatio && appState.aspectRatioType !== 'original') {
        const targetRatio = aspectRatios[appState.aspectRatioType];
        const currentRatio = width / height;
        
        if (targetRatio > currentRatio) {
            // Image is taller than target - bars on top and bottom
            visibleHeight = width / targetRatio;
            visibleY = (height - visibleHeight) / 2;
        } else if (targetRatio < currentRatio) {
            // Image is wider than target - bars on left and right
            visibleWidth = height * targetRatio;
            visibleX = (width - visibleWidth) / 2;
        }
    }

    // Draw thirds based on visible area
    if (appState.showThirds) {
        imageCtx.strokeStyle = 'white';
        imageCtx.lineWidth = appState.thirdsLineWidth;
        
        const thirdX = visibleWidth / 3;
        const thirdY = visibleHeight / 3;

        // Vertical lines
        imageCtx.beginPath();
        imageCtx.moveTo(visibleX + thirdX, visibleY);
        imageCtx.lineTo(visibleX + thirdX, visibleY + visibleHeight);
        imageCtx.stroke();

        imageCtx.beginPath();
        imageCtx.moveTo(visibleX + thirdX * 2, visibleY);
        imageCtx.lineTo(visibleX + thirdX * 2, visibleY + visibleHeight);
        imageCtx.stroke();

        // Horizontal lines
        imageCtx.beginPath();
        imageCtx.moveTo(visibleX, visibleY + thirdY);
        imageCtx.lineTo(visibleX + visibleWidth, visibleY + thirdY);
        imageCtx.stroke();

        imageCtx.beginPath();
        imageCtx.moveTo(visibleX, visibleY + thirdY * 2);
        imageCtx.lineTo(visibleX + visibleWidth, visibleY + thirdY * 2);
        imageCtx.stroke();
    }

    // Draw center cross based on visible area
    if (appState.showCenter) {
        const centerX = visibleX + visibleWidth / 2;
        const centerY = visibleY + visibleHeight / 2;
        imageCtx.strokeStyle = 'white';
        imageCtx.lineWidth = 2;

        let lineLength;
        if (appState.centerType === 'standard') {
            lineLength = visibleHeight * 0.04;
        } else if (appState.centerType === 'small') {
            lineLength = visibleHeight * 0.02;
        } else {
            // square
            const squareSize = visibleHeight * 0.02;
            imageCtx.strokeRect(centerX - squareSize / 2, centerY - squareSize / 2, squareSize, squareSize);
            return;
        }

        imageCtx.beginPath();
        imageCtx.moveTo(centerX - lineLength, centerY);
        imageCtx.lineTo(centerX + lineLength, centerY);
        imageCtx.stroke();

        imageCtx.beginPath();
        imageCtx.moveTo(centerX, centerY - lineLength);
        imageCtx.lineTo(centerX, centerY + lineLength);
        imageCtx.stroke();
    }

    // Draw aspect ratio overlay
    if (appState.showAspectRatio && appState.aspectRatioType !== 'original') {
        const targetRatio = aspectRatios[appState.aspectRatioType];
        const currentRatio = width / height;
        
        imageCtx.fillStyle = 'rgba(0, 0, 0, 1)'; // Solid black bars
        
        if (targetRatio > currentRatio) {
            // Image is taller than target - add bars on top and bottom
            const targetHeight = width / targetRatio;
            const barHeight = (height - targetHeight) / 2;
            
            // Top bar
            imageCtx.fillRect(0, 0, width, barHeight);
            // Bottom bar
            imageCtx.fillRect(0, height - barHeight, width, barHeight);
        } else if (targetRatio < currentRatio) {
            // Image is wider than target - add bars on left and right
            const targetWidth = height * targetRatio;
            const barWidth = (width - targetWidth) / 2;
            
            // Left bar
            imageCtx.fillRect(0, 0, barWidth, height);
            // Right bar
            imageCtx.fillRect(width - barWidth, 0, barWidth, height);
        }
    }
}

async function applyFalseColor() {
    if (!appState.imageData) return;

    console.log('applyFalseColor called, type:', appState.falseColorType); // DEBUG
    try {
        const response = await fetch('/api/false-color', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: appState.imageData,
                type: appState.falseColorType
            })
        });

        const data = await response.json();
        console.log('API response success:', data.success); // DEBUG
        if (data.success) {
            appState.falseColorImage = data.image_data;  // Store in separate property
            console.log('False color image stored, calling drawImage and drawLegend'); // DEBUG
            drawImage();
            drawLegend();
        }
    } catch (error) {
        console.error('False color error:', error);
    }
}

function drawHistogram() {
    if (!histogramCanvas || !appState.histogram.r.length) return;

    const width = histogramCanvas.clientWidth;
    const height = histogramCanvas.clientHeight;
    histogramCanvas.width = width;
    histogramCanvas.height = height;

    const maxValue = Math.max(
        Math.max(...appState.histogram.r),
        Math.max(...appState.histogram.g),
        Math.max(...appState.histogram.b)
    );

    // Background
    histogramCtx.fillStyle = '#1a1a1a';
    histogramCtx.fillRect(0, 0, width, height);

    // Reference lines
    histogramCtx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    histogramCtx.lineWidth = 1;
    for (let percent of [25, 50, 75, 100]) {
        const y = height * (1 - percent / 100);
        histogramCtx.beginPath();
        histogramCtx.moveTo(0, y);
        histogramCtx.lineTo(width, y);
        histogramCtx.stroke();
    }

    // Draw bars
    const barWidth = width / 256;
    for (let i = 0; i < 256; i++) {
        const rHeight = (appState.histogram.r[i] / maxValue) * height;
        const gHeight = (appState.histogram.g[i] / maxValue) * height;
        const bHeight = (appState.histogram.b[i] / maxValue) * height;

        histogramCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        histogramCtx.fillRect(i * barWidth, height - rHeight, barWidth, rHeight);

        histogramCtx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        histogramCtx.fillRect(i * barWidth, height - gHeight, barWidth, gHeight);

        histogramCtx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        histogramCtx.fillRect(i * barWidth, height - bHeight, barWidth, bHeight);
    }
}

function drawLegend() {
    if (!legendCanvas) return;

    // Always set canvas internal size to match displayed size
    const displayWidth = legendCanvas.offsetWidth;
    const displayHeight = legendCanvas.offsetHeight;
    legendCanvas.width = displayWidth;
    legendCanvas.height = displayHeight;
    const width = legendCanvas.width;
    const height = legendCanvas.height;

    // Define legend sets for each false color type
    const legendSets = {
        'ARRI': [
            { color: [128, 0, 128], range: '0-2.5%', desc: 'black clipping' },
            { color: [0, 0, 255], range: '2.5-4%', desc: 'just above black' },
            { color: [0, 255, 0], range: '38-42%', desc: '18% gray' },
            { color: [255, 0, 255], range: '52-56%', desc: 'one stop over gray' },
            { color: [255, 255, 0], range: '97-99%', desc: 'just below white' },
            { color: [255, 0, 0], range: '99%+', desc: 'white clipping' }
        ],
        'Sony': [
            { color: [128, 0, 128], range: '0-3%', desc: 'black clipping' },
            { color: [0, 0, 255], range: '3-24%', desc: 'just above black' },
            { color: [173, 216, 230], range: '24-38%', desc: '' },
            { color: [0, 255, 0], range: '38-43%', desc: '18% gray' },
            { color: [0, 255, 255], range: '43-47%', desc: '' },
            { color: [255, 182, 193], range: '47-54%', desc: 'one stop over gray' },
            { color: [255, 0, 255], range: '54-58%', desc: '' },
            { color: [255, 165, 0], range: '87-91%', desc: '' },
            { color: [255, 255, 0], range: '91-93%', desc: 'just below white' },
            { color: [255, 0, 0], range: '93-96%', desc: 'white clipping' }
        ],
        'Blackmagic': [
            { color: [128, 0, 128], range: '0-5%', desc: 'black clipping' }, // purple
            { color: [0, 0, 255], range: '5-10%', desc: 'shadows' }, // blue
            { color: [0, 255, 0], range: '40-45%', desc: '18% gray' },
            { color: [255, 255, 0], range: '90-95%', desc: 'highlights' },
            { color: [255, 0, 0], range: '95%+', desc: 'white clipping' }
        ]
    };

    // Pick legend set based on current falseColorType, fallback to ARRI
    const colors = legendSets[appState.falseColorType] || legendSets['ARRI'];

    const legendWidth = width * 0.9; // 90% of canvas width
    const boxWidth = legendWidth / colors.length;
    const startX = (width - legendWidth) / 2;

    colors.forEach((item, i) => {
        const x = startX + i * boxWidth;
        legendCtx.fillStyle = `rgb(${item.color.join(',')})`;
        legendCtx.fillRect(x + 2, 5, boxWidth - 4, height - 10);

        legendCtx.fillStyle = item.color[0] === 255 && item.color[1] === 255 && item.color[2] === 0 ? '#000' : '#fff';
        // Font size scales with canvas height
        const fontSize = Math.round(height * 0.22); // ~18px for 80px height
        const descFontSize = Math.round(height * 0.18); // ~14px for 80px height
        legendCtx.textAlign = 'center';
        // Center vertically in the box
        const boxTop = 5;
        const boxHeight = height - 10;
        const boxCenterY = boxTop + boxHeight / 2;
        // Range text a bit above center, desc a bit below
        legendCtx.font = `${fontSize}px Arial`;
        legendCtx.textBaseline = 'alphabetic';
        legendCtx.fillText(item.range, x + boxWidth / 2, boxCenterY - descFontSize / 2 + 2);
        legendCtx.font = `italic ${descFontSize}px Arial`;
        legendCtx.textBaseline = 'hanging';
        legendCtx.fillText(item.desc, x + boxWidth / 2, boxCenterY + 2);
    });
}

let lastRequestTime = 0;
const THROTTLE_MS = 50; // Throttle to max 20 requests per second

function displayPalette() {
    if (!appState.paletteColors || appState.paletteColors.length === 0) return;
    
    const swatches = document.querySelectorAll('.palette-swatch');
    appState.paletteColors.forEach((color, index) => {
        if (index < swatches.length) {
            const swatch = swatches[index];
            swatch.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
            swatch.setAttribute('data-hex', color.hex);
            
            // Add click to copy hex value
            swatch.onclick = () => {
                navigator.clipboard.writeText(color.hex).then(() => {
                    // Visual feedback
                    const originalBorder = swatch.style.borderColor;
                    swatch.style.borderColor = '#4CAF50';
                    setTimeout(() => {
                        swatch.style.borderColor = originalBorder || '#3a3a3a';
                    }, 300);
                });
            };
        }
    });
}

async function handleMouseMove(event) {
    if (!appState.originalImage || !appState.imageData || !appState.showVectorscope) return;

    // Throttle requests
    const now = Date.now();
    if (now - lastRequestTime < THROTTLE_MS) return;
    lastRequestTime = now;

    // Get mouse position relative to canvas
    const rect = imageCanvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * (imageCanvas.width / rect.width));
    const y = Math.floor((event.clientY - rect.top) * (imageCanvas.height / rect.height));
    
    // Check if coordinates are within bounds
    if (x < 0 || x >= imageCanvas.width || y < 0 || y >= imageCanvas.height) return;

    try {
        const response = await fetch('/api/pixel-color', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: appState.imageData,
                x: x,
                y: y
            }),
            credentials: 'same-origin'  // Include cookies if any
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            appState.highlightedPoint = {
                u: data.vectorscope.u,
                v: data.vectorscope.v,
                color: data.color
            };
            drawVectorscope();
        } else {
            console.error('API Error:', data.error);
        }
    } catch (error) {
        console.error('Pixel color error:', error);
        // Clear highlight on error
        appState.highlightedPoint = null;
    }
}

function drawVectorscope() {
    if (!vectorscopeCanvas || !appState.vectorscopePoints.length) return;

    const width = vectorscopeCanvas.clientWidth;
    const height = vectorscopeCanvas.clientHeight;
    vectorscopeCanvas.width = width;
    vectorscopeCanvas.height = height;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Background
    vectorscopeCtx.fillStyle = '#1a1a1a';
    vectorscopeCtx.fillRect(0, 0, width, height);

    // Main circle
    vectorscopeCtx.strokeStyle = '#666';
    vectorscopeCtx.lineWidth = 2;
    vectorscopeCtx.beginPath();
    vectorscopeCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    vectorscopeCtx.stroke();

    // Reference colors
    const refPoints = [
        { angle: 100, label: 'R', color: '#ff0000' },
        { angle: 45, label: 'Mg', color: '#ff00ff' },
        { angle: 350, label: 'B', color: '#0000ff' },
        { angle: 290, label: 'Cy', color: '#00ffff' },
        { angle: 225, label: 'G', color: '#00ff00' },
        { angle: 160, label: 'Yl', color: '#ffff00' }
    ];

    const boxSize = 22;
    refPoints.forEach(ref => {
        const rad = ref.angle * Math.PI / 180;
        const x = cx + (radius - boxSize) * Math.cos(rad);
        const y = cy - (radius - boxSize) * Math.sin(rad);

        vectorscopeCtx.strokeStyle = ref.color;
        vectorscopeCtx.lineWidth = 2;
        vectorscopeCtx.strokeRect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize);

        vectorscopeCtx.fillStyle = ref.color;
        vectorscopeCtx.font = 'bold 10px Arial';
        vectorscopeCtx.textAlign = 'center';
        vectorscopeCtx.textBaseline = 'middle';
        vectorscopeCtx.fillText(ref.label, x, y);
    });

    // Draw trace points
    vectorscopeCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    appState.vectorscopePoints.forEach(point => {
        const mag = Math.hypot(point.u, point.v);
        const theta = Math.atan2(point.v, point.u);
        const px = cx + mag * 500 * Math.cos(theta);
        const py = cy - mag * 500 * Math.sin(theta);

        if (px >= 0 && px < width && py >= 0 && py < height) {
            vectorscopeCtx.fillRect(px - 1, py - 1, 2, 2);
        }
    });

    // Draw highlighted point if exists - DISABLED
    // if (appState.highlightedPoint) {
    //     const point = appState.highlightedPoint;
    //     const mag = Math.hypot(point.u, point.v);
    //     const theta = Math.atan2(point.v, point.u);
    //     const px = cx + mag * 500 * Math.cos(theta);
    //     const py = cy - mag * 500 * Math.sin(theta);

    //     if (px >= 0 && px < width && py >= 0 && py < height) {
    //         // Draw a larger, colored point
    //         vectorscopeCtx.fillStyle = `rgb(${point.color.r}, ${point.color.g}, ${point.color.b})`;
    //         vectorscopeCtx.beginPath();
    //         vectorscopeCtx.arc(px, py, 4, 0, Math.PI * 2);
    //         vectorscopeCtx.fill();
            
    //         // Draw a white ring around it
    //         vectorscopeCtx.strokeStyle = 'white';
    //         vectorscopeCtx.lineWidth = 1;
    //         vectorscopeCtx.beginPath();
    //         vectorscopeCtx.arc(px, py, 5, 0, Math.PI * 2);
    //         vectorscopeCtx.stroke();
    //     }
    // }
}

// Initial draw
window.addEventListener('resize', () => {
    drawImage();
    drawHistogram();
});

// Redraw image when layout-affecting containers resize
if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
        window.requestAnimationFrame(() => drawImage());
    });
    if (imageContainerEl) ro.observe(imageContainerEl);
    if (wrapperEl) ro.observe(wrapperEl);
    if (histogramContainerEl) ro.observe(histogramContainerEl);
    if (legendContainer) ro.observe(legendContainer);
    if (paletteContainer) ro.observe(paletteContainer);
}
