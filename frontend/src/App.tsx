import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0ApiWrapper } from "./hooks/useAuth0ApiWrapper";

// Routes imports
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Home from "./app/routes/Home";
import Dashboard from "./app/routes/dashboard/Dashboard";
import Cuotas from "./app/routes/financiero/Cuotas/Cuotas";
import Gestion from "./app/routes/financiero/Gestion/Gestion";
import MedicalInfo from "./app/routes/grupos/medical-info/MedicalInfo";
import Grupos from "./app/routes/grupos/Grupos";

// Pages - Admin Grupal
import TeamMembers from "./app/routes/adminGrupal/Miembros/Miembros";
import Requests from "./app/routes/adminGrupal/Solicitudes/Requests";
import Rejected from "./app/routes/adminGrupal/Solicitudes/Rejected";

// Pages - Scout
import ScoutEnrollment from "./app/routes/grupos/basic-info/ScoutEnrollment";
import ScoutDashboard from "./app/routes/scout/dashboard/Dashboard";

// Pages - Guardians/Acudientes
import GuardianProfile from "./app/routes/guardians/profile/components/GuardianProfile";
import MembersInCharge from "./app/routes/guardians/members/components/views/MembersInCharge";
import WelcomeAddMember from "./app/routes/guardians/members/components/views/WelcomeAddMember";

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
          
          {/* ============================================
              RUTAS DE INSCRIPCIÓN Y SCOUT (Sin auth requerida aún)
          ============================================ */}
          <Route path="/inscripcion" element={<ScoutEnrollment />} />
          <Route path="/scout/dashboard" element={<ScoutDashboard />} />
          
          {/* Redirecciones para compatibilidad con rutas antiguas de guardians */}
          <Route path="/guardians" element={<Navigate to="/app/acudiente" replace />} />
          <Route path="/guardians/members" element={<Navigate to="/app/acudiente/miembros" replace />} />
          <Route path="/guardians/profile" element={<Navigate to="/app/acudiente/perfil" replace />} />
          <Route path="/acudientes" element={<Navigate to="/app/acudiente" replace />} />
          <Route path="/acudientes/miembros" element={<Navigate to="/app/acudiente/miembros" replace />} />
          <Route path="/acudientes/perfil" element={<Navigate to="/app/acudiente/perfil" replace />} />
          
          {/* ============================================
              RUTAS PROTEGIDAS DE LA APLICACIÓN
              AppLayout sin withAuthenticationRequired porque cada ruta tiene su ProtectedRoute
          ============================================ */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            
            {/* ===================== ORGANIGRAMA ===================== */}
            <Route path="organigrama" element={<OrganigramaHome />} />
            <Route path="organigrama/ramas-y-subramas" element={<Organigrama />} />
            <Route path="organigrama/rama/:id" element={<RamaDetail />} />
            <Route path="organigrama/subrama/:id" element={<SubramaDetail />} />
            <Route path="organigrama/niveles-organizativos" element={<NivelesPage />} />
            <Route path="organigrama/resumen" element={<div>Vista resumen (en desarrollo)</div>} />
            
            {/* ============================================
                RUTAS PARA ADMIN DE GRUPO
            ============================================ */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Financiero */}
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
              path="financiero/estado-cuenta"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO", "ACUDIENTE", "TESORERO"]}>
                  <EstadoCuenta />
                </ProtectedRoute>
              }
            />
            
            {/* Gestión de miembros */}
            <Route
              path="miembros"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}>
                  <TeamMembers />
                </ProtectedRoute>
              }
            />
            
            {/* Solicitudes */}
            <Route
              path="solicitudes/pendientes"
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
            
            {/* ============================================
                RUTAS PARA ACUDIENTE
            ============================================ */}
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
            <Route
              path="acudiente"
              element={
                <ProtectedRoute allowedRoles={["ACUDIENTE"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="acudiente/miembros"
              element={
                <ProtectedRoute allowedRoles={["ACUDIENTE"]}>
                  <MembersInCharge />
                </ProtectedRoute>
              }
            />
            <Route
              path="acudiente/bienvenida"
              element={
                <ProtectedRoute allowedRoles={["ACUDIENTE"]}>
                  <WelcomeAddMember />
                </ProtectedRoute>
              }
            />
            <Route
              path="acudiente/perfil"
              element={
                <ProtectedRoute allowedRoles={["ACUDIENTE"]}>
                  <GuardianProfile />
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