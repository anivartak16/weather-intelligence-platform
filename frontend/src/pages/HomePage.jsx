/**
 * HomePage Component - Overview & National Portal Hero
 */
import React from 'react';
import HeroSection from '../components/HeroSection.jsx';
import GisMapSection from '../components/GisMapSection.jsx';
import IncidentFeedSection from '../components/IncidentFeedSection.jsx';

export default function HomePage() {
    return (
        <div className="gov-console-page animate-fade-in">
            <HeroSection />
            <GisMapSection />
            <IncidentFeedSection />
        </div>
    );
}
