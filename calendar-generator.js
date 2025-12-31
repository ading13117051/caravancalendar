// Calendar Generator Class
class CalendarGenerator {
    constructor(year, showHolidays = true, monthFont = 'BBH Hegarty', dateFont = 'Montserrat', colorPalette = 'classic', customColors = null) {
        this.year = year;
        this.showHolidays = showHolidays;
        this.monthFont = monthFont;
        this.dateFont = dateFont;
        this.colorPalette = colorPalette;
        this.images = new Array(12).fill(null);
        this.imagePositions = new Array(12).fill(null).map(() => ({ zoom: 1, offsetX: 0, offsetY: 0 }));
        this.customDates = []; // Array of {date: 'YYYY-MM-DD', name: 'Custom name'}
        
        // Define color palettes
        this.palettes = {
            classic: {
                text: '#000000',
                holiday: '#FF0000',
                background: '#FFFFFF',
                headerBg: '#000000',
                weekendBg: '#f5f5f5'
            },
            ocean: {
                text: '#1a3a52',
                holiday: '#e63946',
                background: '#FFFFFF',
                headerBg: '#1a3a52',
                weekendBg: '#e8f4f8'
            },
            earth: {
                text: '#3e2723',
                holiday: '#c62828',
                background: '#FFFFFF',
                headerBg: '#3e2723',
                weekendBg: '#f5f5f5'
            },
            custom: customColors || {
                text: '#000000',
                holiday: '#FF0000',
                background: '#FFFFFF',
                headerBg: '#000000',
                weekendBg: '#f5f5f5'
            }
        };
        
        this.colors = this.palettes[colorPalette] || this.palettes.classic;
        
        // A4 dimensions at 300 DPI: 2480 x 3508 pixels
        this.a4Width = 2480;
        this.a4Height = 3508;
        
        // 1 month container: 20x13cm = 2362x1535 pixels
        // Photo area: 10x13cm = 1181x1535 pixels
        // Calendar area: 10x13cm = 1181x1535 pixels (grid 10x10cm=1181x1181, detail 10x3cm=1181x354)
        this.monthWidth = 2362;
        this.monthHeight = 1535;
        this.photoWidth = 1181;
        this.photoHeight = 1535;
        this.calendarWidth = 1181;
        this.calendarHeight = 1535;
        this.gridHeight = 1181;
        this.detailHeight = 354;
        this.margin = 59; // (2480 - 2362) / 2 = 59 pixels margin
    }

    setImage(monthIndex, imageElement) {
        this.images[monthIndex] = imageElement;
    }

    setImagePosition(monthIndex, zoom, offsetX, offsetY) {
        this.imagePositions[monthIndex] = { zoom, offsetX, offsetY };
    }

    setCustomDates(customDates) {
        this.customDates = customDates;
    }

    getCustomDate(dateString) {
        return this.customDates.find(d => d.date === dateString);
    }

    generatePage(pageNumber) {
        // Each A4 page contains 2 months (vertical stack)
        const startMonth = pageNumber * 2;
        const endMonth = Math.min(startMonth + 2, 12);
        
        const canvas = document.createElement('canvas');
        canvas.width = this.a4Width;
        canvas.height = this.a4Height;
        const ctx = canvas.getContext('2d');
        
        // White background for A4 page
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw 2 months vertically
        for (let i = 0; i < 2 && (startMonth + i) < 12; i++) {
            const monthIndex = startMonth + i;
            const y = this.margin + i * (this.monthHeight + 219); // 219px spacing between months
            
            this.drawMonth(ctx, monthIndex, this.margin, y);
        }
        
        return canvas;
    }

