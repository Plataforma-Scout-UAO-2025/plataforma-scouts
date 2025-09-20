import { BrowserRouter, Routes, Route } from "react-router-dom";

// Routes imports
import Login from "./app/routes/Login";
import Register from "./app/routes/Register";
import AppLayout from "./components/layout/AppLayout";
import Cuotas from "./app/routes/financiero/Cuotas/Cuotas";
import Dashboard from "./app/routes/Dashboard";
import Gestion from "./app/routes/financiero/Gestion/Gestion";
import { Toaster } from "sonner";
import MedicalInfo from "./app/routes/grupos/medical-info/MedicalInfo";
import Grupos from "./app/routes/grupos/Grupos";

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="financiero/cuotas" element={<Cuotas />} />

            <Route path="financiero/cuotas/gestion" element={<Gestion />} />
            <Route path="grupos" element={<Grupos />} />
            <Route path="grupos/medical-info" element={<MedicalInfo />} />

          </Route>
          {/* Agrega más rutas aquí */}
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
