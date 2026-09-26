/**
 * GovTopBar Component
 * Official Government of India Header Bar with Ticker & Emergency Helpline
 */
import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Shield, Sparkles, PhoneCall } from 'lucide-react';

export default function GovTopBar() {
    const { openSimulationModal, telemetry } = useApp();

    return (
        <div className="gov-top-bar-wrapper">
            <div className="gov-bar-container">
                {/* National Emblem & Authority Title */}
                <div className="gov-authority-col">
                    <span className="gov-emblem-badge" role="img" aria-label="Emblem">🏛️</span>
                    <div className="gov-hierarchy-text">
                        <div className="gov-name-row">
                            <span className="gov-title-hi">भारत सरकार</span>
                            <span className="gov-title-divider">|</span>
                            <span className="gov-title-en">GOVERNMENT OF INDIA</span>
                        </div>
                        <div className="gov-departments-row">
                            <span>Ministry of Earth Sciences</span>
                            <span className="gov-dot">•</span>
                            <span>India Meteorological Department (IMD)</span>
                        </div>
                    </div>
                </div>

                {/* Ticker marquee */}
                <div className="gov-ticker-col">
                    <div className="gov-ticker-pill">
                        <div className="ticker-alert-beacon">
                            <span className="ticker-badge-text">NDMA SACHET</span>
                        </div>
                        <div className="ticker-marquee-track">
                            <span className="ticker-message">
                                Live Doppler Radar Active ({telemetry?.city || 'Indore'}) • Flood Risk: {telemetry?.floodRiskLevel?.replace(/_/g, ' ') || 'LOW'} • National Emergency Helpline: 1077 / 112
                            </span>
                        </div>
                    </div>
                </div>

                {/* Emergency Actions */}
                <div className="gov-actions-col">
                    <a href="tel:1077" className="gov-sos-pill">
                        <PhoneCall size={12} />
                        <span>Helpline: 1077</span>
                    </a>
                    <button className="gov-sim-btn" onClick={openSimulationModal} title="Simulate Crisis Drill">
                        <Sparkles size={12} />
                        <span>Simulate Crisis</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
