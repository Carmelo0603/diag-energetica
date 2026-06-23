import { useState } from "react";
import { Outlet, Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { Download, ChevronDown } from "lucide-react";
import { esportaRilievoExcel } from "../utils/exportExcel";

export default function Layout() {
  const { idEdificio, idAmbiente } = useParams();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const ambiente = useLiveQuery(() => (idAmbiente ? db.ambienti.get(idAmbiente) : null), [idAmbiente]);
  const effEdificioId = idEdificio || (ambiente ? ambiente.id_edificio : null);
  const edificio = useLiveQuery(() => (effEdificioId ? db.edifici.get(effEdificioId) : null), [effEdificioId]);

  const handleExport = (tipo) => {
    setExportMenuOpen(false);
    esportaRilievoExcel(effEdificioId, tipo);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans">
      <header className="border-b-4 border-white p-6 sticky top-0 z-50 bg-black flex flex-col items-center relative">
        <Link to="/" className="font-mono text-4xl font-black tracking-tighter hover:text-green-500 transition-colors uppercase">
          UBIARCHIUM
        </Link>

        {edificio && (
          <div className="absolute right-6 top-6">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="bg-white text-black p-2 hover:bg-green-500 border-2 border-white hover:border-green-500 flex items-center gap-1 transition-none"
            >
              <Download size={24} />
              <ChevronDown size={16} />
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-black border-4 border-white flex flex-col z-50">
                <button
                  onClick={() => handleExport("tutto")}
                  className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black border-b-2 border-zinc-800 transition-none"
                >
                  TABELLA COMPLETA
                </button>
                <button
                  onClick={() => handleExport("illuminazione")}
                  className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black border-b-2 border-zinc-800 transition-none"
                >
                  ILLUMINAZIONE
                </button>
                <button
                  onClick={() => handleExport("termico")}
                  className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black border-b-2 border-zinc-800 transition-none"
                >
                  TERMICO
                </button>
                <button
                  onClick={() => handleExport("infissi")}
                  className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black border-b-2 border-zinc-800 transition-none"
                >
                  INFISSI
                </button>
                <button
                  onClick={() => handleExport("apparecchi")}
                  className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black transition-none"
                >
                  APPARECCHI
                </button>
              </div>
            )}
          </div>
        )}

        {edificio && (
          <div className="w-full max-w-4xl mt-4 bg-green-500 text-black font-mono text-[13px] font-black uppercase tracking-wider py-2 px-4 flex flex-col sm:flex-row justify-center items-center text-center border-2 border-black gap-2 sm:gap-4">
            <span>Cantiere: {edificio.nome}</span>
            {ambiente && (
              <>
                <span className="hidden sm:inline">|</span>
                <span>Stanza: {ambiente.nome}</span>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 p-6 w-full max-w-4xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
