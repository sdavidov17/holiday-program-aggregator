import { type GetServerSidePropsContext } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { getServerAuthSession } from "~/server/auth";

export default function SignIn() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create account");
        }

        // Sign in after successful signup
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          await router.push("/profile");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } else {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        await router.push("/profile");
      }
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>{isSignUp ? "Sign Up" : "Sign In"}</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        {isSignUp && (
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "5px" }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
        )}

        {error && (
          <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
        </button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => signIn("google", { callbackUrl: "/profile" })}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => signIn("apple", { callbackUrl: "/profile" })}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#000",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sign in with Apple
        </button>
      </div>

      <div>
        <button
          onClick={() => signIn("discord", { callbackUrl: "/profile" })}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#5865f2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sign in with Discord
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);

  // If already logged in, redirect to profile
  if (session) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }

  return { props: {} };
}