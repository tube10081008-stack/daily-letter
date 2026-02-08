export const processPhoto = async (imageSrc: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Standardize Aspect Ratio 3:4 (e.g., 1200x1600)
            const width = 1200;
            const height = 1600;
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // 1. Fill Background (Paper White)
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, width, height);

            // 2. Draw Image (Cropped to fit inside frame)
            // Frame border size: ~5% on sides, ~15% on bottom for Polaroid style or uniform?
            // User asked for "Film" - usually means uniform white border or 4x6 print.
            // Let's do a uniform white border of 40px, giving it a "Print" look.
            const border = 60;
            const drawWidth = width - (border * 2);
            const drawHeight = height - (border * 2);

            // Draw Image with Filters (Warmth)
            // "The Warmth": Sepia + Contrast + Saturate
            ctx.filter = "sepia(20%) contrast(110%) saturate(120%) brightness(105%) hue-rotate(-5deg)";

            // Center crop logic
            const scale = Math.max(drawWidth / img.width, drawHeight / img.height);
            const x = (drawWidth - img.width * scale) / 2;
            const y = (drawHeight - img.height * scale) / 2;

            ctx.save();
            ctx.translate(border, border);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            ctx.restore();

            // 3. Film Grain Overlay
            // Generate noise
            const imageData = ctx.getImageData(border, border, drawWidth, drawHeight);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                // Random noise: -30 to +30
                const noise = (Math.random() - 0.5) * 40;
                data[i] = Math.min(255, Math.max(0, data[i] + noise));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
            ctx.putImageData(imageData, border, border);

            // 4. Date Stamp
            // '26 2 3 14:30 (Orange/Red LCD style)
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const dateStr = `'${year} ${month} ${day} ${hours}:${minutes}`;

            ctx.filter = "none"; // Reset filter for text
            ctx.font = "bold 48px 'Courier New', monospace"; // Slightly smaller for safety
            ctx.fillStyle = "rgba(255, 140, 0, 0.9)"; // Orange/Red
            ctx.shadowColor = "rgba(255, 50, 0, 0.5)";
            ctx.shadowBlur = 10;

            // Bottom Right position inside the image area
            // Ensure plenty of padding from the right edge
            ctx.textAlign = "right";
            ctx.fillText(dateStr, width - border - 50, height - border - 50);

            // 5. Light Leak (Subtle) - Optional
            // Add a warm gradient overlay on the side
            const gradient = ctx.createLinearGradient(0, 0, 300, 0);
            gradient.addColorStop(0, "rgba(255, 200, 100, 0.2)");
            gradient.addColorStop(1, "rgba(255, 200, 100, 0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(border, border, 300, drawHeight);

            // Output
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas to Blob failed"));
            }, 'image/jpeg', 0.9);
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = imageSrc;
    });
};
