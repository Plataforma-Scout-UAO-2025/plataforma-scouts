import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0ApiWrapper } from "./hooks/useAuth0ApiWrapper";

// Routes imports
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import { RawRole } from "./roles/roles";
import Home from "./app/routes/Home";
import Dashboard from "./app/routes/dashboard/Dashboard";
import Miembros from "./app/routes/admin-grupal/Miembros/Miembros";
import Financiero from "./app/routes/financiero/Financiero";
import Gestion from "./app/routes/financiero/Gestion/Gestion";
import MedicalRecordsView from "./app/routes/grupos/components/MedicalRecordView";
import Grupos from "./app/routes/grupos/Grupos";
import Requests from "./app/routes/admin-grupal/Solicitudes/pendientes/Requests";
import Rejected from "./app/routes/admin-grupal/Solicitudes/rechazadas/Rejected";

import EstadoCuenta from "./app/routes/financiero/EstadoCuenta/EstadoCuenta";
import Pagos from "./app/routes/financiero/Pagos/Pagos";

// Organigrama
import Organigrama from "./app/routes/organigrama/organigramaRamas_Subramas";
import RamaDetail from "@/app/routes/organigrama/organigramaRamas_Subramas/components/RamaDetail";
import SubramaDetail from "@/app/routes/organigrama/organigramaRamas_Subramas/components/SubramaDetail";
import NivelesPage from "@/app/routes/organigrama/organigramaNivelesOrganizativos/NivelesPage";
import OrganigramaHome from "./app/routes/organigrama/OrganigramaHome";
import OrgChartSummary from "./app/routes/organigrama/OrgChartSummary";

// Miembros
import ScoutEnrollment from "./app/routes/grupos/basic-info/ScoutEnrollment";

// Guardianes
import GuardianProfile from "./app/routes/guardians/profile/components/GuardianProfile";
import MembersInCharge from "./app/routes/guardians/members/components/views/MembersInCharge";
import WelcomeAddMember from "@/app/routes/guardians/members/components/views/WelcomeAddMember.tsx";

function App() {
  useAuth0ApiWrapper();

  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          {/* Login & Registro */}
          <Route path="/" element={<Home />} />

          {/* Rutas internas con layout */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />

            {/* ===================== ORGANIGRAMA ===================== */}
            <Route path="organigrama" element={<ProtectedRoute allowedRoles={["ADMIN_GLOBAL","ADMIN_GRUPO","SCOUTER","DEV_SUPPORT"]}><OrganigramaHome /></ProtectedRoute>} />
            <Route path="organigrama/ramas-y-subramas" element={<ProtectedRoute allowedRoles={["ADMIN_GLOBAL","ADMIN_GRUPO","SCOUTER","DEV_SUPPORT"]}><Organigrama /></ProtectedRoute>} />
            <Route path="organigrama/rama/:id" element={<ProtectedRoute allowedRoles={["ADMIN_GLOBAL","ADMIN_GRUPO","SCOUTER","DEV_SUPPORT"]}><RamaDetail /></ProtectedRoute>} />
            <Route path="organigrama/subrama/:id" element={<ProtectedRoute allowedRoles={["ADMIN_GLOBAL","ADMIN_GRUPO","SCOUTER","DEV_SUPPORT"]}><SubramaDetail /></ProtectedRoute>} />
            <Route path="organigrama/niveles-organizativos" element={<ProtectedRoute allowedRoles={["ADMIN_GLOBAL","ADMIN_GRUPO","SCOUTER","DEV_SUPPORT"]}><NivelesPage /></ProtectedRoute>} />
            <Route path="organigrama/resumen" element={<ProtectedRoute allowedRoles={["ADMIN_GLOBAL","ADMIN_GRUPO","SCOUTER","DEV_SUPPORT"]}><OrgChartSummary /></ProtectedRoute>} />

            {/* ===================== GRUPOS ===================== */}
            <Route path="grupos" element={<Grupos />} />

            {/* Rutas para admin de grupo */}
            <Route path="financiero/cuotas" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.TESORERO]}><Financiero /></ProtectedRoute>} />
            <Route path="financiero/cuotas/gestion" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.TESORERO]}><Gestion /></ProtectedRoute>} />
            <Route path="financiero/pagos" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.TESORERO]}><Pagos /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.SCOUT, RawRole.GUEST, RawRole.ACUDIENTE, RawRole.TESORERO]}><Dashboard /></ProtectedRoute>} />
            <Route path="miembros" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO]}><Miembros /></ProtectedRoute>} />
            <Route path="inscripcion" element={<ProtectedRoute allowedRoles={[RawRole.GUEST, RawRole.SCOUT, RawRole.ACUDIENTE]}><ScoutEnrollment /></ProtectedRoute>} />
            <Route path="solicitudes" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO]}><Requests /></ProtectedRoute>} />
            <Route path="solicitudes/rechazadas" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO]}><Rejected /></ProtectedRoute>} />
            {/*
            <Route path="insignias" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO]}><Insignias /></ProtectedRoute>} />
            */}

            {/* Rutas para acudiente */}
            <Route path="financiero/estado-cuenta" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.ACUDIENTE, RawRole.TESORERO]}><EstadoCuenta /></ProtectedRoute>} />
            <Route path="grupos" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.ACUDIENTE]}><Grupos /></ProtectedRoute>} />
            <Route path="grupos/informacion-medica" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.ACUDIENTE]}><MedicalRecordsView /></ProtectedRoute>} />

            {/* Rutas para Guardianes*/}
            <Route path="guardians/members" element={<ProtectedRoute allowedRoles={['ACUDIENTE']}><MembersInCharge /></ProtectedRoute>} />
            <Route path="guardians/profile" element={<ProtectedRoute allowedRoles={['ACUDIENTE']}><GuardianProfile /></ProtectedRoute>} />
            <Route path="guardians/welcome" element={<ProtectedRoute allowedRoles={['ACUDIENTE']}><WelcomeAddMember /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to={"/"} />} />
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;