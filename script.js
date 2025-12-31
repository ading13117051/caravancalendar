// Global variables
let uploadedImages = new Array(12).fill(null);
let calendarGenerator = null;
let currentPage = 0;
let totalPages = 6; // 6 pages for 12 months (2 per page)
let customDates = []; // Store custom dates

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupUploadHandlers();
    setupControlHandlers();
    setupCustomDatesHandlers();
    setupBulkUpload();
    setupDragAndDrop();
    setupColorPalette();
    checkAllImagesUploaded();
});

// Setup upload handlers for all 12 months
function setupUploadHandlers() {
    for (let i = 0; i < 12; i++) {
        const uploadBox = document.getElementById(`upload-${i}`);
        const fileInput = document.getElementById(`file-${i}`);
        const preview = document.getElementById(`preview-${i}`);
        const removeBtn = document.getElementById(`remove-${i}`);
        
        // Click to upload
        uploadBox.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-btn')) {
                fileInput.click();
            }
        });
        
        // File selected
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                loadImage(file, i);
            }
        });
        
        // Remove image
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeImage(i);
        });
        
        // Drag and drop
        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.style.borderColor = '#667eea';
        });
        
        uploadBox.addEventListener('dragleave', (e) => {
            uploadBox.style.borderColor = '#ddd';
        });
        
        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.style.borderColor = '#ddd';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                loadImage(file, i);
            }
        });
    }
}

// Load and display image
function loadImage(file, index) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            uploadedImages[index] = img;
            
            // Show preview
            const preview = document.getElementById(`preview-${index}`);
            const placeholder = preview.previousElementSibling;
            const removeBtn = document.getElementById(`remove-${index}`);
            const uploadBox = document.getElementById(`upload-${index}`);
            
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            removeBtn.style.display = 'flex';
            uploadBox.classList.add('has-image');
            
            checkAllImagesUploaded();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Remove image
function removeImage(index) {
    uploadedImages[index] = null;
    
    const preview = document.getElementById(`preview-${index}`);
    const placeholder = preview.previousElementSibling;
    const removeBtn = document.getElementById(`remove-${index}`);
    const uploadBox = document.getElementById(`upload-${index}`);
    const fileInput = document.getElementById(`file-${index}`);
    
    preview.style.display = 'none';
    preview.src = '';
    placeholder.style.display = 'flex';
    removeBtn.style.display = 'none';
    uploadBox.classList.remove('has-image');
    fileInput.value = '';
    
    checkAllImagesUploaded();
}

// Check if all images are uploaded
function checkAllImagesUploaded() {
    const allUploaded = uploadedImages.every(img => img !== null);
    const generateBtn = document.getElementById('generateBtn');
    const infoText = document.querySelector('.info-text');
    
    if (allUploaded) {
        generateBtn.disabled = false;
        infoText.textContent = 'Siap untuk generate! ✨';
        infoText.style.color = '#28a745';
    } else {
        const remaining = uploadedImages.filter(img => img === null).length;
        generateBtn.disabled = true;
        infoText.textContent = `Upload ${remaining} foto lagi untuk mulai generate`;
        infoText.style.color = '#666';
    }
}

// Setup control handlers
function setupControlHandlers() {
    const generateBtn = document.getElementById('generateBtn');
    const yearSelect = document.getElementById('yearSelect');
    const showHolidays = document.getElementById('showHolidays');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const downloadCurrentPage = document.getElementById('downloadCurrentPage');
    const downloadAllZip = document.getElementById('downloadAllZip');
    const downloadAllPages = document.getElementById('downloadAllPages');
    
    generateBtn.addEventListener('click', generateCalendar);
    
    prevPage.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            renderCurrentPage();
        }
    });
    
    nextPage.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            renderCurrentPage();
        }
    });
    
    downloadCurrentPage.addEventListener('click', downloadCurrent);
    downloadAllZip.addEventListener('click', downloadZip);
    downloadAllPages.addEventListener('click', downloadAll);
}

// Setup custom dates handlers
function setupCustomDatesHandlers() {
    const addBtn = document.getElementById('addCustomDateBtn');
    addBtn.addEventListener('click', addCustomDateRow);
}

