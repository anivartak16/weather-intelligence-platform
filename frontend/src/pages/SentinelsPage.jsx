/**
 * SentinelsPage Component - Civic Sentinel Trust Leaderboard & Badges
 */
import React from 'react';
import CivicTrustSection from '../components/CivicTrustSection.jsx';

export default function SentinelsPage() {
    return (
        <div className="gov-console-page animate-fade-in">
            <div className="gov-page-header-strip">
                <div>
                    <span className="gov-service-badge">CIVIC SENTINEL NETWORK</span>
                    <h1 className="gov-console-title">Civic Sentinel Trust & Gamification</h1>
                    <p className="gov-console-desc">
                        Honoring verified citizen scouts who contribute ground-truth weather reports during critical disasters.
                    </p>
                </div>
            </div>
            <CivicTrustSection />
        </div>
    );
}
