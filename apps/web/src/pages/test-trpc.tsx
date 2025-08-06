import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function TestTRPC() {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<string>("");

  const testDirectAPI = async () => {
    try {
      const response = await fetch("/api/trpc/subscription.getSubscriptionStatus", {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      
      const text = await response.text();
      console.log("Raw response:", text);
      
      // Check if response is HTML
      if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
        setResult(`ERROR: Received HTML page instead of JSON\n\nFirst 500 chars:\n${text.substring(0, 500)}`);
      } else {
        try {
          const json = JSON.parse(text);
          setResult(`Success: ${JSON.stringify(json, null, 2)}`);
        } catch (e) {
          setResult(`ERROR: Invalid JSON response\n\n${text}`);
        }
      }
    } catch (error: any) {
      setResult(`Network error: ${error.message}`);
    }
  };

  const testBatchAPI = async () => {
    try {
      const response = await fetch("/api/trpc/subscription.getSubscriptionStatus", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          "0": {
            "json": null
          }
        }),
      });
      
      const text = await response.text();
      console.log("Raw batch response:", text);
      
      if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
        setResult(`ERROR: Received HTML page\n\nFirst 500 chars:\n${text.substring(0, 500)}`);
      } else {
        try {
          const json = JSON.parse(text);
          setResult(`Batch Success: ${JSON.stringify(json, null, 2)}`);
        } catch (e) {
          setResult(`ERROR: Invalid JSON response\n\n${text}`);
        }
      }
    } catch (error: any) {
      setResult(`Network error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>tRPC Direct Test</h1>
      
      <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
        <h3>Session Status</h3>
        <p>Status: {status}</p>
        {session?.user && (
          <>
            <p>User ID: {session.user.id}</p>
            <p>Email: {session.user.email}</p>
          </>
        )}
        {!session && (
          <p style={{ color: "red" }}>
            Not logged in! <Link href="/auth/signin">Sign in first</Link>
          </p>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={testDirectAPI}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Test Direct API Call (GET)
        </button>
        
        <button 
          onClick={testBatchAPI}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Test Batch API Call (POST)
        </button>
      </div>

      {result && (
        <pre style={{ 
          padding: "20px", 
          backgroundColor: "#f8f8f8", 
          border: "1px solid #ddd",
          borderRadius: "4px",
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all"
        }}>
          {result}
        </pre>
      )}
    </div>
  );
}