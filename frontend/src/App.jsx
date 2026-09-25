/**
 * App.jsx - Main Application Entry Router
 * Multi-Page Government of India Weather Intelligence Portal
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';

import GovTopBar from './components/GovTopBar.jsx';
import Navbar from './components/Navbar.jsx';
import NationalFooter from './components/NationalFooter.jsx';
import ActionModal from './components/ActionModal.jsx';
import ForensicsModal from './components/ForensicsModal.jsx';
import SimulationModal from './components/SimulationModal.jsx';

// Dedicated Pages
import HomePage from './pages/HomePage.jsx';
import CommandDashboardPage from './pages/CommandDashboardPage.jsx';
import GisRadarPage from './pages/GisRadarPage.jsx';
import IncidentTriagePage from './pages/IncidentTriagePage.jsx';
import CitizenReportPage from './pages/CitizenReportPage.jsx';
import TrackingLedgerPage from './pages/TrackingLedgerPage.jsx';
import SocialIntelPage from './pages/SocialIntelPage.jsx';
import SitrepPage from './pages/SitrepPage.jsx';
import SentinelsPage from './pages/SentinelsPage.jsx';
import NationalAlertsPage from './pages/NationalAlertsPage.jsx';

import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

function PortalLayout() {
    const { notification } = useApp();

    return (
        <div className="portal-app-wrapper">
            {/* 1. National Identity Gov Bar */}
            <GovTopBar />

            {/* 2. Unified Multi-Page Sticky Navigation */}
            <Navbar />

            {/* 3. Dedicated Route Viewport */}
            <main className="portal-page-main">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<CommandDashboardPage />} />
                    <Route path="/map" element={<GisRadarPage />} />
                    <Route path="/incidents" element={<IncidentTriagePage />} />
                    <Route path="/report" element={<CitizenReportPage />} />
                    <Route path="/track" element={<TrackingLedgerPage />} />
                    <Route path="/track/:id" element={<TrackingLedgerPage />} />
                    <Route path="/social" element={<SocialIntelPage />} />
                    <Route path="/sitrep" element={<SitrepPage />} />
                    <Route path="/sentinels" element={<SentinelsPage />} />
                    <Route path="/alerts" element={<NationalAlertsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            {/* 4. Comprehensive Government Footer */}
            <NationalFooter />

            {/* Global Operations Modals */}
            <ActionModal />
            <ForensicsModal />
            <SimulationModal />

            {/* Floating Toasts */}
            {notification && (
                <div className={`floating-toast toast-${notification.type}`}>
                    {notification.type === 'success' && <CheckCircle size={18} className="text-success" />}
                    {notification.type === 'warning' && <AlertTriangle size={18} className="text-warning" />}
                    {notification.type === 'danger' && <AlertTriangle size={18} className="text-danger" />}
                    {notification.type === 'info' && <Info size={18} className="text-primary" />}
                    <span className="toast-text">{notification.message}</span>
                </div>
            )}
        </div>
    );
}

export default function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <PortalLayout />
            </BrowserRouter>
        </AppProvider>
    );
}