// Add custom date row
function addCustomDateRow() {
    const container = document.getElementById('customDatesContainer');
    const index = customDates.length;
    
    const row = document.createElement('div');
    row.className = 'custom-date-item';
    row.dataset.index = index;
    
    row.innerHTML = `
        <input type="date" class="custom-date-input" placeholder="Pilih tanggal">
        <input type="text" class="custom-name-input" placeholder="Nama acara (misal: Ulang tahun saya)">
        <button class="btn-remove-date" onclick="removeCustomDate(${index})">Hapus</button>
    `;
    
    container.appendChild(row);
    
    // Add to array
    customDates.push({ date: '', name: '' });
    
    // Add event listeners
    const dateInput = row.querySelector('.custom-date-input');
    const nameInput = row.querySelector('.custom-name-input');
    
    dateInput.addEventListener('change', (e) => {
        customDates[index].date = e.target.value;
    });
    
    nameInput.addEventListener('input', (e) => {
        customDates[index].name = e.target.value;
    });
}

// Remove custom date
function removeCustomDate(index) {
    const container = document.getElementById('customDatesContainer');
    const row = container.querySelector(`[data-index="${index}"]`);
    if (row) {
        row.remove();
        customDates[index] = null; // Mark as deleted
    }
}

// Get valid custom dates (filter out nulls and empty entries)
function getValidCustomDates() {
    return customDates
        .filter(d => d && d.date && d.name)
        .map(d => ({
            date: d.date,
            name: d.name
        }));
}

// Generate calendar
function generateCalendar() {
    const year = parseInt(document.getElementById('yearSelect').value);
    const showHolidays = document.getElementById('showHolidays').checked;
    const monthFont = document.getElementById('monthFontSelect').value;
    const dateFont = document.getElementById('dateFontSelect').value;
    const colorPalette = document.getElementById('colorPaletteSelect').value;
    
    // Get custom colors if palette is custom
    let customColors = null;
    if (colorPalette === 'custom') {
        customColors = {
            text: document.getElementById('textColor').value,
            holiday: document.getElementById('holidayColor').value,
            background: document.getElementById('backgroundColor').value,
            headerBg: document.getElementById('headerBgColor').value,
            weekendBg: document.getElementById('weekendBgColor').value
        };
    }
    
    // Create calendar generator with font and color options
    calendarGenerator = new CalendarGenerator(year, showHolidays, monthFont, dateFont, colorPalette, customColors);
    
    // Set custom dates
    const validCustomDates = getValidCustomDates();
    calendarGenerator.setCustomDates(validCustomDates);
    
    // Set all images
    uploadedImages.forEach((img, index) => {
        if (img) {
            calendarGenerator.setImage(index, img);
        }
    });
    
    // Show preview section
    document.getElementById('previewSection').style.display = 'block';
    currentPage = 0;
    renderCurrentPage();
    
    // Scroll to preview
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
}

// Render current page
function renderCurrentPage() {
    if (!calendarGenerator) return;
    
    const canvas = document.getElementById('calendarCanvas');
    const pageCanvas = calendarGenerator.generatePage(currentPage);
    
    // Copy to display canvas (scaled down for preview)
    const scale = 0.3; // 30% for preview
    canvas.width = pageCanvas.width * scale;
    canvas.height = pageCanvas.height * scale;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(pageCanvas, 0, 0, canvas.width, canvas.height);
    
    // Update page info
    document.getElementById('pageInfo').textContent = `Lembar ${currentPage + 1} dari ${totalPages}`;
    
    // Update navigation buttons
    document.getElementById('prevPage').disabled = currentPage === 0;
    document.getElementById('nextPage').disabled = currentPage === totalPages - 1;
    
    // Store full resolution canvas for download
    canvas.fullResCanvas = pageCanvas;
}

// Download current page
function downloadCurrent() {
    const canvas = document.getElementById('calendarCanvas');
    if (canvas.fullResCanvas) {
        const link = document.createElement('a');
        link.download = `Kalender_${calendarGenerator.year}_Lembar_${currentPage + 1}.png`;
        link.href = canvas.fullResCanvas.toDataURL('image/png');
        link.click();
    }
}

