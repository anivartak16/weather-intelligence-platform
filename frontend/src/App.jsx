/**
 * App.jsx - Main Application Router
 * Genuine Government of India Disaster Operations Console
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

// Dedicated Government Console Pages
import HomePage from './pages/HomePage.jsx';
import CommandDashboardPage from './pages/CommandDashboardPage.jsx';
import GisRadarPage from './pages/GisRadarPage.jsx';
import IncidentTriagePage from './pages/IncidentTriagePage.jsx';
import CitizenPortalPage from './pages/CitizenPortalPage.jsx';
import SitrepPage from './pages/SitrepPage.jsx';
import NationalAlertsPage from './pages/NationalAlertsPage.jsx';
import SentinelsPage from './pages/SentinelsPage.jsx';
import SocialIntelPage from './pages/SocialIntelPage.jsx';

import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('[Console Error Boundary caught]:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px 24px', textAlign: 'center', maxWidth: 640, margin: '60px auto', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏛️</div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                        National Operations Console Notice
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: 20 }}>
                        {this.state.error?.message || 'An operational telemetry component encountered a transient state error.'}
                    </p>
                    <button 
                        onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }} 
                        style={{ padding: '9px 24px', borderRadius: 999, background: '#0284C7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                    >
                        Refresh Console
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function PortalLayout() {
    const { notification } = useApp();

    return (
        <div className="gov-console-wrapper">
            {/* 1. National Identity Government Header */}
            <GovTopBar />

            {/* 2. Primary Console Navigation Bar */}
            <Navbar />

            {/* 3. Main Console Viewport */}
            <main className="gov-console-main">
                <ErrorBoundary>
                    <Routes>
                    {/* Primary Government Console Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<CommandDashboardPage />} />
                    <Route path="/map" element={<GisRadarPage />} />
                    <Route path="/incidents" element={<IncidentTriagePage />} />
                    <Route path="/citizen" element={<CitizenPortalPage />} />
                    <Route path="/sitrep" element={<SitrepPage />} />
                    <Route path="/alerts" element={<NationalAlertsPage />} />

                    {/* Secondary Intelligence & Community Routes */}
                    <Route path="/social" element={<SocialIntelPage />} />
                    <Route path="/sentinels" element={<SentinelsPage />} />

                    {/* Clean Aliases & Backward Compatibility */}
                    <Route path="/report" element={<Navigate to="/citizen?tab=report" replace />} />
                    <Route path="/track" element={<Navigate to="/citizen?tab=track" replace />} />
                    <Route path="/track/:id" element={<CitizenPortalPage />} />

                    {/* Default Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                </ErrorBoundary>
            </main>

            {/* 4. Official Government Footer */}
            <NationalFooter />

            {/* Global Operational Modals */}
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