    drawMonth(ctx, monthIndex, x, y) {
        // Layout: Photo (left 10x13cm) | Calendar (right 10x13cm)
        
        // Fill month container background (20x13cm)
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(x, y, this.monthWidth, this.monthHeight);
        
        // Draw corner marks (guide lines) - tebal
        const cornerLength = 50;
        const cornerWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = cornerWidth;
        ctx.lineCap = 'square';
        
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(x, y + cornerLength);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerLength, y);
        ctx.stroke();
        
        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(x + this.monthWidth - cornerLength, y);
        ctx.lineTo(x + this.monthWidth, y);
        ctx.lineTo(x + this.monthWidth, y + cornerLength);
        ctx.stroke();
        
        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(x, y + this.monthHeight - cornerLength);
        ctx.lineTo(x, y + this.monthHeight);
        ctx.lineTo(x + cornerLength, y + this.monthHeight);
        ctx.stroke();
        
        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(x + this.monthWidth - cornerLength, y + this.monthHeight);
        ctx.lineTo(x + this.monthWidth, y + this.monthHeight);
        ctx.lineTo(x + this.monthWidth, y + this.monthHeight - cornerLength);
        ctx.stroke();
        
        // Draw photo on the left
        if (this.images[monthIndex]) {
            const pos = this.imagePositions[monthIndex];
            this.drawPhoto(ctx, this.images[monthIndex], x, y, this.photoWidth, this.photoHeight, pos);
        } else {
            // Placeholder
            ctx.fillStyle = this.colors.weekendBg;
            ctx.fillRect(x, y, this.photoWidth, this.photoHeight);
            ctx.fillStyle = '#999';
            ctx.font = '50px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Foto ' + monthNames[monthIndex], x + this.photoWidth/2, y + this.photoHeight/2);
        }
        
        // Draw calendar on the right
        const calendarX = x + this.photoWidth;
        
        // Month name header only (NO YEAR) - Use selected font
        ctx.fillStyle = this.colors.text;
        ctx.font = `bold 85px "${this.monthFont}", sans-serif`;
        ctx.textAlign = 'center';
        const monthNameY = y + 100;
        ctx.fillText(monthNames[monthIndex].toUpperCase(), calendarX + this.calendarWidth/2, monthNameY);
        
        // Draw calendar grid (starts after month name)
        const gridY = y + 140;
        const availableGridHeight = this.gridHeight - 140;
        this.drawCalendarGrid(ctx, monthIndex, calendarX, gridY, this.calendarWidth, availableGridHeight);
        
        // Draw holiday details (NO TOP BORDER)
        const detailY = y + this.gridHeight;
        this.drawHolidayDetails(ctx, monthIndex, calendarX, detailY, this.calendarWidth, this.detailHeight);
    }

    drawPhoto(ctx, img, x, y, width, height, position) {
        ctx.save();
        
        // Clip to photo area
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();
        
        const zoom = position.zoom || 1;
        const offsetX = position.offsetX || 0;
        const offsetY = position.offsetY || 0;
        
        // Calculate image dimensions with zoom
        const imgRatio = img.width / img.height;
        const targetRatio = width / height;
        
        let drawWidth, drawHeight, baseOffsetX, baseOffsetY;
        
        if (imgRatio > targetRatio) {
            // Image is wider - fit height
            drawHeight = height * zoom;
            drawWidth = drawHeight * imgRatio;
            baseOffsetX = -(drawWidth - width) / 2;
            baseOffsetY = 0;
        } else {
            // Image is taller - fit width
            drawWidth = width * zoom;
            drawHeight = drawWidth / imgRatio;
            baseOffsetX = 0;
            baseOffsetY = -(drawHeight - height) / 2;
        }
        
        // Apply user offsets
        const finalX = x + baseOffsetX + offsetX;
        const finalY = y + baseOffsetY + offsetY;
        
        ctx.drawImage(img, finalX, finalY, drawWidth, drawHeight);
        ctx.restore();
    }

    drawCalendarGrid(ctx, monthIndex, x, y, width, height) {
        const firstDay = new Date(this.year, monthIndex, 1);
        const lastDay = new Date(this.year, monthIndex + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const cellWidth = width / 7;
        const headerHeight = 90;
        const cellHeight = (height - headerHeight) / 6;
        
        // Draw day headers with color from palette - use date font
        ctx.fillStyle = this.colors.headerBg;
        ctx.fillRect(x, y, width, headerHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 45px "${this.dateFont}", sans-serif`;
        ctx.textAlign = 'center';
        
        dayNames.forEach((day, i) => {
            const dayX = x + (i + 0.5) * cellWidth;
            ctx.fillText(day, dayX, y + headerHeight - 28);
        });
        
        // Draw dates without grid borders - use selected date font
        ctx.font = `bold 50px "${this.dateFont}", sans-serif`;
        let currentDay = 1;
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const cellX = x + col * cellWidth;
                const cellY = y + headerHeight + row * cellHeight;
                
                // NO GRID LINES
                
                // Check if we should draw a date
                if ((row === 0 && col >= startingDayOfWeek) || (row > 0 && currentDay <= daysInMonth)) {
                    if (currentDay <= daysInMonth) {
                        const dateStr = `${this.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
                        const currentDate = new Date(this.year, monthIndex, currentDay);
                        const holiday = this.showHolidays ? getHoliday(dateStr, this.year) : null;
                        const customDate = this.getCustomDate(dateStr);
                        const weekend = isWeekend(currentDate);
                        
                        // Background color - subtle for weekends only
                        if (weekend && !(holiday && holiday.type !== 'leave') && !customDate) {
                            ctx.fillStyle = this.colors.weekendBg;
                            ctx.fillRect(cellX + 2, cellY + 2, cellWidth - 4, cellHeight - 4);
                        }
                        
                        // Date number - use color palette
                        if ((holiday && holiday.type !== 'leave') || customDate) {
                            ctx.fillStyle = this.colors.holiday; // Holiday color from palette
                        } else if (weekend) {
                            ctx.fillStyle = '#666666'; // Grey for weekends
                        } else {
                            ctx.fillStyle = this.colors.text; // Text color from palette
                        }
                        
                        ctx.textAlign = 'center';
                        ctx.font = `bold 50px "${this.dateFont}", sans-serif`;
                        ctx.fillText(currentDay, cellX + cellWidth/2, cellY + cellHeight/2 + 18);
                        
                        currentDay++;
                    }
                }
            }
            
            if (currentDay > daysInMonth) break;
        }
    }

    drawHolidayDetails(ctx, monthIndex, x, y, width, height) {
        // Get all holidays and custom dates for this month
        const allDates = [];
        const firstDay = new Date(this.year, monthIndex, 1);
        const lastDay = new Date(this.year, monthIndex + 1, 0);
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${this.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Check national holidays
            const holiday = this.showHolidays ? getHoliday(dateStr, this.year) : null;
            if (holiday && holiday.type !== 'leave') {
                allDates.push({ day, name: holiday.name });
            }
            
            // Check custom dates
            const customDate = this.getCustomDate(dateStr);
            if (customDate) {
                allDates.push({ day, name: customDate.name });
            }
        }
        
        // Sort by day
        allDates.sort((a, b) => a.day - b.day);
        
        // NO TOP BORDER - removed
        
        if (allDates.length > 0) {
            ctx.fillStyle = this.colors.holiday; // Holiday color from palette
            ctx.font = `bold 32px "${this.dateFont}", sans-serif`;
            ctx.textAlign = 'left';
            
            const lineHeight = 42;
            const startY = y + 45;
            const padding = 25;
            
            allDates.forEach((dateItem, index) => {
                if (index < 7) { // Max 7 items to fit in space
                    const text = `${dateItem.day}. ${dateItem.name}`;
                    const textY = startY + index * lineHeight;
                    
                    // Truncate if too long
                    let displayText = text;
                    const maxWidth = width - padding * 2;
                    const metrics = ctx.measureText(displayText);
                    
                    if (metrics.width > maxWidth) {
                        while (ctx.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
                            displayText = displayText.slice(0, -1);
                        }
                        displayText += '...';
                    }
                    
                    ctx.fillText(displayText, x + padding, textY);
                }
            });
        } else {
            // No special dates message
            ctx.fillStyle = '#999999';
            ctx.font = 'italic 28px "Trebuchet MS", "Helvetica", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Tidak ada hari istimewa', x + width/2, y + height/2 + 10);
        }
    }
}
