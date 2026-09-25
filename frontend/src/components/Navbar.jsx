/**
 * Navbar Component
 * Authentic Government of India Disaster Operations Console Navigation Header
 * Clear, uncluttered 7-module structure with high-contrast active states.
 */
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { 
    Shield, 
    Home, 
    LayoutDashboard,
    Map, 
    Radio, 
    Send, 
    FileText, 
    Bell,
    Volume2, 
    VolumeX, 
    Sun, 
    Moon, 
    User, 
    Sparkles,
    PhoneCall,
    Share2
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

    // Core Government Console Modules
    const navItems = [
        { path: '/', label: 'Overview', icon: Home, end: true },
        { path: '/dashboard', label: 'Operations Command', icon: LayoutDashboard },
        { path: '/map', label: 'GIS Radar Map', icon: Map },
        { path: '/incidents', label: 'Incident Desk', icon: Radio, count: reports.length, alert: criticalCount > 0 },
        { path: '/social', label: 'Social Media', icon: Share2 },
        { path: '/citizen', label: 'Citizen Services', icon: Send },
        { path: '/sitrep', label: 'Tactical SITREP', icon: FileText },
        { path: '/alerts', label: 'National Alerts', icon: Bell }
    ];

    return (
        <header className="navbar-header-sticky">
            <div className="navbar-container">
                {/* Brand Identity */}
                <Link 
                    to="/" 
                    className="navbar-brand-group" 
                    title="National Weather Intelligence & Ground Truth System"
                >
                    <div className="brand-logo-icon">
                        <Shield size={22} className="text-brand-primary" />
                    </div>
                    <div>
                        <div className="brand-title-row">
                            <span className="brand-title">सुरक्षा-NET</span>
                            <span className="brand-title-sub">SURAKSHA-NET</span>
                            <span className="brand-live-badge">
                                <span className="pulse-dot"></span>
                                ACTIVE
                            </span>
                        </div>
                        <span className="brand-subtitle">
                            National Disaster Operations Console • Ministry of Earth Sciences & IMD
                        </span>
                    </div>
                </Link>

                {/* Primary Console Navigation */}
                <nav className="navbar-primary-nav" aria-label="Government Console Navigation">
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

                {/* Right Operational Controls */}
                <div className="navbar-controls-group">
                    {/* Role Switcher Pill */}
                    <div className="role-switch-container">
                        <button 
                            className={`role-switch-btn ${!isOps ? 'active' : ''}`}
                            onClick={() => !isOps || toggleRole()}
                            title="Switch to Citizen View"
                        >
                            <User size={13} />
                            <span>Citizen</span>
                        </button>
                        <button 
                            className={`role-switch-btn ${isOps ? 'active' : ''}`}
                            onClick={() => isOps || toggleRole()}
                            title="Switch to Commander View"
                        >
                            <Shield size={13} />
                            <span>Commander</span>
                        </button>
                    </div>

                    {/* Simulation Drill Launcher */}
                    <button 
                        className="control-icon-btn simulation-btn"
                        onClick={openSimulationModal}
                        title="Simulate Crisis Drill (Flash Flood / Cyclone)"
                    >
                        <Sparkles size={14} />
                        <span className="control-btn-label">Drill</span>
                    </button>

                    {/* Audio Alert Bell */}
                    <button 
                        className="control-icon-btn"
                        onClick={toggleSound}
                        title={soundEnabled ? "Mute audio alerts" : "Enable audio alerts"}
                    >
                        {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                    </button>

                    {/* Theme Mode Toggle */}
                    <button 
                        className="control-icon-btn"
                        onClick={toggleTheme}
                        title={theme === 'light' ? "Switch to Dark Console" : "Switch to Light Console"}
                    >
                        {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                    </button>
                </div>
            </div>
        </header>
    );
}
