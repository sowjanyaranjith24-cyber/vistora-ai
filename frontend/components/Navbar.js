import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  const links = [
    { href: '/',          label: 'Home' },
    { href: '/upload',    label: 'Upload' },
    { href: '/preview',   label: 'Preview' },
    { href: '/dashboard', label: 'Dashboard' }
  ];

  return (
    <header className="sticky top-0 z-40 glass">
      <nav className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-vistora-400 to-pink-500 flex items-center justify-center text-white font-bold">
            V
          </div>
          <span className="font-semibold text-lg">
            Vistora <span className="gradient-text">AI</span>
          </span>
        </Link>

        <ul className="flex items-center gap-1">
          {links.map(l => {
            const active = router.pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`px-3 py-2 rounded-md text-sm transition ${
                    active
                      ? 'bg-vistora-600/30 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
