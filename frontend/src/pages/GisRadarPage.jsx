/**
 * GisRadarPage Component - Dedicated GIS & Doppler Radar View
 */
import React from 'react';
import GisMapSection from '../components/GisMapSection.jsx';

export default function GisRadarPage() {
    return (
        <div className="gov-console-page animate-fade-in">
            <div className="gov-page-header-strip">
                <div>
                    <span className="gov-service-badge">IMD DOPPLER RADAR & GIS TELEMETRY</span>
                    <h1 className="gov-console-title">GIS Spatial Command Radar</h1>
                    <p className="gov-console-desc">
                        Interactive geospatial map displaying weather radar overlays, emergency shelters, and verified hazard markers.
                    </p>
                </div>
            </div>
            <GisMapSection />
        </div>
    );
}
