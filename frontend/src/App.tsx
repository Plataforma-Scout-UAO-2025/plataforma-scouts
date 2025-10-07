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


function App() {
  useAuth0ApiWrapper();

  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscripcion" element={<ScoutEnrollment />} />
          <Route path="/scout/dashboard" element={<ScoutDashboard />} />
          <Route path="/app" element={<AppLayout />}>
           

            {/* Rutas para admin de grupo */}
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
            {/* 
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="miembros" element={<TeamMembers />} />
                <Route path="insignias" element={<Insignias />} />
                <Route path="eventos" element={<Events />} />
                <Route path="solicitudes" element={<Requests />} />
                <Route path="organigrama" element={<Organigrama />} /> 
                <Route path="organigrama/rama/:id" element={<RamaDetail />} />
                <Route path="organigrama/subrama/:id" element={<SubramaDetail />} /> */}

            {/* Rutas para acudiente */}
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
