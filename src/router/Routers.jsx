import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';

const Routers = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />} />
            </Routes>
        </Router>
    )
}

export default Routers;