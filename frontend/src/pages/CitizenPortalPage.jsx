/**
 * CitizenPortalPage Component - Citizen Reporting & Incident Ledger Tracker
 */
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportTrackerSection from '../components/ReportTrackerSection.jsx';

export default function CitizenPortalPage() {
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') || 'report';

    return (
        <div className="gov-console-page animate-fade-in">
            <div className="gov-page-header-strip">
                <div>
                    <span className="gov-service-badge">CITIZEN DISASTER REPORTING & TRACKING</span>
                    <h1 className="gov-console-title">Citizen Emergency Services Portal</h1>
                    <p className="gov-console-desc">
                        Submit real-time disaster reports with GPS coordinates & media verification, or track existing report status on the immutable ledger.
                    </p>
                </div>
            </div>
            <ReportTrackerSection initialMode={tabParam === 'track' ? 'tracker' : 'report'} />
        </div>
    );
}
