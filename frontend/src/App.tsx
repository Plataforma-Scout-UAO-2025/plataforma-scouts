import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { useAuth0ApiWrapper } from "./hooks/useAuth0ApiWrapper";
import AppLayout from "./components/layout/AppLayout";
import { Toaster } from "sonner";
import MedicalRecordsView from "./app/routes/grupos/components/MedicalRecordView";
import Home from "./app/routes/Home";
import Dashboard from "./app/routes/Dashboard";
import Cuotas from "./app/routes/financiero/Cuotas/Cuotas";
import Gestion from "./app/routes/financiero/Gestion/Gestion";

// Simulación de rol
const currentUserRole: "adminGrupal" | "adminGlobal" = "adminGrupal";

const ProtectedAppLayout = withAuthenticationRequired(AppLayout);

function App() {
  useAuth0ApiWrapper();

  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<ProtectedAppLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Rutas para adminGrupal */}
            {currentUserRole === "adminGrupal" && (
              <>
                <Route path="grupos" element={<MedicalRecordsView groupId={1} />} />
                <Route path="financiero/cuotas" element={<Cuotas />} />
                <Route path="financiero/cuotas/gestion" element={<Gestion />} />
              </>
            )}

            {/* Rutas para adminGlobal */}
            {currentUserRole === "adminGlobal" && (
              <>
                {/* Rutas específicas adminGlobal */}
              </>
            )}
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;