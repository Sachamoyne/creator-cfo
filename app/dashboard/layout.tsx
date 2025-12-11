import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Wrapper - Fixed width */}
      <aside className="w-64 hidden md:flex flex-col border-r border-border">
        <Sidebar />
      </aside>

      {/* Main Content - Flex Grow & Scrollable */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

