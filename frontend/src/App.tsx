import { BrowserRouter, Routes, Route } from "react-router-dom";

// Routes imports
import Login from "./app/routes/Login";
import Register from "./app/routes/Register";
import AppLayout from "./components/layout/AppLayout";
import Cuotas from "./app/routes/financiero/Cuotas/Cuotas";
import Dashboard from "./app/routes/Dashboard";
import Gestion from "./app/routes/financiero/Gestion/Gestion";
import { Toaster } from "sonner";
import MedicalInfo from "./app/routes/grupos/medical-info/MedicalInfo";
import Grupos from "./app/routes/grupos/Grupos";

// Organigrama
import Organigrama from "./app/routes/organigrama/organigramaRamas_Subramas";
import RamaDetail from "@/app/routes/organigrama/organigramaRamas_Subramas/components/RamaDetail";
import SubramaDetail from "@/app/routes/organigrama/organigramaRamas_Subramas/components/SubramaDetail";
import NivelesPage from "@/app/routes/organigrama/organigramaNivelesOrganizativos/NivelesPage";
import OrganigramaHome from "./app/routes/organigrama/OrganigramaHome";

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          {/* 🔹 Login & Registro */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔹 Rutas internas con layout */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />

            {/* ===================== ORGANIGRAMA ===================== */}
            <Route path="organigrama" element={<OrganigramaHome />} />
            <Route path="organigrama/ramas-y-subramas" element={<Organigrama />} />
            <Route path="organigrama/rama/:id" element={<RamaDetail />} />
            <Route path="organigrama/subrama/:id" element={<SubramaDetail />} />
            <Route path="organigrama/niveles-organizativos" element={<NivelesPage />} />
            <Route path="organigrama/resumen" element={<div>Vista resumen (en desarrollo)</div>} />

            {/* ===================== FINANCIERO ===================== */}
            <Route path="financiero/cuotas" element={<Cuotas />} />
            <Route path="financiero/cuotas/gestion" element={<Gestion />} />

            {/* ===================== GRUPOS ===================== */}
            <Route path="grupos" element={<Grupos />} />
            <Route path="grupos/medical-info" element={<MedicalInfo />} />
          </Route>
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
