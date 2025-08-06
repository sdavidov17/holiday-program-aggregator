import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useState } from "react";

export function DebugSubscription() {
  const { data: session, status } = useSession();
  const [testResult, setTestResult] = useState<string>("");
  
  const testApi = async () => {
    try {
      const response = await fetch("/api/test");
      const data = await response.json();
      setTestResult(`API Test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`API Test Error: ${error}`);
    }
  };

  const testSession = async () => {
    try {
      const response = await fetch("/api/debug-session");
      const data = await response.json();
      setTestResult(`Session Test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Session Test Error: ${error}`);
    }
  };

  const testTrpc = api.subscription.getSubscriptionStatus.useQuery(undefined, {
    enabled: false,
  });

  const runTrpcTest = async () => {
    try {
      const result = await testTrpc.refetch();
      if (result.error) {
        setTestResult(`tRPC Error: ${result.error.message}\n\nShape: ${JSON.stringify(result.error.shape, null, 2)}`);
      } else {
        setTestResult(`tRPC Success: ${JSON.stringify(result.data, null, 2)}`);
      }
    } catch (error: any) {
      setTestResult(`tRPC Error: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <div style={{ 
      margin: "20px", 
      padding: "20px", 
      border: "1px solid #ccc", 
      borderRadius: "8px",
      backgroundColor: "#f5f5f5"
    }}>
      <h3>Debug Information</h3>
      
      <div style={{ marginBottom: "10px" }}>
        <strong>Session Status:</strong> {status}
      </div>
      
      <div style={{ marginBottom: "10px" }}>
        <strong>User:</strong> {session?.user ? (
          <span>{session.user.email} (ID: {session.user.id})</span>
        ) : (
          <span>Not logged in</span>
        )}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Environment:</strong>
        <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
          <li>NODE_ENV: {process.env.NODE_ENV}</li>
          <li>Has Stripe Key: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "Yes" : "No"}</li>
        </ul>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button 
          onClick={testApi}
          style={{
            padding: "5px 10px",
            marginRight: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Test API Endpoint
        </button>
        
        <button 
          onClick={() => void runTrpcTest()}
          style={{
            padding: "5px 10px",
            marginRight: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Test tRPC Endpoint
        </button>
        
        <button 
          onClick={testSession}
          style={{
            padding: "5px 10px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Test Session API
        </button>
      </div>

      {testResult && (
        <div style={{ 
          marginTop: "10px", 
          padding: "10px", 
          backgroundColor: "#ffffff",
          border: "1px solid #ddd",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "12px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all"
        }}>
          {testResult}
        </div>
      )}
    </div>
  );
}