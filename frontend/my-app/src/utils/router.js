import React from 'react';
import { Routes, Route} from 'react-router-dom';
import Login from "../page/Login";
import Home from "../page/Home";
import VacancyDetails from "../components/vacancyDetail";
const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Login />} />
            <Route path="/vacancy/:vacancyId" element={<VacancyDetails />} />
        </Routes>
    );
};

export default AppRoutes;