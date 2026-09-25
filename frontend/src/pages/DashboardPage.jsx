/**
 * Dashboard Page
 * KrishiLink-inspired Enterprise National Weather Intelligence Platform
 * Multi-view architecture with Gov bar, unified sticky navbar, 
 * dedicated full-capability viewports, and official national footer.
 */
import React from 'react';
import GovTopBar from '../components/GovTopBar.jsx';
import Navbar from '../components/Navbar.jsx';
import PortalHeroSection from '../components/PortalHeroSection.jsx';
import GisMapSection from '../components/GisMapSection.jsx';
import IncidentFeedSection from '../components/IncidentFeedSection.jsx';
import SocialMediaSection from '../components/SocialMediaSection.jsx';
import ReportTrackerSection from '../components/ReportTrackerSection.jsx';
import CivicTrustSection from '../components/CivicTrustSection.jsx';
import SitrepSection from '../components/SitrepSection.jsx';
import NationalFooter from '../components/NationalFooter.jsx';
import ActionModal from '../components/ActionModal.jsx';
import ForensicsModal from '../components/ForensicsModal.jsx';
import SimulationModal from '../components/SimulationModal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { 
    CheckCircle, 
    AlertTriangle, 
    Info 
} from 'lucide-react';

export default function DashboardPage() {
    const { 
        activeTab, 
        notification 
    } = useApp();

    return (
        <div className="dashboard-layout">
            {/* Official Government of India Top Header */}
            <GovTopBar />

            {/* KrishiLink-style Unified Navigation Header */}
            <Navbar />

            {/* Professional Focused Workspace Views */}
            <main className="dashboard-main-content">
                {/* 1. National Portal Home Overview */}
                {(activeTab === 'home' || activeTab === 'overview' || !activeTab) && (
                    <div className="tab-view-container animate-fade-in">
                        <PortalHeroSection />
                    </div>
                )}

                {/* 2. GIS Command Radar */}
                {activeTab === 'gis' && (
                    <div className="tab-view-container animate-fade-in">
                        <GisMapSection />
                    </div>
                )}

                {/* 3. Incident Desk & Ground Truth */}
                {activeTab === 'feed' && (
                    <div className="tab-view-container animate-fade-in">
                        <IncidentFeedSection />
                    </div>
                )}

                {/* 4. Citizen Disaster Reporting Wizard */}
                {activeTab === 'report' && (
                    <div className="tab-view-container animate-fade-in">
                        <ReportTrackerSection mode="report" />
                    </div>
                )}

                {/* 5. Citizen Tracking Ledger & Audit Trail */}
                {activeTab === 'tracker' && (
                    <div className="tab-view-container animate-fade-in">
                        <ReportTrackerSection mode="tracker" />
                    </div>
                )}

                {/* 6. #IMD Social Stream & Rumor Meter */}
                {activeTab === 'social' && (
                    <div className="tab-view-container animate-fade-in">
                        <SocialMediaSection />
                    </div>
                )}

                {/* 7. Tactical SITREP (DEOC) */}
                {activeTab === 'sitrep' && (
                    <div className="tab-view-container animate-fade-in">
                        <SitrepSection />
                    </div>
                )}

                {/* 8. Civic Sentinel Trust & Leaderboard */}
                {activeTab === 'trust' && (
                    <div className="tab-view-container animate-fade-in">
                        <CivicTrustSection />
                    </div>
                )}
            </main>

            {/* Comprehensive National Footer */}
            <NationalFooter />

            {/* Floating Operations Modals */}
            <ActionModal />
            <ForensicsModal />
            <SimulationModal />

            {/* Toast Notifications */}
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
