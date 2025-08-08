import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (!session) {
      // Not logged in, redirect to sign in
      void router.push("/auth/signin");
    } else if (session.user.role !== "ADMIN") {
      // Logged in but not admin, redirect to home
      void router.push("/");
    }
  }, [session, status, router]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Not authorized
  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">Unauthorized. Redirecting...</div>
      </div>
    );
  }

  // Authorized admin user
  return <>{children}</>;
}