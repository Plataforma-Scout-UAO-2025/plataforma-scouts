import { BrowserRouter, Routes, Route } from "react-router-dom";

// Routes imports
import Login from "./app/routes/Login";
import Register from "./app/routes/Register";
import AppLayout from "./components/layout/AppLayout";
import Cuotas from "./app/routes/financiero/Cuotas";
import Dashboard from "./app/routes/Dashboard";
import OrganigramaPage from "./app/routes/organigrama";
import DetalleRamaTropa from "./app/routes/organigrama/detalleRamaTropa";
import DetalleSubramaPatrullaLeones from "./app/routes/organigrama/detalleSubramaPatrullaLeones";
import DetalleRamaManada from "./app/routes/organigrama/detalleRamaManada"
import DetalleRamaClan from "./app/routes/organigrama/detalleRamaClan"
import DetalleSubramaPatrullaHalcones from "./app/routes/organigrama/detalleSubramaPatrullaHalcones"


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
            <Route path="organigrama" element={<OrganigramaPage />} />
            <Route path="organigrama/detalle-ramaTropa" element={<DetalleRamaTropa />} />
            <Route path="organigrama/detalle-subramaPatrullaLeones" element={<DetalleSubramaPatrullaLeones />} />
            <Route path="organigrama/detalle-ramaManada" element={<DetalleRamaManada />} />
            <Route path="organigrama/detalle-ramaClan" element={<DetalleRamaClan />} />
            <Route path="organigrama/detalle-subramaPatrullaHalcones" element={<DetalleSubramaPatrullaHalcones />} />
          </Route>
          {/* Agrega más rutas aquí */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
