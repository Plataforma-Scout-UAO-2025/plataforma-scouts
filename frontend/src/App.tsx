import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0ApiWrapper } from "./hooks/useAuth0ApiWrapper";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Common components
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages - Landing & Public
import Home from "./app/routes/LandingPage";

// Pages - Dashboard
import Dashboard from "./app/routes/Dashboard";

// Pages - Financiero (Admin Grupal)
import Cuotas from "./app/routes/financiero/Cuotas/Cuotas";
import Gestion from "./app/routes/financiero/Gestion/Gestion";

// Pages - Grupos (Acudiente)
import Grupos from "./app/routes/grupos/Grupos";
import MedicalInfo from "./app/routes/grupos/medical-info/MedicalInfo";

// Pages - Admin Grupal
import TeamMembers from "./app/routes/adminGrupal/Miembros/Miembros";
import Requests from "./app/routes/adminGrupal/Solicitudes/Requests";
import Rejected from "./app/routes/adminGrupal/Solicitudes/Rejected";

// Pages - Scout
import ScoutEnrollment from "./app/routes/grupos/basic-info/ScoutEnrollment";
import ScoutDashboard from "./app/routes/scout/dashboard/Dashboard";

// Pages - Guardians/Acudientes
import { GuardianProfile, GuardianDashboard, GuardianLayout } from "./app/routes/guardians";
import { CompleteDataModal } from "./app/routes/guardians/completeData/CompleteDataModal";

import EstadoCuenta from "./app/routes/financiero/EstadoCuenta/EstadoCuenta";
import Pagos from "./app/routes/financiero/Pagos/Pagos";

function App() {
  useAuth0ApiWrapper();

  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        {/* Modal para completar datos de acudientes */}
        <CompleteDataModal />
        
        <Routes>
          {/* ============================================
              RUTAS PÚBLICAS
          ============================================ */}
          <Route path="/" element={<Home />} />
          
          {/* ============================================
              RUTAS DE INSCRIPCIÓN Y SCOUT (Sin auth requerida aún)
          ============================================ */}
          <Route path="/inscripcion" element={<ScoutEnrollment />} />
          <Route path="/scout/dashboard" element={<ScoutDashboard />} />
          
          {/* ============================================
              RUTAS INDEPENDIENTES PARA ACUDIENTES
              Estas rutas NO están dentro de /app porque tienen su propio layout
          ============================================ */}
          <Route path="/guardians" element={<GuardianDashboard />} />
          <Route path="/guardians/members" element={<GuardianLayout />} />
          <Route path="/guardians/profile" element={<GuardianProfile />} />
          {/* TODO: Crear componente MemberProfile para mostrar perfil individual de un miembro */}
          {/* <Route path="/guardians/members/:id/profile" element={<MemberProfile />} /> */}
          
          {/* Redirecciones para compatibilidad con rutas antiguas */}
          <Route path="/acudientes" element={<Navigate to="/guardians" replace />} />
          <Route path="/acudientes/miembros" element={<Navigate to="/guardians/members" replace />} />
          <Route path="/acudientes/perfil" element={<Navigate to="/guardians/profile" replace />} />
          
          {/* ============================================
              RUTAS PROTEGIDAS DE LA APLICACIÓN
              AppLayout sin withAuthenticationRequired porque cada ruta tiene su ProtectedRoute
          ============================================ */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            
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
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}>
                  <Cuotas />
                </ProtectedRoute>
              }
            />
            <Route
              path="financiero/cuotas/gestion"
              element={
                <ProtectedRoute allowedRoles={["ADMIN_GRUPO"]}>
                  <Gestion />
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
                RUTAS PARA ACUDIENTE (Dentro de /app)
                Nota: Los acudientes tienen rutas tanto en /guardians (independientes)
                como en /app (integradas con el sistema principal)
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

            {/* Rutas adicionales para tesorero */}
            <Route path="financiero/pagos" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO", "TESORERO"]}><Pagos /></ProtectedRoute>} />
            <Route path="financiero/estado-cuenta" element={<ProtectedRoute allowedRoles={["ADMIN_GRUPO","ACUDIENTE", "TESORERO"]}><EstadoCuenta /></ProtectedRoute>} />
          </Route>
          
          {/* ============================================
              RUTA CATCH-ALL
              Redirige cualquier ruta no encontrada al inicio
          ============================================ */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      
      {/* Toaster global para notificaciones */}
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
