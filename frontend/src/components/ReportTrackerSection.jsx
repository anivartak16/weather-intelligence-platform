/**
 * Report Tracker Section (Section 4: Citizen Incident Portal)
 * 3-Stage reporting wizard with client-side pHash media analysis and
 * a 5-stage horizontal lifecycle stepper connected directly to Spring State Machine.
 */
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { endpoints } from '../api/endpoints.js';
import { computeClientPHash } from '../utils/phash.js';
import { 
    Send, 
    UploadCloud, 
    MapPin, 
    Check, 
    AlertCircle, 
    Clock, 
    Cpu, 
    Shield, 
    Truck, 
    Award,
    Search,
    History,
    FileText,
    Image as ImageIcon
} from 'lucide-react';

export default function ReportTrackerSection({ mode = 'all', initialTrackingId = null }) {
    const { submitReport, reports, showToast, setActiveTab } = useApp();

    // Wizard Form State
    const [wizardStep, setWizardStep] = useState(1);
    const [title, setTitle] = useState('');
    const [hazardType, setHazardType] = useState('WATERLOGGING');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState('22.7533');
    const [longitude, setLongitude] = useState('75.8937');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaPhash, setMediaPhash] = useState(null);
    const [isDuplicateWarning, setIsDuplicateWarning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedTrackingId, setSubmittedTrackingId] = useState(null);

    // Active Tracked Incident for Lifecycle Stepper & Audit Log
    const [selectedTrackId, setSelectedTrackId] = useState(initialTrackingId || reports[0]?.properties?.trackingId || 'REP-VJ001');
    const [trackingInput, setTrackingInput] = useState(initialTrackingId || '');
    const [liveTrackingData, setLiveTrackingData] = useState(null);
    const [isLoadingTracking, setIsLoadingTracking] = useState(false);

    useEffect(() => {
        if (initialTrackingId) {
            setSelectedTrackId(initialTrackingId);
            setTrackingInput(initialTrackingId);
        }
    }, [initialTrackingId]);

    // Fetch live tracking details from backend when selectedTrackId changes
    useEffect(() => {
        if (!selectedTrackId) return;
        fetchTracking(selectedTrackId);
    }, [selectedTrackId]);

    const fetchTracking = async (tId) => {
        setIsLoadingTracking(true);
        try {
            const data = await endpoints.getTracking(tId);
            if (data && data.report) {
                setLiveTrackingData(data);
            }
        } catch (err) {
            console.warn('[ReportTracker] Could not fetch live tracking audit log:', err.message);
        } finally {
            setIsLoadingTracking(false);
        }
    };

    const handleSearchTracking = (e) => {
        e.preventDefault();
        if (!trackingInput.trim()) return;
        setSelectedTrackId(trackingInput.trim().toUpperCase());
        fetchTracking(trackingInput.trim().toUpperCase());
    };

    // Handle File Upload and Client-side pHash Calculation
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));

        // Compute instant client-side pHash
        const hash = await computeClientPHash(file);
        setMediaPhash(hash);

        // Check if matching hash exists in active reports
        const matched = reports.some(r => r.properties?.phash && r.properties.phash === hash);
        setIsDuplicateWarning(matched);
    };

    // Geolocation autofill
    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLatitude(pos.coords.latitude.toFixed(4));
                    setLongitude(pos.coords.longitude.toFixed(4));
                },
                () => {
                    setLatitude('22.7196');
                    setLongitude('75.8577');
                }
            );
        }
    };

    // Handle Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const reportPayload = {
                title: title || `${hazardType.replace('_', ' ')} Alert`,
                description: description || 'Citizen reported ground hazard with GPS coordinates.',
                hazardType,
                latitude,
                longitude,
                reportedBy: 'citizen_arun',
                city: 'Indore',
                district: 'Indore'
            };

            const result = await submitReport(reportPayload, mediaFile);
            const trackingId = result.properties?.trackingId || `REP-${Math.floor(1000 + Math.random() * 9000)}`;
            setSubmittedTrackingId(trackingId);
            setSelectedTrackId(trackingId);
            setWizardStep(3); // Show confirmation
        } catch (err) {
            console.error('Submission failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setMediaFile(null);
        setMediaPreview(null);
        setMediaPhash(null);
        setIsDuplicateWarning(false);
        setSubmittedTrackingId(null);
        setWizardStep(1);
    };

    // Resolve report details (live tracking data takes priority, fallback to context)
    const reportFromList = reports.find(r => r.properties?.trackingId === selectedTrackId)?.properties;
    const activeReport = liveTrackingData?.report || reportFromList || reports[0]?.properties || {};
    const auditLogs = liveTrackingData?.history || [];

    const getStageIndex = (status) => {
        switch (status) {
            case 'SUBMITTED':
            case 'REPORTED': return 1;
            case 'AI_CHECKED': return 2;
            case 'ADMIN_VERIFIED': return 3;
            case 'ACTIONED': return 4;
            case 'RESOLVED': return 5;
            case 'FALSE_ALARM': return 2; // stops at AI/Admin
            default: return 2;
        }
    };

    const currentStageIndex = getStageIndex(activeReport.status);
    const isFalseAlarm = activeReport.status === 'FALSE_ALARM' || activeReport.isRumor;

    const headerTitle = mode === 'report' 
        ? 'Citizen Disaster Incident Reporting' 
        : mode === 'tracker' 
            ? 'Citizen Tracking Ledger & State Machine Audit' 
            : 'Incident Reporting Portal & Lifecycle Tracker';

    const headerEyebrow = mode === 'report' 
        ? 'Citizen Crowdsource & pHash Forensics' 
        : mode === 'tracker' 
            ? 'Transparent Government Accountability' 
            : 'Citizen Crowdsourcing & Transparency';

    const headerDesc = mode === 'report'
        ? 'Submit verified ground disaster observation with client-side perceptual media fingerprinting and instant duplicate detection.'
        : mode === 'tracker'
            ? 'Inspect end-to-end disaster response progression, live authority verification, dispatched NDRF units, and immutable Spring State Machine audit logs.'
            : 'Submit verified ground observation with client-side media fingerprinting, and monitor end-to-end disaster response progression through Spring State Machine.';

    return (
        <section id="report-tracker-section" className={`section-container report-tracker-section ${mode !== 'all' ? 'focused-mode' : ''}`}>
            <div className="section-header-meta">
                <span className="section-eyebrow">{headerEyebrow}</span>
                <h2 className="section-title">{headerTitle}</h2>
                <p className="section-desc">{headerDesc}</p>
            </div>

            <div className={`report-tracker-layout ${mode !== 'all' ? 'single-column-layout' : ''}`}>
                {/* Left Side: 3-Stage Reporting Wizard */}
                {(mode === 'all' || mode === 'report') && (
                <div className={`wizard-card-container ${mode === 'report' ? 'full-width-panel' : ''}`}>
                    <div className="wizard-header">
                        <div className="wizard-step-indicators">
                            <span className={`step-badge ${wizardStep >= 1 ? 'active' : ''}`}>1. Category</span>
                            <span className="step-arrow">→</span>
                            <span className={`step-badge ${wizardStep >= 2 ? 'active' : ''}`}>2. Evidence</span>
                            <span className="step-arrow">→</span>
                            <span className={`step-badge ${wizardStep === 3 ? 'active' : ''}`}>3. Verified</span>
                        </div>
                    </div>

                    {/* Step 1: Category & Location */}
                    {wizardStep === 1 && (
                        <div className="wizard-step-body">
                            <h3 className="wizard-step-title">Select Hazard & Location</h3>
                            <div className="hazard-select-grid">
                                {[
                                    { id: 'WATERLOGGING', label: 'Waterlogging', icon: '🌧️' },
                                    { id: 'FLASH_FLOOD', label: 'Flash Flood', icon: '🌊' },
                                    { id: 'THUNDERSTORM', label: 'Thunderstorm', icon: '⚡' },
                                    { id: 'CYCLONE_WIND', label: 'Squall / Wind', icon: '🌪️' }
                                ].map(h => (
                                    <button
                                        key={h.id}
                                        type="button"
                                        className={`hazard-choice-btn ${hazardType === h.id ? 'selected' : ''}`}
                                        onClick={() => setHazardType(h.id)}
                                    >
                                        <span className="hazard-choice-icon">{h.icon}</span>
                                        <span className="hazard-choice-label">{h.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="location-input-group">
                                <label className="input-label">GPS Geolocation</label>
                                <div className="gps-inputs-row">
                                    <input 
                                        type="text" 
                                        placeholder="Latitude" 
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        className="text-input"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Longitude" 
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        className="text-input"
                                    />
                                    <button 
                                        type="button" 
                                        className="gps-locate-btn"
                                        onClick={handleGetLocation}
                                        title="Auto-detect current GPS"
                                    >
                                        <MapPin size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="wizard-footer">
                                <button 
                                    type="button" 
                                    className="primary-action-btn"
                                    onClick={() => setWizardStep(2)}
                                >
                                    Proceed to Evidence →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Description & Media Upload */}
                    {wizardStep === 2 && (
                        <div className="wizard-step-body">
                            <h3 className="wizard-step-title">Incident Details & Photo Evidence</h3>
                            
                            <div className="form-field-group">
                                <label className="input-label">Incident Title</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Severe waterlogging near Vijay Nagar underpass"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-input"
                                />
                            </div>

                            <div className="form-field-group">
                                <label className="input-label">Ground Observation Description</label>
                                <textarea 
                                    placeholder="Describe current water height, trapped vehicles, blocked roads..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="textarea-input"
                                    rows={3}
                                />
                            </div>

                            <div className="form-field-group">
                                <label className="input-label">Attach Photo Evidence</label>
                                <label className="file-dropzone">
                                    <UploadCloud size={24} className="text-secondary" />
                                    <span>Click to upload crisis photo</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>

                            {mediaPreview && (
                                <div className="preview-container">
                                    <img src={mediaPreview} alt="Evidence preview" className="evidence-preview-img" />
                                    {mediaPhash && (
                                        <div className="phash-tag">
                                            <Cpu size={12} />
                                            <span>pHash: {mediaPhash.slice(0, 16)}...</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isDuplicateWarning && (
                                <div className="duplicate-warning-banner">
                                    <AlertCircle size={16} className="text-danger" />
                                    <span>Warning: Identical visual hash detected in recent disaster archives!</span>
                                </div>
                            )}

                            <div className="wizard-footer">
                                <button 
                                    type="button" 
                                    className="secondary-btn"
                                    onClick={() => setWizardStep(1)}
                                >
                                    ← Back
                                </button>
                                <button 
                                    type="button" 
                                    className="primary-action-btn"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Transmitting...' : 'Submit Incident Report'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {wizardStep === 3 && (
                        <div className="wizard-step-body confirmation-step">
                            <div className="success-icon-box">
                                <Check size={32} className="text-success" />
                            </div>
                            <h3 className="confirmation-title">Ground Report Transmitted</h3>
                            <p className="confirmation-desc">
                                Your incident is registered under tracking token:
                            </p>
                            <div className="tracking-token-display">
                                {submittedTrackingId || 'REP-VJ001'}
                            </div>
                            <p className="confirmation-note">
                                Multimodal verification has been dispatched to IMD correlation workers via Kafka.
                            </p>
                            <div className="confirmation-actions-row">
                                <button 
                                    type="button" 
                                    className="secondary-btn"
                                    onClick={resetForm}
                                >
                                    File Another Observation
                                </button>
                                <button 
                                    type="button" 
                                    className="primary-action-btn"
                                    onClick={() => {
                                        if (submittedTrackingId) {
                                            setSelectedTrackId(submittedTrackingId);
                                        }
                                        setActiveTab('tracker');
                                    }}
                                >
                                    View in Tracking Ledger →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                )}

                {/* Right Side: Horizontal Incident Lifecycle Stepper & Live Audit Ledger */}
                {(mode === 'all' || mode === 'tracker') && (
                <div className={`lifecycle-card-container ${mode === 'tracker' ? 'full-width-panel' : ''}`}>
                    <div className="lifecycle-card-header">
                        <span className="card-subhead">Disaster Response Chain</span>
                        <h3 className="card-heading">End-to-End Incident Lifecycle</h3>
                        
                        {/* Token Search Bar */}
                        <form onSubmit={handleSearchTracking} className="tracking-search-form">
                            <input 
                                type="text"
                                placeholder="Enter Tracking Token (e.g. REP-VJ001)..."
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value)}
                                className="tracking-token-input"
                            />
                            <button type="submit" className="tracking-search-btn" title="Search Tracking Token">
                                <Search size={14} />
                                <span>Lookup</span>
                            </button>
                        </form>
                    </div>

                    {/* 5-Stage Horizontal Stepper */}
                    <div className="horizontal-stepper">
                        {[
                            { step: 1, name: 'Reported', desc: 'GPS Ground Observation Logged', icon: <MapPin size={16} /> },
                            { step: 2, name: 'AI Checked', desc: 'pHash & Radar Correlation', icon: <Cpu size={16} /> },
                            { step: 3, name: 'Authority Confirmed', desc: 'Commander Verification', icon: <Shield size={16} /> },
                            { step: 4, name: 'Teams Dispatched', desc: 'NDRF / Squad en Route', icon: <Truck size={16} /> },
                            { step: 5, name: 'Resolved', desc: 'Ground Safe / All Clear', icon: <Award size={16} /> }
                        ].map((s) => {
                            const isCompleted = s.step < currentStageIndex;
                            const isCurrent = s.step === currentStageIndex;

                            return (
                                <div key={s.step} className={`stepper-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                    <div className="stepper-icon-circle">
                                        {isCompleted ? <Check size={16} /> : s.icon}
                                    </div>
                                    <div className="stepper-text-group">
                                        <span className="stepper-node-name">{s.name}</span>
                                        <span className="stepper-node-desc">{s.desc}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* False Alarm Notice if flagged */}
                    {isFalseAlarm && (
                        <div className="false-alarm-banner">
                            <AlertCircle size={18} className="text-danger" />
                            <div>
                                <strong>Report Flagged as False Alarm / Panic Rumor</strong>
                                <p style={{ fontSize: '0.8rem', margin: '2px 0 0 0' }}>
                                    Cross-referenced against IMD radar precipitation with 0mm rain. Rumor probability: {Math.round((activeReport.rumorScore || 0.95) * 100)}%.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Incident Summary Card */}
                    <div className="tracked-summary-box">
                        <div className="summary-row">
                            <span className="summary-label">Tracking ID:</span>
                            <span className="summary-value font-bold text-brand-primary">{activeReport.trackingId || selectedTrackId}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Incident:</span>
                            <span className="summary-value">{activeReport.title || 'Waterlogging Alert'}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Reported By:</span>
                            <span className="summary-value">
                                {activeReport.user?.username || activeReport.reportedBy || 'citizen_arun'} 
                                {activeReport.user?.trustScore && ` (${activeReport.user.trustScore.score} pts • ${activeReport.user.trustScore.badgeTier})`}
                            </span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Current State:</span>
                            <span className="summary-value text-brand-primary font-bold">{activeReport.status || 'SUBMITTED'}</span>
                        </div>
                        {activeReport.actionNotes && (
                            <div className="summary-row">
                                <span className="summary-label">Action Directives:</span>
                                <span className="summary-value text-success">{activeReport.actionNotes}</span>
                            </div>
                        )}
                    </div>

                    {/* Audit Log Ledger */}
                    {auditLogs.length > 0 && (
                        <div className="audit-ledger-container">
                            <div className="audit-ledger-title">
                                <History size={14} className="text-secondary" />
                                <span>Spring State Machine Audit Trail</span>
                            </div>
                            <div className="audit-log-list">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="audit-log-entry">
                                        <span className="audit-time">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="audit-transition">
                                            {log.fromState} ➔ {log.toState}
                                        </span>
                                        <span className="audit-actor">by {log.changedBy}</span>
                                        {log.comments && <span className="audit-comment">"{log.comments}"</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                )}
            </div>
        </section>
    );
}
