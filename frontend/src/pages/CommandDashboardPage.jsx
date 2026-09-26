/**
 * CommandDashboardPage Component - Operations Command Viewport
 */
import React from 'react';
import GisMapSection from '../components/GisMapSection.jsx';
import IncidentFeedSection from '../components/IncidentFeedSection.jsx';
import CivicTrustSection from '../components/CivicTrustSection.jsx';

export default function CommandDashboardPage() {
    return (
        <div className="gov-console-page animate-fade-in">
            <div className="gov-page-header-strip">
                <div>
                    <span className="gov-service-badge">DEOC / SEOC OPERATIONS COMMAND</span>
                    <h1 className="gov-console-title">National Disaster Control Center</h1>
                    <p className="gov-console-desc">
                        Unified situational awareness console combining live Doppler radar, verified ground reports, and dispatch routing.
                    </p>
                </div>
            </div>
            <GisMapSection />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <IncidentFeedSection />
                <CivicTrustSection />
            </div>
        </div>
    );
}
