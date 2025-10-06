import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";

// Routes imports
// import Login from "./app/routes/Login";
// import Register from "./app/routes/Register";
import AppLayout from "./components/layout/AppLayout";
import Cuotas from "./app/routes/financiero/Cuotas/Cuotas";
import Dashboard from "./app/routes/Dashboard";
import TeamMembers from "./app/routes/adminGrupal/Miembros/Miembros";
import Events from "./app/routes/adminGrupal/Eventos/Eventos";
import HomeAdminGrupal from "./app/routes/adminGrupal/Dashboard/Dashboard";
import Insignias from "./app/routes/adminGrupal/Insignias/Insignias";
import Gestion from "./app/routes/financiero/Gestion/Gestion";
import { Toaster } from "sonner";
import MedicalInfo from "./app/routes/grupos/medical-info/MedicalInfo";
import Grupos from "./app/routes/grupos/Grupos";
//import Home from "./app/routes/Home";
import ScoutEnrollment from "./app/routes/grupos/basic-info/ScoutEnrollment";
import LandingPage from "./app/routes/LandingPage";
import Requests from "./app/routes/adminGrupal/Solicitudes/Requests";
import Rejected from "./app/routes/adminGrupal/Solicitudes/Rejected";

// Protected components
const ProtectedAppLayout = withAuthenticationRequired(AppLayout);
import Organigrama from "./app/routes/organigrama";
import RamaDetail from "@/app/routes/organigrama/components/RamaDetail";
import SubramaDetail from "@/app/routes/organigrama/components/SubramaDetail";

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Se quitan las rutas de login y register pues todo será manejado desde Auth0
          <Route path="/login" element={<ProtectedLogin />} />
          <Route path="/register" element={<ProtectedRegister />} /> */}
          <Route path="/inscripcion" element={<ScoutEnrollment />} />
          <Route path="/app" element={<ProtectedAppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="organigrama" element={<Organigrama />} />
            <Route path="financiero/cuotas" element={<Cuotas />} />
            <Route path="adminGrupal" element={<HomeAdminGrupal />} />
            <Route path="adminGrupal/miembros" element={<TeamMembers />} />
            <Route path="adminGrupal/insignias" element={<Insignias />} />
            <Route path="adminGrupal/eventos" element={<Events />} />
            <Route path="adminGrupal/solicitudes" element={<Requests />} />
            <Route path="adminGrupal/rechazadas" element={<Rejected />} />
            <Route path="financiero/cuotas/gestion" element={<Gestion />} />
            <Route path="grupos" element={<Grupos />} />
            <Route path="grupos/medical-info" element={<MedicalInfo />} />
            <Route path="organigrama/rama/:id" element={<RamaDetail />} />
            <Route path="organigrama/subrama/:id" element={<SubramaDetail />} />
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
