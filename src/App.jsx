import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import DettaglioEdificio from "./pages/DettaglioEdificio";
import RilievoAmbiente from "./pages/RilievoAmbiente";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="edificio/:idEdificio" element={<DettaglioEdificio />} />
          <Route path="ambiente/:idAmbiente" element={<RilievoAmbiente />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
