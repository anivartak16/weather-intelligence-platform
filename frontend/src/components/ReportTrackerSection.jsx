/**
 * Report Tracker Section (Section 4: Citizen Incident Portal)
 * 3-Stage reporting wizard with client-side pHash media analysis and
 * a 5-stage horizontal lifecycle stepper connected directly to Spring State Machine.
 */
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext.jsx';
import { endpoints } from '../api/endpoints.js';
import { computeClientPHash } from '../utils/phash.js';
import { createIncidentMarker, createShelterMarker } from '../utils/leafletIcons.js';
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
    Image as ImageIcon,
    Compass
} from 'lucide-react';

export default function ReportTrackerSection({ mode = 'all', initialTrackingId = null, hideHeader = false }) {
    const { submitReport, reports, shelters, showToast, setActiveTab } = useApp();

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

    // Leaflet Interactive Location Picker (Step 1)
    const pickerMapRef = useRef(null);
    const pickerMapInstanceRef = useRef(null);
    const pickerMarkerRef = useRef(null);

    // Leaflet Interactive Incident Tracker Map
    const trackerMapRef = useRef(null);
    const trackerMapInstanceRef = useRef(null);
    const trackerLayersRef = useRef(null);

    // Initialize/Update Location Picker Map when on Step 1
    useEffect(() => {
        if (wizardStep !== 1 || !pickerMapRef.current) return;
        
        const lat = parseFloat(latitude) || 22.7533;
        const lng = parseFloat(longitude) || 75.8937;

        if (!pickerMapInstanceRef.current) {
            const map = L.map(pickerMapRef.current, {
                center: [lat, lng],
                zoom: 14,
                zoomControl: false,
                attributionControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: 'abc'
            }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            marker.bindTooltip('📍 Drag pin or click map to locate incident', { permanent: true, direction: 'top' });

            marker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                setLatitude(pos.lat.toFixed(4));
                setLongitude(pos.lng.toFixed(4));
            });

            map.on('click', (e) => {
                marker.setLatLng(e.latlng);
                setLatitude(e.latlng.lat.toFixed(4));
                setLongitude(e.latlng.lng.toFixed(4));
            });

            pickerMapInstanceRef.current = map;
            pickerMarkerRef.current = marker;
        } else {
            pickerMapInstanceRef.current.invalidateSize();
            if (pickerMarkerRef.current) {
                pickerMarkerRef.current.setLatLng([lat, lng]);
            }
        }

        return () => {
            if (wizardStep !== 1 && pickerMapInstanceRef.current) {
                pickerMapInstanceRef.current.remove();
                pickerMapInstanceRef.current = null;
                pickerMarkerRef.current = null;
            }
        };
    }, [wizardStep]);

    // Sync input coordinates to map marker
    useEffect(() => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng) && pickerMarkerRef.current && pickerMapInstanceRef.current) {
            pickerMarkerRef.current.setLatLng([lat, lng]);
            pickerMapInstanceRef.current.panTo([lat, lng]);
        }
    }, [latitude, longitude]);

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

    // Leaflet Interactive Incident Tracker Map
    useEffect(() => {
        if (!trackerMapRef.current) return;

        const repLat = parseFloat(activeReport.latitude || activeReport.lat) || 22.7533;
        const repLng = parseFloat(activeReport.longitude || activeReport.lng) || 75.8937;

        if (!trackerMapInstanceRef.current) {
            const map = L.map(trackerMapRef.current, {
                center: [repLat, repLng],
                zoom: 14,
                zoomControl: false,
                attributionControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: 'abc'
            }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);
            const layersGroup = L.layerGroup().addTo(map);

            trackerMapInstanceRef.current = map;
            trackerLayersRef.current = layersGroup;
        }

        const map = trackerMapInstanceRef.current;
        const group = trackerLayersRef.current;
        if (!map || !group) return;

        group.clearLayers();
        map.setView([repLat, repLng], 14);

        // Add incident marker
        const incidentIcon = L.divIcon({
            className: 'custom-map-pin incident-pin',
            html: `<div style="background:#dc2626; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(220,38,38,0.7); font-size:14px; border:2px solid white;">⚠️</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        const incMarker = L.marker([repLat, repLng], { icon: incidentIcon }).addTo(group);
        incMarker.bindPopup(`
            <div style="font-family:sans-serif; min-width:160px; font-size:12px;">
                <strong style="color:#b91c1c;">${activeReport.title || 'Reported Incident'}</strong><br/>
                <span style="color:#475569;">Token: <b>${activeReport.trackingId || selectedTrackId}</b></span><br/>
                <span style="color:#475569;">Status: <b>${activeReport.status || 'SUBMITTED'}</b></span>
            </div>
        `);

        // Danger radius circle
        L.circle([repLat, repLng], {
            radius: 400,
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4, 4'
        }).addTo(group);

        // Nearest Shelter & corridor
        if (shelters && shelters.length > 0) {
            let nearest = shelters[0];
            let minDist = 999999;
            shelters.forEach(s => {
                const sLat = s.latitude || s.lat || 22.75;
                const sLng = s.longitude || s.lng || 75.89;
                const d = Math.hypot(sLat - repLat, sLng - repLng);
                if (d < minDist) {
                    minDist = d;
                    nearest = s;
                }
            });

            const nLat = nearest.latitude || nearest.lat || 22.76;
            const nLng = nearest.longitude || nearest.lng || 75.90;

            const shelterIcon = L.divIcon({
                className: 'custom-map-pin shelter-pin',
                html: `<div style="background:#16a34a; color:white; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px rgba(22,163,74,0.6); font-size:13px; border:2px solid white;">🛡️</div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });
            const shMarker = L.marker([nLat, nLng], { icon: shelterIcon }).addTo(group);
            shMarker.bindPopup(`
                <div style="font-family:sans-serif; min-width:150px; font-size:12px;">
                    <strong style="color:#15803d;">${nearest.name || 'Emergency Evacuation Shelter'}</strong><br/>
                    <span style="color:#475569;">Safe Distance: ${(minDist * 111).toFixed(1)} km</span>
                </div>
            `);

            // Safe Evacuation corridor polyline
            L.polyline([[repLat, repLng], [nLat, nLng]], {
                color: '#16a34a',
                weight: 3,
                dashArray: '6, 6',
                opacity: 0.85
            }).addTo(group);
        }

        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 150);
    }, [activeReport, selectedTrackId, shelters, mode]);

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
        <section id="report-tracker-section" className={`section-container report-tracker-section ${mode !== 'all' ? 'focused-mode' : ''} ${hideHeader ? 'header-suppressed' : ''}`}>
            {!hideHeader && (
                <div className="section-header-meta">
                    <span className="section-eyebrow">{headerEyebrow}</span>
                    <h2 className="section-title">{headerTitle}</h2>
                    <p className="section-desc">{headerDesc}</p>
                </div>
            )}

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

                            {/* Interactive Leaflet Location Picker (Leaflet API) */}
                            <div className="location-picker-map-box">
                                <div className="picker-map-header">
                                    <span className="picker-map-title">📍 Interactive Pin Placement (Leaflet API)</span>
                                    <span className="picker-map-sub">Click anywhere on the map or drag the pin to set exact coordinates</span>
                                </div>
                                <div ref={pickerMapRef} className="picker-leaflet-canvas" />
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
                    {/* Leaflet Incident Geolocation & Nearest Safe Route (Leaflet API) */}
                    <div className="tracker-map-box">
                        <div className="tracker-map-meta">
                            <span className="tracker-map-title">📍 Live Geospatial Incident Position & Safety Zone (Leaflet API)</span>
                            <span className="tracker-map-coords">
                                {activeReport.latitude && activeReport.longitude 
                                    ? `${parseFloat(activeReport.latitude).toFixed(4)}° N, ${parseFloat(activeReport.longitude).toFixed(4)}° E` 
                                    : 'Indore Command Region'}
                            </span>
                        </div>
                        <div ref={trackerMapRef} className="tracker-leaflet-canvas" />
                    </div>

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
