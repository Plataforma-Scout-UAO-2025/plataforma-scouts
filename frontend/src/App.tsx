import { BrowserRouter, Routes, Route } from "react-router-dom";

// Routes imports
import Login from "./app/routes/Login";
import Register from "./app/routes/Register";
import ScoutEnrollment from "./app/routes/ScoutEnrollment";

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/inscription" element={<ScoutEnrollment />} />
          {/* Agrega más rutas aquí */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
