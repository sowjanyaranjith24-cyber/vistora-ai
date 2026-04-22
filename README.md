# Vistora AI

**Turn Moments into Masterpieces**

Vistora AI is a full-stack media studio that enhances photos, removes duplicates, and merges videos with smooth transitions. It has a **Next.js + Tailwind** frontend and a **Node.js + Express** backend that handles image processing with **sharp** and video processing with **ffmpeg**.

---

## Architecture

```
vistora-ai/
├── backend/                  Node.js + Express (port 5000)
│   ├── server.js
│   ├── routes/
│   │   ├── upload.js         POST /api/upload
│   │   ├── process.js        POST /api/process
│   │   └── download.js       GET  /api/download/:filename
│   ├── services/
│   │   ├── imageService.js   sharp-based enhancement + dedupe
│   │   └── videoService.js   fluent-ffmpeg merge + transitions
│   ├── uploads/              user uploads (auto-created)
│   └── outputs/              processed results (auto-created)
│
└── frontend/                 Next.js 14 + Tailwind (port 3000)
    ├── pages/
    │   ├── index.js          Home
    │   ├── upload.js         Upload + use-case picker + progress
    │   ├── preview.js        Preview processed result + download
    │   └── dashboard.js      Stats and uploaded media gallery
    ├── components/Navbar.js
    ├── lib/api.js            axios client + localStorage helpers
    └── styles/globals.css
```

---

## Prerequisites

- **Node.js 18+** and **npm**
- **ffmpeg** installed and on your PATH (required for video processing)

### Install ffmpeg

| OS | Command |
|---|---|
| **macOS** (Homebrew) | `brew install ffmpeg` |
| **Ubuntu / Debian** | `sudo apt update && sudo apt install -y ffmpeg` |
| **Fedora** | `sudo dnf install -y ffmpeg` |
| **Arch** | `sudo pacman -S ffmpeg` |
| **Windows** | Download from [ffmpeg.org/download.html](https://ffmpeg.org/download.html), extract, and add the `bin` folder to your system `PATH` |

Verify:

```bash
ffmpeg -version
ffprobe -version
```

Both commands must succeed before you start the backend.

---

## Installation

From the project root:

```bash
# Backend
cd backend
npm install

# Frontend (in another terminal, or after)
cd ../frontend
npm install
```

> `sharp` will download a prebuilt binary on install. If you're behind a proxy or on an unusual platform and install fails, see <https://sharp.pixelplumbing.com/install>.

---

## Running the app

You need **two terminals** — one for the backend, one for the frontend.

### 1. Start the backend (port 5000)

```bash
cd backend
npm start
```

You should see:

```
🎨 Vistora AI Backend running on http://localhost:5000
   Uploads dir: .../backend/uploads
   Outputs dir: .../backend/outputs
```

Test it:

```bash
curl http://localhost:5000/
```

### 2. Start the frontend (port 3000)

```bash
cd frontend
npm run dev
```

Then open **<http://localhost:3000>**.

> If your backend runs on a different host/port, copy `frontend/.env.local.example` to `frontend/.env.local` and edit `NEXT_PUBLIC_API_URL`.

---

## Using the app

1. **Home** (`/`) — overview of features.
2. **Upload** (`/upload`) — drop or pick images/videos, choose a use case (Content Creator / Album / General Editing), and click **Upload & Process**. You'll see live upload progress and processing logs.
3. **Preview** (`/preview`) — see enhanced images and/or the merged video, then download individually or all at once.
4. **Dashboard** (`/dashboard`) — view upload stats, last run summary, and the full uploads gallery.

---

## API reference

Base URL: `http://localhost:5000`

### `POST /api/upload`
Multipart form-data, field name `files` (repeatable). Returns:
```json
{
  "success": true,
  "count": 2,
  "files": [
    { "filename": "uuid-name.jpg", "originalName": "...", "size": 123, "type": "image", "url": "/uploads/..." }
  ]
}
```

### `POST /api/process`
JSON body:
```json
{
  "filenames": ["uuid-a.jpg", "uuid-b.mp4"],
  "useCase": "creator"   // or "album" | "general"
}
```
Returns the processed result with URLs for preview and download.

### `GET /api/download/:filename`
Forces a download of a file in the `outputs/` directory.

### `GET /api/upload/list`
Lists all currently uploaded files.

### `DELETE /api/upload/:filename`
Removes a file from `uploads/`.

---

## Features in detail

**Image pipeline** (`services/imageService.js`)
- **Duplicate removal** via 8×8 grayscale perceptual hash with Hamming distance ≤ 5.
- **Sorting** by file modification time so albums read chronologically.
- **Enhancement presets** tuned per use case:
  - *creator* — saturation +25%, contrast +15%, strong sharpening.
  - *album* — warm hue shift, gentle sharpening.
  - *general* — auto-levels + balanced sharpening.
- EXIF auto-rotation and high-quality (92) mozjpeg output.

**Video pipeline** (`services/videoService.js`)
- Single video → transcode to H.264/AAC MP4 with `+faststart`.
- Multiple videos → normalise each to 1280×720 @ 30 fps, concat via ffmpeg concat demuxer, then apply a 0.6 s fade-in/fade-out on both video and audio.
- All temporary files are cleaned up after merge.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Error: Cannot find ffmpeg` | Install ffmpeg and ensure `ffmpeg -version` works in the same terminal you start the backend from. |
| `CORS` errors in browser | The backend already enables CORS for `*`. Make sure you're hitting `NEXT_PUBLIC_API_URL` and that the backend is actually running. |
| Large video upload stalls | Default per-file limit is 200 MB. Adjust `limits.fileSize` in `backend/routes/upload.js`. |
| Processing hangs on huge video merges | Try smaller clips first; ffmpeg transcoding is CPU-bound. |

---

## Scripts summary

**Backend**
- `npm start` — run in production mode
- `npm run dev` — run with nodemon (auto-restart)

**Frontend**
- `npm run dev` — Next.js dev server
- `npm run build` && `npm start` — production build

---

© Vistora AI — Turn Moments into Masterpieces
