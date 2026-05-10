import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { UserProvider } from "../lib/AuthContext";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Head>
        <title>YourTube</title>
        <meta
          name="description"
          content="A video sharing app built with Next.js and Express."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-white text-black">
        <Header />
        <Toaster />
        <div className="flex min-h-[calc(100vh-57px)] flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
