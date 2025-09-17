import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Routes imports
import Login from "./app/routes/Login";
import Register from "./app/routes/Register";
import RegistroAcudientePadres from "./app/routes/RegistroAcudientePadres";
import RegistroAcudienteEmergencia from "./app/routes/RegistroAcudienteEmergencia";


function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
            {/* Redirigir la ruta raíz a /login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

            {/* Módulo de registro de acudientes */}
            <Route path="/registro-acudiente" element={<RegistroAcudientePadres />} />
            <Route path="/registro-acudiente-emergencia" element={<RegistroAcudienteEmergencia />} />

            {/* Fallback para rutas inexistentes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            {/* Agrega más rutas aquí */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
