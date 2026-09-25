/**
 * Incident Feed Section (Section 3: Verified Ground Truth Stream)
 * De-cluttered 2-column card layout with AI rumor forensics and instant action triggers.
 * Includes Multi-Parameter Filters (Date, Event, Verification Status, Location) per PS 69.
 */
import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
    formatDate, 
    formatRelativeTime, 
    getSeverityStyle, 
    getStatusStyle, 
    getHazardMeta,
    getBadgeDetails 
} from '../utils/formatters.js';
import { 
    Search, 
    Filter, 
    MapPin, 
    ShieldCheck, 
    AlertCircle, 
    Navigation, 
    Cpu, 
    CheckCircle, 
    XCircle,
    CopyCheck,
    Calendar,
    SlidersHorizontal
} from 'lucide-react';

export default function IncidentFeedSection({ hideHeader = false }) {
    const { 
        reports, 
        activeRole, 
        focusIncidentOnMap, 
        openForensics, 
        openActionModal,
        verifyReport 
    } = useApp();

    const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'VERIFIED' | 'CRITICAL' | 'RUMORS'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHazard, setSelectedHazard] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedDateFilter, setSelectedDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'WEEK'

    const filteredReports = reports.filter(item => {
        const p = item.properties || {};

        // Keyword search
        const matchesSearch = 
            (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.hazardType || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Quick Tabs
        if (activeTab === 'VERIFIED' && p.status !== 'ADMIN_VERIFIED' && p.status !== 'ACTIONED') return false;
        if (activeTab === 'CRITICAL' && p.severity !== 'CRITICAL') return false;
        if (activeTab === 'RUMORS' && !p.isRumor && p.status !== 'FALSE_ALARM' && (!p.rumorScore || p.rumorScore <= 0.6)) return false;

        // Hazard Type Filter
        if (selectedHazard !== 'ALL' && p.hazardType !== selectedHazard) return false;

        // Status Filter
        if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;

        // Date Filter
        if (selectedDateFilter !== 'ALL' && p.createdAt) {
            const reportDate = new Date(p.createdAt);
            const now = new Date();
            const diffHours = (now - reportDate) / (1000 * 60 * 60);

            if (selectedDateFilter === 'TODAY' && diffHours > 24) return false;
            if (selectedDateFilter === 'WEEK' && diffHours > 168) return false;
        }

        return true;
    });

    return (
        <section id="incident-feed-section" className={`section-container incident-feed-section ${hideHeader ? 'header-suppressed' : ''}`}>
            {!hideHeader && (
                <div className="section-header-meta">
                    <span className="section-eyebrow">Crowdsourced Ground Observation</span>
                    <h2 className="section-title">Verified Ground-Truth Incident Stream</h2>
                    <p className="section-desc">
                        Real-time field reports synthesized with automated pHash image deduplication, LLM sentiment audit, and commander verification.
                    </p>
                </div>
            )}

            {/* Quick Tabs & Search */}
            <div className="feed-toolbar-container">
                <div className="feed-tabs">
                    <button 
                        className={`feed-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ALL')}
                    >
                        All Feeds ({reports.length})
                    </button>
                    <button 
                        className={`feed-tab-btn ${activeTab === 'VERIFIED' ? 'active' : ''}`}
                        onClick={() => setActiveTab('VERIFIED')}
                    >
                        Verified Ground Truth
                    </button>
                    <button 
                        className={`feed-tab-btn ${activeTab === 'CRITICAL' ? 'active' : ''}`}
                        onClick={() => setActiveTab('CRITICAL')}
                    >
                        Critical Urgency
                    </button>
                    <button 
                        className={`feed-tab-btn ${activeTab === 'RUMORS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('RUMORS')}
                    >
                        Debunked Rumors
                    </button>
                </div>

                <div className="feed-search-box">
                    <Search size={16} className="search-icon" />
                    <input 
                        type="text"
                        placeholder="Filter by keyword, locality, or district..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="feed-search-input"
                    />
                </div>
            </div>

            {/* Multi-Parameter Filters Bar (Per PS 69 Requirements) */}
            <div className="multi-filter-bar">
                <div className="filter-item-select">
                    <label className="filter-label">Hazard Event:</label>
                    <select 
                        value={selectedHazard} 
                        onChange={(e) => setSelectedHazard(e.target.value)}
                        className="filter-select-input"
                    >
                        <option value="ALL">All Hazard Events</option>
                        <option value="FLASH_FLOOD">🌊 Flash Flood</option>
                        <option value="WATERLOGGING">🌧️ Waterlogging</option>
                        <option value="THUNDERSTORM">⚡ Thunderstorm</option>
                        <option value="CYCLONE_WIND">💨 Cyclone / Squall Wind</option>
                        <option value="HEATWAVE">☀️ Severe Heatwave</option>
                        <option value="FOG">🌫️ Dense Fog</option>
                        <option value="LANDSLIDE">⛰️ Landslide</option>
                    </select>
                </div>

                <div className="filter-item-select">
                    <label className="filter-label">Lifecycle Status:</label>
                    <select 
                        value={selectedStatus} 
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="filter-select-input"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="SUBMITTED">Pending AI Check</option>
                        <option value="AI_CHECKED">AI Evaluated</option>
                        <option value="ADMIN_VERIFIED">Admin Verified</option>
                        <option value="ACTIONED">Disaster Squad Actioned</option>
                        <option value="FALSE_ALARM">False Alarm / Purged</option>
                    </select>
                </div>

                <div className="filter-item-select">
                    <label className="filter-label">Time Window:</label>
                    <select 
                        value={selectedDateFilter} 
                        onChange={(e) => setSelectedDateFilter(e.target.value)}
                        className="filter-select-input"
                    >
                        <option value="ALL">All Time</option>
                        <option value="TODAY">Past 24 Hours</option>
                        <option value="WEEK">Past 7 Days</option>
                    </select>
                </div>

                {(selectedHazard !== 'ALL' || selectedStatus !== 'ALL' || selectedDateFilter !== 'ALL' || searchTerm) && (
                    <button 
                        className="reset-filters-btn"
                        onClick={() => {
                            setSelectedHazard('ALL');
                            setSelectedStatus('ALL');
                            setSelectedDateFilter('ALL');
                            setSearchTerm('');
                        }}
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            {/* 2-Column De-cluttered Card Grid */}
            <div className="feed-cards-grid">
                {filteredReports.map((feature) => {
                    const p = feature.properties || {};
                    const sevStyle = getSeverityStyle(p.severity);
                    const statStyle = getStatusStyle(p.status);
                    const hazardMeta = getHazardMeta(p.hazardType);
                    const badgeMeta = getBadgeDetails(p.reporterBadge);

                    const isRumor = p.isRumor || p.rumorScore > 0.6;

                    return (
                        <div key={p.id || Math.random()} className={`incident-card ${isRumor ? 'card-rumor' : ''}`}>
                            {/* Card Top Row: Badges & ID */}
                            <div className="card-top-row">
                                <div className="card-badge-group">
                                    <span className="hazard-pill" style={{ borderColor: hazardMeta.color }}>
                                        <span>{hazardMeta.icon}</span>
                                        <span>{hazardMeta.label}</span>
                                    </span>
                                    <span className="severity-pill" style={{ backgroundColor: sevStyle.bg, color: sevStyle.text }}>
                                        {sevStyle.label}
                                    </span>
                                    <span className="status-pill" style={{ backgroundColor: statStyle.bg, color: statStyle.text }}>
                                        {statStyle.label}
                                    </span>
                                </div>
                                <span className="tracking-id-text">{p.trackingId || `REP-${p.id}`}</span>
                            </div>

                            {/* Card Title & Content */}
                            <h3 className="card-title">{p.title}</h3>
                            <p className="card-description">{p.description}</p>

                            {/* Duplicate Image Warning if detected */}
                            {p.duplicateFlag && (
                                <div className="duplicate-alert-banner">
                                    <CopyCheck size={14} className="text-warning" />
                                    <span>Recycled crisis image detected via pHash matching</span>
                                </div>
                            )}

                            {/* AI Verification & Sentinel Trust Bar */}
                            <div className="card-trust-metadata">
                                <div className="metadata-item">
                                    <span className="metadata-label">Reporter</span>
                                    <div className="reporter-chip">
                                        <span>{badgeMeta.icon}</span>
                                        <span className="reporter-name">{p.reportedBy || 'citizen_scout'}</span>
                                        <span className="trust-score">({p.reporterTrustScore || 85} pts)</span>
                                    </div>
                                </div>

                                <div className="metadata-item">
                                    <span className="metadata-label">AI Rumor Risk</span>
                                    <div className="rumor-meter-wrapper">
                                        <div 
                                            className="rumor-meter-fill"
                                            style={{ 
                                                width: `${Math.round((p.rumorScore || 0.05) * 100)}%`,
                                                backgroundColor: isRumor ? '#FA383E' : '#31A24C'
                                            }}
                                        />
                                        <span className="rumor-percentage">
                                            {Math.round((p.rumorScore || 0.05) * 100)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="metadata-item">
                                    <span className="metadata-label">Time</span>
                                    <span className="metadata-value">{formatRelativeTime(p.createdAt)}</span>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="card-action-bar">
                                <button 
                                    className="card-btn btn-focus-map"
                                    onClick={() => focusIncidentOnMap(feature)}
                                >
                                    <Navigation size={14} />
                                    <span>Focus Map</span>
                                </button>

                                <button 
                                    className="card-btn btn-forensics"
                                    onClick={() => openForensics(feature)}
                                >
                                    <Cpu size={14} />
                                    <span>AI Forensics</span>
                                </button>

                                {activeRole === 'OPS_DISPATCHER' && (
                                    <>
                                        <button 
                                            className="card-btn btn-dispatch"
                                            onClick={() => openActionModal(feature)}
                                        >
                                            Dispatch Squad
                                        </button>

                                        {p.status !== 'ADMIN_VERIFIED' && !isRumor && (
                                            <button 
                                                className="card-btn btn-verify-quick"
                                                onClick={() => verifyReport(p.id, true)}
                                                title="Confirm Ground Truth"
                                            >
                                                <CheckCircle size={14} />
                                            </button>
                                        )}

                                        {!isRumor && (
                                            <button 
                                                className="card-btn btn-flag-quick"
                                                onClick={() => verifyReport(p.id, false)}
                                                title="Flag as False Alarm"
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filteredReports.length === 0 && (
                    <div className="empty-feed-placeholder">
                        <AlertCircle size={32} className="text-secondary" />
                        <p>No incidents match the active multi-parameter filters.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