// Download all pages as ZIP
async function downloadZip() {
    if (!calendarGenerator) return;
    
    const downloadBtn = document.getElementById('downloadAllZip');
    downloadBtn.disabled = true;
    downloadBtn.textContent = '⏳ Generating ZIP...';
    
    try {
        // Wait for JSZip to load if not already loaded
        if (typeof JSZip === 'undefined') {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const zip = new JSZip();
        
        // Generate all 6 pages
        for (let i = 0; i < totalPages; i++) {
            const pageCanvas = calendarGenerator.generatePage(i);
            const blob = await new Promise(resolve => pageCanvas.toBlob(resolve, 'image/png'));
            zip.file(`Kalender_${calendarGenerator.year}_Lembar_${i + 1}.png`, blob);
        }
        
        // Generate ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Download
        const link = document.createElement('a');
        link.download = `Kalender_${calendarGenerator.year}_Complete.zip`;
        link.href = URL.createObjectURL(zipBlob);
        link.click();
        
        downloadBtn.disabled = false;
        downloadBtn.textContent = '📦 Download Semua Lembar (ZIP)';
    } catch (error) {
        console.error('Error generating ZIP:', error);
        alert('Gagal membuat ZIP. Silakan coba lagi.');
        downloadBtn.disabled = false;
        downloadBtn.textContent = '📦 Download Semua Lembar (ZIP)';
    }
}

// Download all pages as PDF
async function downloadAll() {
    if (!calendarGenerator) return;
    
    const downloadBtn = document.getElementById('downloadAllPages');
    downloadBtn.disabled = true;
    downloadBtn.textContent = '⏳ Generating PDF...';
    
    try {
        // Wait for jsPDF to load if not already loaded
        if (typeof window.jspdf === 'undefined') {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const { jsPDF } = window.jspdf;
        
        // Create PDF with A4 dimensions
        // A4 at 300 DPI: 2480 x 3508 pixels = 210 x 297 mm
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Generate all 6 pages
        for (let i = 0; i < totalPages; i++) {
            const pageCanvas = calendarGenerator.generatePage(i);
            const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
            
            if (i > 0) {
                pdf.addPage();
            }
            
            // Add image to PDF (210mm x 297mm for A4)
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        }
        
        // Download PDF
        pdf.save(`Kalender_${calendarGenerator.year}_Complete.pdf`);
        
        downloadBtn.disabled = false;
        downloadBtn.textContent = '📝 Download Semua Lembar (PDF)';
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Gagal membuat PDF. Silakan download satu per satu.');
        downloadBtn.disabled = false;
        downloadBtn.textContent = '📝 Download Semua Lembar (PDF)';
    }
}

// Setup bulk upload
function setupBulkUpload() {
    const bulkInput = document.getElementById('bulkUpload');
    
    bulkInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).slice(0, 12);
        
        files.forEach((file, index) => {
            if (file.type.startsWith('image/') && index < 12) {
                loadImage(file, index);
            }
        });
        
        // Reset input
        bulkInput.value = '';
    });
}

// Setup drag and drop reordering
function setupDragAndDrop() {
    const monthUploads = document.querySelectorAll('.month-upload');
    let draggedElement = null;
    
    monthUploads.forEach(upload => {
        upload.addEventListener('dragstart', (e) => {
            draggedElement = upload;
            upload.querySelector('.upload-box').classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        upload.addEventListener('dragend', (e) => {
            upload.querySelector('.upload-box').classList.remove('dragging');
        });
        
        upload.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            upload.querySelector('.upload-box').classList.add('drag-over');
        });
        
        upload.addEventListener('dragleave', (e) => {
            upload.querySelector('.upload-box').classList.remove('drag-over');
        });
        
        upload.addEventListener('drop', (e) => {
            e.preventDefault();
            upload.querySelector('.upload-box').classList.remove('drag-over');
            
            if (draggedElement && draggedElement !== upload) {
                // Swap images
                const fromIndex = parseInt(draggedElement.dataset.month);
                const toIndex = parseInt(upload.dataset.month);
                
                const tempImage = uploadedImages[fromIndex];
                uploadedImages[fromIndex] = uploadedImages[toIndex];
                uploadedImages[toIndex] = tempImage;
                
                // Update display
                updateImageDisplay(fromIndex);
                updateImageDisplay(toIndex);
            }
        });
    });
}

// Update image display helper
function updateImageDisplay(index) {
    const preview = document.getElementById(`preview-${index}`);
    const placeholder = document.querySelector(`#upload-${index} .upload-placeholder`);
    const removeBtn = document.getElementById(`remove-${index}`);
    const uploadBox = document.getElementById(`upload-${index}`);
    
    if (uploadedImages[index]) {
        preview.src = uploadedImages[index].src;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        removeBtn.style.display = 'block';
        uploadBox.classList.add('has-image');
    } else {
        preview.style.display = 'none';
        preview.src = '';
        placeholder.style.display = 'flex';
        removeBtn.style.display = 'none';
        uploadBox.classList.remove('has-image');
    }
}

// Setup color palette toggle
function setupColorPalette() {
    const paletteSelect = document.getElementById('colorPaletteSelect');
    const customPickers = document.getElementById('customColorPickers');
    
    paletteSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customPickers.style.display = 'block';
        } else {
            customPickers.style.display = 'none';
        }
    });
}
