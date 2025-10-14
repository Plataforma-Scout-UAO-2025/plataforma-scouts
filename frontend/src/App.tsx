import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0ApiWrapper } from "./hooks/useAuth0ApiWrapper";

// Routes imports
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Home from "./app/routes/Home";
import Dashboard from "./app/routes/dashboard/Dashboard";
import Miembros from "./app/routes/admin-grupal/Miembros/Miembros";
import Cuotas from "./app/routes/financiero/Cuotas/Cuotas";
import Gestion from "./app/routes/financiero/Gestion/Gestion";
import MedicalInfo from "./app/routes/grupos/medical-info/MedicalInfo";
import Grupos from "./app/routes/grupos/Grupos";

import EstadoCuenta from "./app/routes/financiero/EstadoCuenta/EstadoCuenta";
import Pagos from "./app/routes/financiero/Pagos/Pagos";

// Organigrama
import Organigrama from "./app/routes/organigrama/organigramaRamas_Subramas";
import RamaDetail from "@/app/routes/organigrama/organigramaRamas_Subramas/components/RamaDetail";
import SubramaDetail from "@/app/routes/organigrama/organigramaRamas_Subramas/components/SubramaDetail";
import NivelesPage from "@/app/routes/organigrama/organigramaNivelesOrganizativos/NivelesPage";
import OrganigramaHome from "./app/routes/organigrama/OrganigramaHome";
import { RawRole } from './roles/roles';
import OrgAuthGuard from './app/routes/organigrama/OrgAuthGuard';

// Miembros
import ScoutEnrollment from "./app/routes/grupos/basic-info/ScoutEnrollment";

// Guardians (Acudientes)
import GuardianProfile from "./app/routes/guardians/profile/components/GuardianProfile";
import MembersInCharge from "./app/routes/guardians/members/components/views/MembersInCharge";

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
            {/* Rutas CRUD del organigrama: protegidas según roles del backend */}
            <Route
              path="organigrama/ramas-y-subramas"
              element={
                <OrgAuthGuard>
                  <ProtectedRoute allowedRoles={[RawRole.ADMIN_GLOBAL, RawRole.ADMIN_GRUPO, RawRole.SCOUTER, RawRole.DEV_SUPPORT]}>
                    <Organigrama />
                  </ProtectedRoute>
                </OrgAuthGuard>
              }
            />
            <Route
              path="organigrama/rama/:id"
              element={
                <OrgAuthGuard>
                  <ProtectedRoute allowedRoles={[RawRole.ADMIN_GLOBAL, RawRole.ADMIN_GRUPO, RawRole.SCOUTER, RawRole.DEV_SUPPORT]}>
                    <RamaDetail />
                  </ProtectedRoute>
                </OrgAuthGuard>
              }
            />
            <Route
              path="organigrama/subrama/:id"
              element={
                <OrgAuthGuard>
                  <ProtectedRoute allowedRoles={[RawRole.ADMIN_GLOBAL, RawRole.ADMIN_GRUPO, RawRole.SCOUTER, RawRole.DEV_SUPPORT]}>
                    <SubramaDetail />
                  </ProtectedRoute>
                </OrgAuthGuard>
              }
            />
            <Route
              path="organigrama/niveles-organizativos"
              element={
                <OrgAuthGuard>
                  <ProtectedRoute allowedRoles={[RawRole.ADMIN_GLOBAL, RawRole.ADMIN_GRUPO, RawRole.SCOUTER, RawRole.DEV_SUPPORT]}>
                    <NivelesPage />
                  </ProtectedRoute>
                </OrgAuthGuard>
              }
            />
            <Route path="organigrama/resumen" element={<div>Vista resumen (en desarrollo)</div>} />

            {/* ===================== FINANCIERO ===================== */}
            <Route path="financiero/cuotas" element={<Cuotas />} />
            <Route path="financiero/cuotas/gestion" element={<Gestion />} />

            {/* ===================== GRUPOS ===================== */}
            <Route path="grupos" element={<Grupos />} />
            <Route path="grupos/medical-info" element={<MedicalInfo />} />

            {/* Rutas para admin de grupo */}
            <Route path="financiero/cuotas" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO", "TESORERO"]}><Cuotas /></ProtectedRoute>} />
            <Route path="financiero/cuotas/gestion" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO", "TESORERO"]}><Gestion /></ProtectedRoute>} />
            <Route path="financiero/pagos" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO", "TESORERO"]}><Pagos /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}><Dashboard /></ProtectedRoute>} />
            <Route path="miembros" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}><Miembros /></ProtectedRoute>} />
            <Route path="inscripcion" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO", "GUEST", "ACUDIENTE"]}><ScoutEnrollment /></ProtectedRoute>}/>
            {/*
            <Route path="insignias" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}><Insignias /></ProtectedRoute>} />
            <Route path="solicitudes" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}><Requests /></ProtectedRoute>} />
            */}

            {/* Rutas para acudiente */}
            <Route path="financiero/estado-cuenta" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO","ACUDIENTE", "TESORERO"]}><EstadoCuenta /></ProtectedRoute>} />
            <Route path="grupos" element={<ProtectedRoute allowedRoles={["ACUDIENTE"]}><Grupos /></ProtectedRoute>} />
            <Route path="grupos/medical-info" element={<ProtectedRoute allowedRoles={["ACUDIENTE"]}><MedicalInfo /></ProtectedRoute>} />

            {/* ===================== ACUDIENTES ===================== */}
            <Route path="acudientes/perfil" element={<ProtectedRoute allowedRoles={["ACUDIENTE"]}><GuardianProfile /></ProtectedRoute>} />
            <Route path="acudientes/miembros" element={<ProtectedRoute allowedRoles={["ACUDIENTE"]}><MembersInCharge /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to={"/"} />} />
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
