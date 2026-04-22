import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Smart Photo Enhancement',
      desc: 'Auto-tuned color, contrast, and sharpness presets for creators, albums, and general editing.',
      icon: '✨'
    },
    {
      title: 'Duplicate Detection',
      desc: 'Perceptual-hash powered deduplication removes near-identical shots automatically.',
      icon: '🔍'
    },
    {
      title: 'Video Merging',
      desc: 'Stitch multiple clips into one polished reel with smooth fade transitions.',
      icon: '🎬'
    },
    {
      title: 'Use-Case Presets',
      desc: 'Content Creator, Album, or General — pick your vibe, we tune the output.',
      icon: '🎨'
    }
  ];

  const useCases = [
    { name: 'Content Creator', tag: 'Punchy, saturated, ready for social', badge: 'creator' },
    { name: 'Album',           tag: 'Warm tones for family memories',       badge: 'album' },
    { name: 'General Editing', tag: 'Balanced auto-enhance for any shot',   badge: 'general' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="text-center py-16">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-vistora-600/20 text-vistora-300 border border-vistora-500/30">
          AI-Powered Media Studio
        </span>
        <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight">
          <span className="gradient-text">Vistora AI</span>
        </h1>
        <p className="mt-4 text-2xl md:text-3xl font-light text-slate-200">
          Turn Moments into Masterpieces
        </p>
        <p className="mt-6 max-w-2xl mx-auto text-slate-400">
          Upload your photos and videos, pick a use case, and let Vistora enhance, deduplicate,
          and merge them into a polished output — ready to download.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/upload"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-vistora-500 to-pink-500 text-white font-medium shadow-lg hover:opacity-90 transition"
          >
            Start Creating →
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg border border-slate-700 hover:bg-white/5 transition"
          >
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
        {features.map(f => (
          <div key={f.title} className="glass rounded-xl p-6 hover:border-vistora-500/40 transition">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Use cases */}
      <section className="mt-20">
        <h2 className="text-2xl font-semibold">Choose your use case</h2>
        <p className="text-slate-400 mt-2">Every preset is tuned to the kind of output you need.</p>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {useCases.map(u => (
            <div key={u.badge} className="glass rounded-xl p-6">
              <span className="text-xs uppercase tracking-wider text-vistora-300">{u.badge}</span>
              <h3 className="mt-2 text-xl font-semibold">{u.name}</h3>
              <p className="mt-2 text-sm text-slate-400">{u.tag}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-20 glass rounded-2xl p-8">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-6 grid md:grid-cols-4 gap-6">
          {[
            ['1', 'Upload', 'Drop your photos and videos.'],
            ['2', 'Pick preset', 'Creator, Album, or General.'],
            ['3', 'Process', 'We enhance, dedupe, and merge.'],
            ['4', 'Download', 'Preview and save your result.']
          ].map(([n, title, desc]) => (
            <li key={n} className="flex gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-vistora-600/30 border border-vistora-500/40 flex items-center justify-center text-sm">
                {n}
              </div>
              <div>
                <h4 className="font-medium">{title}</h4>
                <p className="text-sm text-slate-400">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-20 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} Vistora AI — Turn Moments into Masterpieces
      </footer>
    </div>
  );
}
