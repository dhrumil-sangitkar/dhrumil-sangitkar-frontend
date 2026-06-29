/**
 * Resizes and re-encodes an image file in the browser before it's turned into
 * a base64 string and sent to the API. This keeps multi-photo gallery uploads
 * well under the server's request-size limit and keeps the gallery itself
 * fast to load on mobile connections.
 *
 * Limits per image:
 *   - Max dimension: 900px (longest side)
 *   - JPEG quality : 0.65
 *   → ~150–400 KB per photo; 11 photos ≈ 2–4 MB total (well under 40 MB limit)
 */

const MAX_DIMENSION = 900;   // was 1600 — reduced to keep multi-image payloads small
const JPEG_QUALITY  = 0.65;  // was 0.82 — lower quality = much smaller file size

export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image.'));
      img.onload = () => {
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width >= height) {
            height = Math.round((height / width) * MAX_DIMENSION);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width / height) * MAX_DIMENSION);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback: canvas unsupported — use original file as-is
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // PNGs with transparency are kept as PNG; everything else becomes JPEG
        // (much smaller for photos, which is what this gallery mostly holds).
        const isPng = file.type === 'image/png';
        const mime  = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, isPng ? undefined : JPEG_QUALITY);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function compressImageFiles(files: File[]): Promise<string[]> {
  return Promise.all(files.map(compressImageFile));
}