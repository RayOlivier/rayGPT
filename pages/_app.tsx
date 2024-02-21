import Head from "next/head";
import "../styles/globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Outfit } from "next/font/google";
import NavBar from "../components/NavBar/NavBar";
import { AppProps } from "next/app";
config.autoAddCss = false;

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Head>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <NavBar {...pageProps}></NavBar>
      <main className={`${outfit.variable} bg-zinc-800 font-body text-white`}>
        <Component {...pageProps} />
      </main>
    </UserProvider>
  );
}

export default App;
