import Head from "next/head";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Tile Match</title>
        <meta
          name="description"
          content="Flip memory game to match similar tiles"
        />
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
