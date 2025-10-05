import * as React from "react";
import {Routes, Route, Navigate} from "react-router-dom";
import QadamMath from "./pages/QadamMath";
import RegistrationsPage from "./pages/Registrations";



export default function App() {
    return (
        <Routes>
            <Route path="/" element={<QadamMath/>}/>

            <Route path="/qadam-math-2025" element={<Navigate to="/" replace/>}/>

            <Route path="/dauka-admin" element={<RegistrationsPage/>}/>

            <Route path="/registrations" element={<Navigate to="/dauka-admin" replace/>}/>

            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}