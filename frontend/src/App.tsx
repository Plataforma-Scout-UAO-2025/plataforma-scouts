import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0ApiWrapper } from "./hooks/useAuth0ApiWrapper";

// Routes imports
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Home from "./app/routes/LandingPage";
import Dashboard from "./app/routes/Dashboard";
import Cuotas from "./app/routes/financiero/Cuotas/Cuotas";
import Gestion from "./app/routes/financiero/Gestion/Gestion";
import MedicalInfo from "./app/routes/grupos/medical-info/MedicalInfo";
import Grupos from "./app/routes/grupos/Grupos";
import TeamMembers from "./app/routes/adminGrupal/Miembros/Miembros";
import Requests from "./app/routes/adminGrupal/Solicitudes/Requests";
import Rejected from "./app/routes/adminGrupal/Solicitudes/Rejected";
import ScoutEnrollment from "./app/routes/grupos/basic-info/ScoutEnrollment";
import ScoutDashboard from "./app/routes/scout/dashboard/Dashboard";

import EstadoCuenta from "./app/routes/financiero/EstadoCuenta/EstadoCuenta";
import Pagos from "./app/routes/financiero/Pagos/Pagos";

// Organigrama
import Organigrama from "./app/routes/organigrama/organigramaRamas_Subramas";
import RamaDetail from "@/app/routes/organigrama/organigramaRamas_Subramas/components/RamaDetail";
import SubramaDetail from "@/app/routes/organigrama/organigramaRamas_Subramas/components/SubramaDetail";
import NivelesPage from "@/app/routes/organigrama/organigramaNivelesOrganizativos/NivelesPage";
import OrganigramaHome from "./app/routes/organigrama/OrganigramaHome";

function App() {
  useAuth0ApiWrapper();

  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          {/* 🔹 Login & Registro */}
          <Route path="/" element={<Home />} />

          {/* 🔹 Rutas internas con layout */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />

            {/* ===================== ORGANIGRAMA ===================== */}
            <Route path="organigrama" element={<OrganigramaHome />} />
            <Route
              path="organigrama/ramas-y-subramas"
              element={<Organigrama />}
            />
            <Route path="organigrama/rama/:id" element={<RamaDetail />} />
            <Route path="organigrama/subrama/:id" element={<SubramaDetail />} />
            <Route
              path="organigrama/niveles-organizativos"
              element={<NivelesPage />}
            />
            <Route
              path="organigrama/resumen"
              element={<div>Vista resumen (en desarrollo)</div>}
            />

            {/* ===================== FINANCIERO ===================== */}
            <Route path="financiero/cuotas" element={<Cuotas />} />
            <Route path="financiero/cuotas/gestion" element={<Gestion />} />

            {/* ===================== GRUPOS ===================== */}
            <Route path="grupos" element={<Grupos />} />
            <Route path="grupos/medical-info" element={<MedicalInfo />} />

            {/* Rutas para admin de grupo */}
            <Route
              path="financiero/cuotas"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO", "TESORERO"]}>
                  <Cuotas />
                </ProtectedRoute>
              }
            />
            <Route
              path="financiero/cuotas/gestion"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO", "TESORERO"]}>
                  <Gestion />
                </ProtectedRoute>
              }
            />
            <Route
              path="financiero/pagos"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO", "TESORERO"]}>
                  <Pagos />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="miembros"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}>
                  <TeamMembers />
                </ProtectedRoute>
              }
            />
            <Route
              path="inscripcion"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO", "GUEST"]}>
                  <ScoutEnrollment />
                </ProtectedRoute>
              }
            />
            <Route
              path="solicitudes"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}>
                  <Requests />
                </ProtectedRoute>
              }
            />
            <Route
              path="solicitudes/rechazadas"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}>
                  <Rejected />
                </ProtectedRoute>
              }
            />
            {/*
                <Route path="insignias" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}><Insignias /></ProtectedRoute>} />
                <Route path="solicitudes" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}><Requests /></ProtectedRoute>} />
                <Route path="organigrama" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}><Organigrama /></ProtectedRoute>} />
                <Route path="organigrama/rama/:id" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}><RamaDetail /></ProtectedRoute>} />
                <Route path="organigrama/subrama/:id" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}><SubramaDetail /></ProtectedRoute>} />
                */}

            {/* Rutas para acudiente */}
            <Route
              path="financiero/estado-cuenta"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN_GRUPO", "ACUDIENTE", "TESORERO"]}
                >
                  <EstadoCuenta />
                </ProtectedRoute>
              }
            />
            <Route
              path="grupos"
              element={
                <ProtectedRoute allowedRoles={["ACUDIENTE"]}>
                  <Grupos />
                </ProtectedRoute>
              }
            />
            <Route
              path="grupos/medical-info"
              element={
                <ProtectedRoute allowedRoles={["ACUDIENTE"]}>
                  <MedicalInfo />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to={"/"} />} />
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
