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
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #2e026d, #15162c)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3rem',
          padding: '4rem 1rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center'
          }}>
            Holiday Program <span style={{color: '#c084fc'}}>Aggregator</span>
          </h1>
          <div style={{
            maxWidth: '320px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            borderRadius: '12px',
            color: 'white'
          }}>
            <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>
              Health Check →
            </h3>
            <div style={{fontSize: '1.125rem'}}>
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
      </main>
    </>
  );
}