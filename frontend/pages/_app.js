import '../styles/globals.css';
import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Vistora AI — Turn Moments into Masterpieces</title>
        <meta name="description" content="Vistora AI transforms your photos and videos into polished masterpieces." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">
        <Component {...pageProps} />
      </main>
    </>
  );
}
