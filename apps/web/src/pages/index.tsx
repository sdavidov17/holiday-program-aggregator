import Head from "next/head";
import { api } from "~/utils/api";

export default function Home() {
  const healthz = api.healthz.healthz.useQuery();

  return (
    <>
      <Head>
        <title>Holiday Program Aggregator</title>
        <meta name="description" content="Find the perfect holiday programs for your children" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Holiday Program <span className="text-[hsl(280,100%,70%)]">Aggregator</span>
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20">
              <h3 className="text-2xl font-bold">Health Check →</h3>
              <div className="text-lg">
                {healthz.data ? (
                  <div>
                    <p>Status: {healthz.data.status}</p>
                    <p>Time: {new Date(healthz.data.timestamp).toLocaleString()}</p>
                  </div>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}