/**
 * Action Modal Component
 * Tactical emergency dispatch interface for Ops Commanders
 */
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext.jsx';
import { Truck, X, ShieldAlert, CheckCircle, Radio, MapPin } from 'lucide-react';

export default function ActionModal() {
    const { activeModal, modalData, closeModal, dispatchAction } = useApp();

    const [unitType, setUnitType] = useState('NDRF_WATER_RESCUE');
    const [notes, setNotes] = useState('Immediate inflatable boats deployment for waterlogged intersection.');
    const [submitting, setSubmitting] = useState(false);

    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    const p = modalData?.properties || {};
    const lat = parseFloat(p.latitude || (modalData?.geometry?.coordinates ? modalData.geometry.coordinates[1] : 22.7533)) || 22.7533;
    const lng = parseFloat(p.longitude || (modalData?.geometry?.coordinates ? modalData.geometry.coordinates[0] : 75.8937)) || 75.8937;

    useEffect(() => {
        if (activeModal !== 'action' || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [lat, lng],
                zoom: 14,
                zoomControl: false,
                attributionControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: 'abc'
            }).addTo(map);

            const icon = L.divIcon({
                className: 'target-dispatch-pin',
                html: `<div style="background:#dc2626; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(220,38,38,0.8); font-size:13px; border:2px solid white;">🎯</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            L.marker([lat, lng], { icon }).addTo(map);
            L.circle([lat, lng], {
                radius: 400,
                color: '#dc2626',
                fillColor: '#ef4444',
                fillOpacity: 0.2,
                weight: 1.5,
                dashArray: '3, 3'
            }).addTo(map);

            mapInstanceRef.current = map;
        } else {
            mapInstanceRef.current.setView([lat, lng], 14);
            mapInstanceRef.current.invalidateSize();
        }

        const timer = setTimeout(() => {
            if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
        }, 150);

        return () => {
            clearTimeout(timer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [activeModal, modalData, lat, lng]);

    if (activeModal !== 'action' || !modalData) return null;

    const handleDispatch = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await dispatchAction(p.id, {
                assignedUnit: unitType,
                notes: notes,
                dispatchedAt: new Date().toISOString()
            });
            closeModal();
        } catch (err) {
            console.error('Dispatch error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <Truck size={20} className="text-brand-primary" />
                        <h3 className="modal-title">Dispatch Tactical Response Squad</h3>
                    </div>
                    <button className="modal-close-btn" onClick={closeModal}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleDispatch} className="modal-body">
                    <div className="modal-incident-summary">
                        <span className="summary-tracking">{p.trackingId || `REP-${p.id}`}</span>
                        <h4 className="summary-title">{p.title}</h4>
                        <p className="summary-location">📍 {p.city || 'Indore'} ({p.district || 'Indore'}) • [{lat.toFixed(4)}, {lng.toFixed(4)}]</p>
                    </div>

                    {/* Leaflet Tactical Dispatch Mini-Map Canvas */}
                    <div className="modal-target-map-box">
                        <div className="modal-target-map-header">
                            <span className="modal-target-title">🎯 Incident Ground Target Coordinate (Leaflet API)</span>
                            <span className="modal-target-badge">Perimeter 400m Alert</span>
                        </div>
                        <div ref={mapContainerRef} className="modal-leaflet-canvas" />
                    </div>

                    <div className="input-field-group">
                        <label className="input-label">Select Response Unit / Squad</label>
                        <select 
                            value={unitType}
                            onChange={(e) => setUnitType(e.target.value)}
                            className="select-input"
                        >
                            <option value="NDRF_WATER_RESCUE">NDRF Inflatable Boat & Flood Rescue Team</option>
                            <option value="SDRF_PUMP_CREW">SDRF Heavy High-Capacity Dewatering Pumps</option>
                            <option value="MUNICIPAL_TREE_SQUAD">Municipal Road Clearing & Tree Removal Squad</option>
                            <option value="RED_CROSS_MEDICAL">Red Cross Mobile Trauma & Medical Ambulance</option>
                            <option value="TRAFFIC_DIVERSION_POLICE">Traffic Police Ring Road Diversion Unit</option>
                        </select>
                    </div>

                    <div className="input-field-group">
                        <label className="input-label">Tactical Mission Directives & Route Notes</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="textarea-input"
                            rows={3}
                            placeholder="Enter specific route instructions, staging points, or safety gear..."
                            required
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="secondary-btn" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className="primary-action-btn" disabled={submitting}>
                            {submitting ? 'Transmitting Directives...' : 'Authorize & Dispatch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
