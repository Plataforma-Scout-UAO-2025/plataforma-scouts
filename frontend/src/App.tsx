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
import TreasurerEnrollment from "./app/routes/grupos/basic-info/TreasurerEnrollment";
import ScouterEnrollment from "./app/routes/grupos/basic-info/ScouterEnrollment";
import ComiteAdminEnrollment from "./app/routes/grupos/basic-info/ComiteEnrollment";
import ScoutEnrollmentInfo from "./app/routes/grupos/basic-info/ScoutEnrollmentInfo";
import GuardianEnrollment from "./app/routes/grupos/basic-info/GuardianEnrollment";

// Guardianes
import GuardianProfile from "./app/routes/guardians/profile/components/GuardianProfile";
import MembersInCharge from "./app/routes/guardians/members/components/views/MembersInCharge";
import WelcomeAddMember from "@/app/routes/guardians/members/components/views/WelcomeAddMember.tsx";
import ReporteView from "./app/routes/financiero/Reportes/components/ReporteView";

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
            <Route path="organigrama" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GLOBAL, RawRole.ADMIN_GRUPO, RawRole.SCOUTER, RawRole.DEV_SUPPORT]}><OrganigramaHome /></ProtectedRoute>} />
            <Route path="organigrama/ramas-y-subramas" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GLOBAL, RawRole.ADMIN_GRUPO, RawRole.SCOUTER, RawRole.DEV_SUPPORT]}><Organigrama /></ProtectedRoute>} />
            <Route path="organigrama/rama/:id" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GLOBAL, RawRole.ADMIN_GRUPO, RawRole.SCOUTER, RawRole.DEV_SUPPORT]}><RamaDetail /></ProtectedRoute>} />
            <Route path="organigrama/subrama/:id" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GLOBAL, RawRole.ADMIN_GRUPO, RawRole.SCOUTER, RawRole.DEV_SUPPORT]}><SubramaDetail /></ProtectedRoute>} />
            <Route path="organigrama/niveles-organizativos" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GLOBAL, RawRole.ADMIN_GRUPO, RawRole.DEV_SUPPORT]}><NivelesPage /></ProtectedRoute>} />
            <Route path="organigrama/resumen" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GLOBAL, RawRole.ADMIN_GRUPO, RawRole.SCOUTER, RawRole.DEV_SUPPORT]}><OrgChartSummary /></ProtectedRoute>} />

            {/* ===================== GRUPOS ===================== */}
            {/* Mantener solo la ruta protegida más abajo */}

            {/* Rutas para admin de grupo */}
            <Route path="financiero/cuotas" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.TESORERO, RawRole.COMITE_ADMIN]}><Financiero /></ProtectedRoute>} />
            <Route path="financiero/cuotas/gestion" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.TESORERO, RawRole.COMITE_ADMIN]}><Gestion /></ProtectedRoute>} />
            <Route path="financiero/pagos" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.TESORERO, RawRole.COMITE_ADMIN]}><Pagos /></ProtectedRoute>} />
            <Route path="financiero/pagos/reportes" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO", "TESORERO"]}><ReporteView /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.SCOUT, RawRole.GUEST, RawRole.ACUDIENTE, RawRole.TESORERO, RawRole.SCOUTER, RawRole.COMITE_ADMIN]}><Dashboard /></ProtectedRoute>} />
            <Route path="miembros" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.SCOUTER]}><Miembros /></ProtectedRoute>} />
            <Route path="inscripcion" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.GUEST, RawRole.SCOUT, RawRole.ACUDIENTE, RawRole.SCOUTER, RawRole.COMITE_ADMIN]}><ScoutEnrollment /></ProtectedRoute>} />
            <Route path="solicitudes" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO]}><Requests /></ProtectedRoute>} />
            <Route path="solicitudes/rechazadas" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO]}><Rejected /></ProtectedRoute>} />
            <Route path="inscripcion/tesorero" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.TESORERO]}><TreasurerEnrollment /></ProtectedRoute>} />
            <Route path="inscripcion/scouter" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.SCOUTER]}><ScouterEnrollment /></ProtectedRoute>} />
            <Route path="inscripcion/comite-admin" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.COMITE_ADMIN]}><ComiteAdminEnrollment /></ProtectedRoute>} />
            <Route path="inscripcion/acudiente" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.ACUDIENTE]}><GuardianEnrollment /></ProtectedRoute>} />

            {/* Rutas para acudiente */}
            <Route path="financiero/estado-cuenta" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.ACUDIENTE, RawRole.TESORERO, RawRole.COMITE_ADMIN]}><EstadoCuenta /></ProtectedRoute>} />
            <Route path="grupos" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.ACUDIENTE, RawRole.COMITE_ADMIN]}><Grupos /></ProtectedRoute>} />
            <Route path="grupos/informacion-medica" element={<ProtectedRoute allowedRoles={[RawRole.ADMIN_GRUPO, RawRole.ACUDIENTE, RawRole.SCOUTER]}><MedicalRecordsView /></ProtectedRoute>} />

            {/* Rutas para Guardianes*/}
            <Route path="guardians/members" element={<ProtectedRoute allowedRoles={[RawRole.ACUDIENTE]}><MembersInCharge /></ProtectedRoute>} />
            <Route path="guardians/profile" element={<ProtectedRoute allowedRoles={[RawRole.ACUDIENTE]}><GuardianProfile /></ProtectedRoute>} />
            <Route path="guardians/welcome" element={<ProtectedRoute allowedRoles={[RawRole.ACUDIENTE]}><WelcomeAddMember /></ProtectedRoute>} />

            {/* Rutas para Scout*/}
            <Route path="grupos/utils/ScoutEnrollmentInfo" element={<ProtectedRoute allowedRoles={[RawRole.SCOUT]}><ScoutEnrollmentInfo /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to={"/"} />} />
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;