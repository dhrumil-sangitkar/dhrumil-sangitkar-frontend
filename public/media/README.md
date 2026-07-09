# Local media files

Drop your image/video files directly into this folder (subfolders are fine,
e.g. `public/media/images/`, `public/media/videos/`).

Vite copies everything in `public/` as-is into the final build, and it's
served from the site root. So a file at:

    public/media/kshetrunjay-yatra-1.jpg

is reachable at:

    /media/kshetrunjay-yatra-1.jpg

Reference that exact path (starting with `/media/...`) as the `url` (or an
entry in `images`) when you add the item in `src/data/media.ts`.

Tips:
- Keep images reasonably sized (compress/resize before adding) — large,
  uncompressed photos slow the site down for visitors.
- Videos should be web-friendly MP4 (H.264) so every browser can play them
  without extra plugins.
- File names become part of the URL, so keep them lowercase with hyphens
  and no spaces (e.g. `snatra-puja-2026.jpg`, not `Snatra Puja 2026.jpg`).