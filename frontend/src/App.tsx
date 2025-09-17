import { BrowserRouter, Routes, Route } from "react-router-dom";

// Routes imports
import Login from "./app/routes/Login";
import Register from "./app/routes/Register";
import AppLayout from "./components/layout/AppLayout";
import Cuotas from "./app/routes/financiero/Cuotas";
import Dashboard from "./app/routes/Dashboard";
import TeamMembers from "./app/routes/adminGrupal/TeamMembers";
import Badges from "./app/routes/adminGrupal/Badges";
import Events from "./app/routes/adminGrupal/Events";
import FinanceDashboard from "./app/routes/adminGrupal/FinanceDashboard";
import AccountStatements from "./app/routes/adminGrupal/AccountStatements";
import PaymentRecords from "./app/routes/adminGrupal/PaymentRecords";
import Home from "./app/routes/adminGrupal/Home";

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
            <Route path="adminGrupal" element={<Home />} />
            <Route path="adminGrupal/miembros" element={<TeamMembers />} />
            <Route path="adminGrupal/insignias" element={<Badges />} />
            <Route path="adminGrupal/eventos" element={<Events />} />
            <Route path="adminGrupal/finanzas" element={<FinanceDashboard />} />
            <Route path="adminGrupal/finanzas/estados" element={<AccountStatements />} />
            <Route path="adminGrupal/finanzas/registro" element={<PaymentRecords />} />
          </Route>
          {/* Agrega más rutas aquí */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
