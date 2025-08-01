import { useRouter } from "next/router";
import Link from "next/link";

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication.",
  };

  const message = errorMessages[error as string] || errorMessages.Default;

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", textAlign: "center" }}>
      <h1>Authentication Error</h1>
      <p style={{ color: "red", marginBottom: "20px" }}>{message}</p>
      <Link 
        href="/auth/signin"
        style={{
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px",
        }}
      >
        Back to Sign In
      </Link>
    </div>
  );
}