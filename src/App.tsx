import * as React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import QadamMath from "./pages/QadamMath";
import RegistrationsPage from "./pages/Registrations";



export default function App() {
  return (
    <Routes>
      
      <Route path="/qadam-math-2025" element={<QadamMath />} />
      <Route path="/registrations" element={<RegistrationsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
