/**
 * IncidentTriagePage Component - Dedicated Incident Desk & Triage View
 */
import React from 'react';
import IncidentFeedSection from '../components/IncidentFeedSection.jsx';

export default function IncidentTriagePage() {
    return (
        <div className="gov-console-page animate-fade-in">
            <div className="gov-page-header-strip">
                <div>
                    <span className="gov-service-badge">DISASTER INCIDENT DESK & MULTIMODAL VERIFICATION</span>
                    <h1 className="gov-console-title">Ground Incident Triage Desk</h1>
                    <p className="gov-console-desc">
                        Review, verify, and action citizen reports in real time with automated AI NLP & pHash media forensics analysis.
                    </p>
                </div>
            </div>
            <IncidentFeedSection />
        </div>
    );
}
