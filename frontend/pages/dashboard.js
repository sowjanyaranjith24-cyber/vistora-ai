import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listUploads, absoluteUrl, store, API_URL } from '../lib/api';

export default function DashboardPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listUploads();
      setUploads(res.files || []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setLastResult(store.getResult());
  }, []);

  const imgCount = uploads.filter(f => /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/i.test(f.filename)).length;
  const vidCount = uploads.filter(f => /\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(f.filename)).length;

  const lastImages = lastResult?.images?.length || 0;
  const lastVideo  = lastResult?.video ? 1 : 0;

  const stats = [
    { label: 'Total uploads',       value: uploads.length },
    { label: 'Images uploaded',     value: imgCount },
    { label: 'Videos uploaded',     value: vidCount },
    { label: 'Last run outputs',    value: lastImages + lastVideo }
  ];

  const isImage = (name) => /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/i.test(name);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Backend: <code className="text-vistora-300">{API_URL}</code>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-white/5 transition text-sm"
          >
            🔄 Refresh
          </button>
          <Link href="/upload" className="px-4 py-2 rounded-lg bg-vistora-600 hover:bg-vistora-500 transition text-sm">
            + New upload
          </Link>
        </div>
      </div>

      {/* Stats */}
      <section className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="glass rounded-xl p-5">
            <div className="text-sm text-slate-400">{s.label}</div>
            <div className="mt-2 text-3xl font-bold gradient-text">{s.value}</div>
          </div>
        ))}
      </section>

      {/* Last result summary */}
      {lastResult && (
        <section className="mt-8 glass rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Last processing run</h2>
            <Link href="/preview" className="text-sm text-vistora-300 hover:text-vistora-200">
              Open preview →
            </Link>
          </div>
          <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-slate-400">Use case: </span>
              <span className="font-medium">{lastResult.useCase}</span>
            </div>
            <div>
              <span className="text-slate-400">Images: </span>
              <span className="font-medium">{lastImages}</span>
            </div>
            <div>
              <span className="text-slate-400">Video: </span>
              <span className="font-medium">{lastVideo ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </section>
      )}

      {/* Uploads gallery */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">All uploads ({uploads.length})</h2>
        {loading && <p className="mt-3 text-slate-400">Loading...</p>}
        {error && (
          <div className="mt-3 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
            {error}
          </div>
        )}
        {!loading && uploads.length === 0 && (
          <div className="mt-4 glass rounded-xl p-10 text-center text-slate-400">
            No uploads yet. <Link href="/upload" className="text-vistora-300 hover:underline">Upload some</Link>.
          </div>
        )}
        {!loading && uploads.length > 0 && (
          <div className="mt-4 grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {uploads.map(u => (
              <div key={u.filename} className="glass rounded-lg overflow-hidden">
                <div className="aspect-square bg-slate-900 flex items-center justify-center">
                  {isImage(u.filename) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={absoluteUrl(u.url)}
                      alt={u.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">🎬</div>
                  )}
                </div>
                <div className="p-2 text-xs text-slate-400 truncate">{u.filename}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
