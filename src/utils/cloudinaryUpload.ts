/**
 * Cloudinary Direct Upload Utility
 * ----------------------------------
 * Images are uploaded directly from the browser to Cloudinary using their
 * unsigned upload API. Your backend NEVER touches the image bytes — it only
 * stores the resulting Cloudinary URL string (a few hundred characters instead
 * of megabytes of base64).
 *
 * HOW TO SET UP CLOUDINARY (free tier, takes ~3 minutes):
 * ─────────────────────────────────────────────────────────
 * 1. Go to https://cloudinary.com → create a free account
 * 2. From your dashboard, note your "Cloud name" (top-left)
 * 3. Settings → Upload → "Upload presets" → "+ Add upload preset"
 *      • Signing Mode  →  Unsigned
 *      • Folder        →  dhrumil-gallery   (optional but recommended)
 *      • Save → note the "Preset name"
 * 4. Add these two env vars in your Vercel project:
 *      VITE_CLOUDINARY_CLOUD_NAME    = your_cloud_name
 *      VITE_CLOUDINARY_UPLOAD_PRESET = your_preset_name
 * 5. Redeploy on Vercel — done. No backend changes needed.
 *
 * Free tier limits (more than enough for this site):
 *   25 GB storage · 25 GB bandwidth/month · 25 credits/month
 */

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export interface UploadProgress {
  file:  string;
  index: number;
  total: number;
  pct:   number;
}

/**
 * Upload a single File object to Cloudinary.
 * Returns the optimised, secure HTTPS URL.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured.\n' +
      'Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET ' +
      'in your Vercel project environment variables.\n' +
      'See src/utils/cloudinaryUpload.ts for step-by-step setup instructions.',
    );
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const body     = new FormData();
  body.append('file',          file);
  body.append('upload_preset', UPLOAD_PRESET);
  body.append('folder',        'dhrumil-gallery');

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: { secure_url: string; error?: { message: string } } =
            JSON.parse(xhr.responseText);
          if (!data.secure_url) throw new Error('No secure_url in response.');

          // Insert Cloudinary transformation: auto quality/format, cap at 1600 px wide.
          // This lets Cloudinary serve WebP to modern browsers automatically.
          const url = data.secure_url.replace(
            '/upload/',
            '/upload/q_auto,f_auto,w_1600,c_limit/',
          );
          resolve(url);
        } catch {
          reject(new Error('Cloudinary returned an unexpected response format.'));
        }
      } else {
        let msg = `Cloudinary upload failed (HTTP ${xhr.status}).`;
        try {
          const err = JSON.parse(xhr.responseText) as { error?: { message: string } };
          if (err?.error?.message) msg = `Cloudinary: ${err.error.message}`;
        } catch { /* ignore */ }
        reject(new Error(msg));
      }
    });

    xhr.addEventListener('error', () =>
      reject(new Error('Network error during image upload. Check your connection.')));
    xhr.addEventListener('abort', () =>
      reject(new Error('Image upload was cancelled.')));

    xhr.open('POST', endpoint);
    xhr.send(body);
  });
}

/**
 * Upload an array of files to Cloudinary sequentially.
 * Sequential (not parallel) to stay within the free-tier rate limit.
 * Returns URLs in the same order as the input files.
 */
export async function uploadFilesToCloudinary(
  files: File[],
  onProgress?: (info: UploadProgress) => void,
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const url = await uploadToCloudinary(file, (pct) => {
      onProgress?.({ file: file.name, index: i, total: files.length, pct });
    });
    urls.push(url);
  }
  return urls;
}