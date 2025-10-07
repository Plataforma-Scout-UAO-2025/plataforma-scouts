import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { useAuth0ApiWrapper } from "./hooks/useAuth0ApiWrapper";

// Routes imports
// import Login from "./app/routes/Login";
// import Register from "./app/routes/Register";
import AppLayout from "./components/layout/AppLayout";
import Cuotas from "./app/routes/financiero/Cuotas/Cuotas";
import Dashboard from "./app/routes/Dashboard";
import Gestion from "./app/routes/financiero/Gestion/Gestion";
import { Toaster } from "sonner";
import MedicalInfo from "./app/routes/grupos/medical-info/MedicalInfo";
import Grupos from "./app/routes/grupos/Grupos";
import Home from "./app/routes/Home";
import { useRoleContext } from "./hooks/useRoleContext";

// Simulación de rol actual del usuario

// Protected components
const ProtectedAppLayout = withAuthenticationRequired(AppLayout);

function App() {

  const { currentUserRole } = useRoleContext();

  useAuth0ApiWrapper();

  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<ProtectedAppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Rutas para adminGrupal */}
            {currentUserRole === "ADMIN_GRUPO" && (
              <>
                <Route path="financiero/cuotas" element={<Cuotas />} />
                <Route path="financiero/cuotas/gestion" element={<Gestion />} />
                {/* 
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="miembros" element={<TeamMembers />} />
                <Route path="insignias" element={<Insignias />} />
                <Route path="eventos" element={<Events />} />
                <Route path="solicitudes" element={<Requests />} />
                <Route path="organigrama" element={<Organigrama />} /> 
                <Route path="organigrama/rama/:id" element={<RamaDetail />} />
                <Route path="organigrama/subrama/:id" element={<SubramaDetail />} /> */}
              </>
            )}

            {currentUserRole === "SCOUT" ? (
              <>
                <Route path="grupos" element={<Grupos />} />
                <Route path="grupos/medical-info" element={<MedicalInfo />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/app" replace />} />
            )}

            {/* Rutas para todos los roles */}
            <Route path="grupos" element={<Grupos />} />
          </Route>
          {/* Agrega más rutas aquí */}
          <Route path="*" element={<Navigate to={"/"} />} />
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
