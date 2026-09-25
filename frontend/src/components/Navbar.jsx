/**
 * Navbar Component
 * KrishiLink-inspired National Navigation Header with react-router-dom NavLinks,
 * role switcher, active live badges, audio alerts, and theme toggle.
 */
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { 
    Shield, 
    Home, 
    LayoutDashboard,
    Map, 
    Radio, 
    Send, 
    Fingerprint, 
    Share2, 
    FileText, 
    Award, 
    Bell,
    Volume2, 
    VolumeX, 
    Sun, 
    Moon, 
    User, 
    PhoneCall, 
    Sparkles 
} from 'lucide-react';

export default function Navbar() {
    const { 
        activeRole, 
        toggleRole, 
        theme, 
        toggleTheme, 
        soundEnabled, 
        toggleSound, 
        reports, 
        openSimulationModal
    } = useApp();

    const isOps = activeRole === 'OPS_DISPATCHER';
    const criticalCount = reports.filter(r => r.properties?.severity === 'CRITICAL').length;

    const navItems = [
        { path: '/', label: 'National Portal', icon: Home, end: true },
        { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
        { path: '/map', label: 'GIS Radar Map', icon: Map },
        { path: '/incidents', label: 'Incident Desk', icon: Radio, count: reports.length, alert: criticalCount > 0 },
        { path: '/report', label: 'Report Disaster', icon: Send },
        { path: '/track', label: 'Tracking Ledger', icon: Fingerprint },
        { path: '/social', label: '#IMD Social Hub', icon: Share2 },
        { path: '/sitrep', label: 'Tactical SITREP', icon: FileText },
        { path: '/sentinels', label: 'Civic Sentinels', icon: Award },
        { path: '/alerts', label: 'Alerts', icon: Bell }
    ];

    return (
        <header className="navbar-header-sticky">
            <div className="navbar-container">
                {/* Brand & Authority */}
                <Link 
                    to="/" 
                    className="navbar-brand-group" 
                    title="National Weather Intelligence & Ground Truth System"
                >
                    <div className="brand-logo-icon">
                        <Shield size={24} className="text-brand-primary" />
                        <span className="logo-radar-ring"></span>
                    </div>
                    <div>
                        <div className="brand-title-row">
                            <span className="brand-title">सुरक्षा-नेट</span>
                            <span className="brand-title-sub">SURAKSHA-NET</span>
                            <span className="brand-live-badge">
                                <span className="pulse-dot"></span>
                                LIVE
                            </span>
                        </div>
                        <span className="brand-subtitle">
                            National Weather Intelligence & Ground Truth System
                        </span>
                    </div>
                </Link>

                {/* Primary Navigation Links with real URLs */}
                <nav className="navbar-primary-nav" aria-label="Portal Navigation">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={15} className="nav-item-icon" />
                                <span>{item.label}</span>
                                {item.count !== undefined && (
                                    <span className={`nav-count-badge ${item.alert ? 'alert' : ''}`}>
                                        {item.count}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Right Utility Controls */}
                <div className="navbar-controls-group">
                    {/* Role Switcher Pill */}
                    <div className="role-switch-container">
                        <button 
                            className={`role-switch-btn ${!isOps ? 'active' : ''}`}
                            onClick={() => !isOps || toggleRole()}
                            title="Switch to Citizen Scout View"
                        >
                            <User size={13} />
                            <span>Citizen</span>
                        </button>
                        <button 
                            className={`role-switch-btn ${isOps ? 'active' : ''}`}
                            onClick={() => isOps || toggleRole()}
                            title="Switch to DEOC Commander View"
                        >
                            <Shield size={13} />
                            <span>Commander</span>
                        </button>
                    </div>

                    {/* Simulation Button */}
                    <button 
                        className="control-icon-btn simulation-btn"
                        onClick={openSimulationModal}
                        title="Execute Crisis Scenario Drill"
                    >
                        <Sparkles size={15} />
                    </button>

                    {/* Audio Alert Siren */}
                    <button 
                        className="control-icon-btn"
                        onClick={toggleSound}
                        title={soundEnabled ? "Mute audio sirens" : "Enable audio sirens"}
                    >
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>

                    {/* Theme Mode Toggle */}
                    <button 
                        className="control-icon-btn"
                        onClick={toggleTheme}
                        title={theme === 'light' ? "Switch to Command Dark Mode" : "Switch to Daylight Mode"}
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>

                    {/* Emergency 112 SOS Button */}
                    <a 
                        href="tel:112" 
                        className="nav-emergency-sos-btn"
                        title="Emergency Rescue: Dial 112"
                    >
                        <PhoneCall size={13} />
                        <span>112 SOS</span>
                    </a>
                </div>
            </div>
        </header>
    );
}
