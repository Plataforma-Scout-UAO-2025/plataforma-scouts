import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";

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

// Protected components
const ProtectedAppLayout = withAuthenticationRequired(AppLayout);

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/" element={<Home/>}/>
          {/* Se quitan las rutas de login y register pues todo será manejado desde Auth0
          <Route path="/login" element={<ProtectedLogin />} />
          <Route path="/register" element={<ProtectedRegister />} /> */}
          <Route path="/app" element={<ProtectedAppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="financiero/cuotas" element={<Cuotas />} />

            <Route path="financiero/cuotas/gestion" element={<Gestion />} />
            <Route path="grupos" element={<Grupos />} />
            <Route path="grupos/medical-info" element={<MedicalInfo />} />

          </Route>
          {/* Agrega más rutas aquí */}
          <Route path="*" element={<Navigate to={"/"}/>}/>
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
