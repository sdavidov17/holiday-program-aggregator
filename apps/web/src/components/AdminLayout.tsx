import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { AdminGuard } from "./AdminGuard";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  
  const navigation = [
    { name: "Dashboard", href: "/admin" },
    { name: "Providers", href: "/admin/providers" },
    { name: "Programs", href: "/admin/programs" },
    { name: "Users", href: "/admin/users" },
    { name: "Subscriptions", href: "/admin/subscription-monitor" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return router.pathname === href;
    }
    return router.pathname.startsWith(href);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900">
          <div className="flex h-16 items-center justify-center border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <nav className="mt-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-6 py-3 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "border-l-4 border-blue-500 bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-0 w-full border-t border-gray-800 p-4">
            <button
              onClick={() => void signOut()}
              className="w-full rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="pl-64">
          {/* Header */}
          <header className="bg-white shadow">
            <div className="px-8 py-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {title || "Admin Dashboard"}
              </h2>
            </div>
          </header>

          {/* Page content */}
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}