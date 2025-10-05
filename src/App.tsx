import * as React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import QadamMath from "./pages/QadamMath";
import RegistrationsPage from "./pages/Registrations";

function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Home</h1>
      <p>
        Страница лендинга:{" "}
        <Link to="/qadam-math-2025">/qadam-math-2025</Link>
      </p>
      <p>
        Страница заявок:{" "}
        <Link to="/registrations">/registrations</Link>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/qadam-math-2025" element={<QadamMath />} />
      <Route path="/registrations" element={<RegistrationsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
