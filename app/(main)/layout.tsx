import Navbar from "@/components/shared/NavBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <Navbar />
      {children}
    </div>
  );
}
