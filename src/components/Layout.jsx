import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans">
      <header className="border-b-4 border-white p-6 sticky top-0 z-50 bg-black flex justify-center items-center">
        <Link to="/" className="font-mono text-4xl font-black tracking-tighter hover:text-green-500 transition-colors uppercase">
          UBIARCHIUM
        </Link>
      </header>

      <main className="flex-1 p-6 w-full max-w-4xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
