import { useEffect, useState } from 'react';
import Link from 'next/link';
import { store, absoluteUrl } from '../lib/api';

export default function PreviewPage() {
  const [result, setResult] = useState(null);
  const [useCase, setUseCase] = useState('general');

  useEffect(() => {
    setResult(store.getResult());
    setUseCase(store.getUseCase());
  }, []);

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">No preview yet</h1>
        <p className="text-slate-400 mt-2">Upload some media first to see your processed result here.</p>
        <Link href="/upload" className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-vistora-600 hover:bg-vistora-500 transition">
          Go to Upload
        </Link>
      </div>
    );
  }

  const hasImages = Array.isArray(result.images) && result.images.length > 0;
  const hasVideo  = !!result.video;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Preview</h1>
          <p className="text-slate-400 mt-1">
            Use case: <span className="text-vistora-300 font-medium">{useCase}</span> — your enhanced output is ready.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/upload" className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-white/5 transition text-sm">
            Start Over
          </Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-vistora-600 hover:bg-vistora-500 transition text-sm">
            Dashboard
          </Link>
        </div>
      </div>

      {/* Logs */}
      {result.logs?.length > 0 && (
        <div className="mt-6 glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300">Processing log</h3>
          <ul className="mt-2 text-xs text-slate-400 space-y-1">
            {result.logs.map((l, i) => <li key={i}>• {l}</li>)}
          </ul>
        </div>
      )}

      {/* Video */}
      {hasVideo && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Merged video</h2>
          <div className="mt-3 glass rounded-xl p-4">
            <video
              src={absoluteUrl(result.video.url)}
              controls
              className="w-full rounded-lg bg-black max-h-[60vh]"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-400 truncate">{result.video.filename}</span>
              <a
                href={absoluteUrl(result.video.downloadUrl)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-vistora-500 to-pink-500 text-white text-sm font-medium hover:opacity-90 transition"
              >
                ⬇ Download video
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Images */}
      {hasImages && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Enhanced images ({result.images.length})</h2>
            {result.images.length > 1 && (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Trigger each download sequentially
                  result.images.forEach((img, i) => {
                    setTimeout(() => {
                      const a = document.createElement('a');
                      a.href = absoluteUrl(img.downloadUrl);
                      a.download = img.filename;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    }, i * 300);
                  });
                }}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-white/5 transition"
              >
                ⬇ Download all
              </a>
            )}
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.images.map((img, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden group">
                <div className="aspect-video bg-slate-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={absoluteUrl(img.url)}
                    alt={img.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 truncate">{img.filename}</span>
                  <a
                    href={absoluteUrl(img.downloadUrl)}
                    className="text-xs px-3 py-1.5 rounded-md bg-vistora-600 hover:bg-vistora-500 transition whitespace-nowrap"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasImages && !hasVideo && (
        <div className="mt-8 glass rounded-xl p-8 text-center text-slate-400">
          Processing produced no output. Try uploading again.
        </div>
      )}
    </div>
  );
}
