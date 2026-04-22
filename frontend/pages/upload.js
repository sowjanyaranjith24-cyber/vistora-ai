import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { uploadFiles, processFiles, store } from '../lib/api';

const USE_CASES = [
  { id: 'creator', title: 'Content Creator', desc: 'Punchy, saturated, social-ready' },
  { id: 'album',   title: 'Album',           desc: 'Warm, soft, family memories' },
  { id: 'general', title: 'General Editing', desc: 'Balanced auto-enhance' }
];

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);        // File[]
  const [useCase, setUseCase] = useState('general');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('idle');    // idle | uploading | processing
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const onPick = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...picked]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    setFiles(prev => [...prev, ...dropped]);
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setFiles([]);
    setProgress(0);
    setStage('idle');
    setError(null);
    setLogs([]);
  };

  const start = async () => {
    if (files.length === 0) {
      setError('Please add at least one file.');
      return;
    }
    setError(null);
    setLogs([]);

    try {
      // 1. Upload
      setStage('uploading');
      setProgress(0);
      const uploadRes = await uploadFiles(files, pct => setProgress(pct));
      store.setUploaded(uploadRes.files);
      store.setUseCase(useCase);
      setLogs(l => [...l, `Uploaded ${uploadRes.count} file(s).`]);

      // 2. Process
      setStage('processing');
      setLogs(l => [...l, `Processing with "${useCase}" preset...`]);
      const filenames = uploadRes.files.map(f => f.filename);
      const procRes = await processFiles(filenames, useCase);
      store.setResult(procRes.result);
      if (procRes.result?.logs) setLogs(l => [...l, ...procRes.result.logs]);

      // 3. Go to preview
      setLogs(l => [...l, 'Done. Opening preview...']);
      setTimeout(() => router.push('/preview'), 600);
    } catch (err) {
      setStage('idle');
      setError(err?.response?.data?.error || err.message || 'Something went wrong');
    }
  };

  const busy = stage === 'uploading' || stage === 'processing';

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Upload your media</h1>
      <p className="text-slate-400 mt-1">Photos, videos, or both — up to 200 MB each.</p>

      {/* Dropzone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        className="mt-6 glass rounded-xl p-10 text-center border-2 border-dashed border-slate-700 hover:border-vistora-500/60 transition cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-4xl">📸</div>
        <p className="mt-3 font-medium">Click to select, or drop files here</p>
        <p className="text-sm text-slate-400 mt-1">Images: JPG/PNG/WEBP — Videos: MP4/MOV/WEBM</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={onPick}
        />
      </div>

      {/* Selected files */}
      {files.length > 0 && (
        <div className="mt-6 glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Selected files ({files.length})</h3>
            <button
              onClick={clearAll}
              disabled={busy}
              className="text-sm text-slate-400 hover:text-white disabled:opacity-40"
            >
              Clear all
            </button>
          </div>
          <ul className="mt-3 divide-y divide-slate-800">
            {files.map((f, i) => (
              <li key={i} className="py-2 flex items-center justify-between text-sm">
                <div className="truncate">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded mr-2 ${
                    f.type.startsWith('video/') ? 'bg-pink-500/20 text-pink-300' : 'bg-vistora-600/20 text-vistora-300'
                  }`}>
                    {f.type.startsWith('video/') ? 'video' : 'image'}
                  </span>
                  {f.name}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                  <button
                    onClick={() => removeFile(i)}
                    disabled={busy}
                    className="text-slate-500 hover:text-red-400 disabled:opacity-40"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Use case picker */}
      <h2 className="mt-10 text-xl font-semibold">Use case</h2>
      <div className="grid sm:grid-cols-3 gap-3 mt-3">
        {USE_CASES.map(u => (
          <button
            key={u.id}
            onClick={() => setUseCase(u.id)}
            disabled={busy}
            className={`text-left p-4 rounded-xl border transition ${
              useCase === u.id
                ? 'border-vistora-500 bg-vistora-600/10'
                : 'border-slate-800 hover:border-slate-600 glass'
            }`}
          >
            <div className="font-medium">{u.title}</div>
            <div className="text-sm text-slate-400 mt-1">{u.desc}</div>
          </button>
        ))}
      </div>

      {/* Progress */}
      {stage !== 'idle' && (
        <div className="mt-8 glass rounded-xl p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium capitalize">{stage}...</span>
            {stage === 'uploading' && <span>{progress}%</span>}
          </div>
          <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-vistora-500 to-pink-500 transition-all"
              style={{
                width: stage === 'uploading' ? `${progress}%` : '100%',
                animation: stage === 'processing' ? 'pulse 1.5s ease-in-out infinite' : 'none'
              }}
            />
          </div>
          {logs.length > 0 && (
            <ul className="mt-4 text-xs text-slate-400 space-y-1">
              {logs.map((l, i) => <li key={i}>• {l}</li>)}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={start}
          disabled={busy || files.length === 0}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-vistora-500 to-pink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          {busy ? 'Working...' : 'Upload & Process'}
        </button>
        <button
          onClick={() => router.push('/preview')}
          className="px-4 py-3 rounded-lg border border-slate-700 hover:bg-white/5 transition text-sm"
        >
          Go to Preview
        </button>
      </div>
    </div>
  );
}
