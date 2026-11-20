"use client";

import { usePathname } from "next/navigation";

import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/models/") || pathname === "/language") return <main>{children}</main>;

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:flex-row">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}