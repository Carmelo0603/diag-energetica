import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import DettaglioEdificio from "./pages/DettaglioEdificio";
import RilievoAmbiente from "./pages/RilievoAmbiente";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rotta Pubblica */}
                    <Route path="/login" element={<Login />} />

                    {/* Rotte Protette */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="edificio/:idEdificio" element={<DettaglioEdificio />} />
                            <Route path="ambiente/:idAmbiente" element={<RilievoAmbiente />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;