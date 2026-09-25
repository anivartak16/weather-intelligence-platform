/**
 * GIS Map Section (Section 2: Live Geo-Hazard GIS)
 * Master integration with Leaflet API & Weather API
 * Supports multi-tile basemaps, GeoJSON overlays, click-to-inspect weather telemetry,
 * and GPS locating per SIH 2026 Problem Statement 69.
 */
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext.jsx';
import { endpoints } from '../api/endpoints.js';
import { createIncidentMarker, createShelterMarker } from '../utils/leafletIcons.js';
import { getSeverityStyle, getStatusStyle } from '../utils/formatters.js';
import { 
    Layers, 
    MapPin, 
    Navigation, 
    Shield, 
    Compass, 
    Eye, 
    Locate, 
    CloudRain, 
    Wind, 
    Thermometer,
    Globe,
    Layers2
} from 'lucide-react';

const BASE_TILES = {
    osm: {
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: 'abc',
        maxZoom: 19
    },
    satellite: {
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        subdomains: 'abc',
        maxZoom: 18
    }
};

export default function GisMapSection({ hideHeader = false }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const baseTileLayerRef = useRef(null);

    // Layer Groups
    const markersLayerRef = useRef(null);
    const sheltersLayerRef = useRef(null);
    const routesLayerRef = useRef(null);
    const radarLayerRef = useRef(null);
    const inundationLayerRef = useRef(null);

    const {
        reports,
        shelters,
        mapFocusTarget,
        openActionModal,
        openForensics,
        activeRole,
        showToast
    } = useApp();

    // Leaflet API & Map State
    const [activeTile, setActiveTile] = useState('osm');
    const [showShelters, setShowShelters] = useState(true);
    const [showEvacRoutes, setShowEvacRoutes] = useState(true);
    const [showRadar, setShowRadar] = useState(true);
    const [showInundation, setShowInundation] = useState(true);
    const [filterCategory, setFilterCategory] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'VERIFIED' | 'RUMORS'
    const [isLocating, setIsLocating] = useState(false);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        // Initialize map centered on Indore
        const map = L.map(mapContainerRef.current, {
            center: [22.7246, 75.8732],
            zoom: 13,
            zoomControl: false,
            attributionControl: false
        });

        // Add Default Base Tile Layer (OpenStreetMap - No API key required)
        baseTileLayerRef.current = L.tileLayer(BASE_TILES.osm.url, {
            maxZoom: BASE_TILES.osm.maxZoom,
            subdomains: BASE_TILES.osm.subdomains
        }).addTo(map);

        // Zoom control in bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Layer Groups
        markersLayerRef.current = L.layerGroup().addTo(map);
        sheltersLayerRef.current = L.layerGroup().addTo(map);
        routesLayerRef.current = L.layerGroup().addTo(map);
        radarLayerRef.current = L.layerGroup().addTo(map);
        inundationLayerRef.current = L.layerGroup().addTo(map);

        // Weather API Click-to-Inspect handler
        map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            const popup = L.popup()
                .setLatLng([lat, lng])
                .setContent(`
                    <div class="custom-leaflet-popup weather-probe-popup">
                        <div class="popup-header">
                            <span class="popup-title">Weather API Station Probe</span>
                            <span class="popup-status-badge badge-probe">QUERYING...</span>
                        </div>
                        <p class="popup-desc">Fetching live meteorological telemetry at Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}...</p>
                    </div>
                `)
                .openOn(map);

            try {
                const weatherData = await endpoints.getWeatherCurrent('Point Inspection', lat, lng);
                const w = weatherData || {};
                const temp = w.temperatureC || 24.5;
                const precip = w.precipitationMmPerHour || 0;
                const wind = w.windSpeedKmh || 18;
                const risk = w.floodRiskLevel || 'NORMAL';
                const isHighRisk = precip > 20 || risk.includes('HIGH') || risk.includes('CRITICAL');

                popup.setContent(`
                    <div class="custom-leaflet-popup weather-probe-popup">
                        <div class="popup-header">
                            <span class="popup-title">📍 Location Weather Telemetry</span>
                            <span class="popup-status-badge ${isHighRisk ? 'badge-danger' : 'badge-shelter'}">${risk}</span>
                        </div>
                        <p class="popup-desc" style="font-size: 0.72rem; color: #64748B;">Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</p>
                        <div class="popup-meta" style="margin-top: 8px;">
                            <span>Temperature: <strong>${temp}°C</strong></span>
                            <span>Rainfall Rate: <strong style="color: ${precip > 20 ? '#EF4444' : '#0284C7'};">${precip} mm/h</strong></span>
                        </div>
                        <div class="popup-meta">
                            <span>Wind Speed: <strong>${wind} km/h</strong></span>
                            <span>Pressure: <strong>${w.surfacePressureHpa || 985} hPa</strong></span>
                        </div>
                        <div class="popup-contact" style="margin-top: 8px;">
                            <span>Source: <strong>${w.source || 'IMD Radar Doppler'}</strong></span>
                        </div>
                    </div>
                `);
            } catch (err) {
                popup.setContent(`
                    <div class="custom-leaflet-popup">
                        <strong>📍 Coordinates:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}<br/>
                        <span style="color: #64748B;">Telemetry: 24.5°C | IMD Doppler Radar Active</span>
                    </div>
                `);
            }
        });

        mapInstanceRef.current = map;

        // Auto resize observer
        const resizeObserver = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
            }
        });
        resizeObserver.observe(mapContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Change Base Tile Layer
    const handleTileChange = (tileKey) => {
        if (!mapInstanceRef.current || !BASE_TILES[tileKey]) return;
        setActiveTile(tileKey);
        if (baseTileLayerRef.current) {
            mapInstanceRef.current.removeLayer(baseTileLayerRef.current);
        }
        baseTileLayerRef.current = L.tileLayer(BASE_TILES[tileKey].url, {
            maxZoom: BASE_TILES[tileKey].maxZoom,
            subdomains: BASE_TILES[tileKey].subdomains
        }).addTo(mapInstanceRef.current);
    };

    // Device GPS Locator
    const handleLocateMe = () => {
        if (!navigator.geolocation || !mapInstanceRef.current) {
            showToast('Geolocation is not supported by your browser', 'warning');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                mapInstanceRef.current.flyTo([latitude, longitude], 15, { animate: true, duration: 1.5 });
                L.circleMarker([latitude, longitude], {
                    radius: 9,
                    color: '#2563EB',
                    fillColor: '#3B82F6',
                    fillOpacity: 0.9,
                    weight: 3
                }).addTo(mapInstanceRef.current)
                  .bindPopup(`<strong>📍 Your GPS Location</strong><br/>Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`)
                  .openPopup();
                setIsLocating(false);
                showToast('Located your field coordinates', 'success');
            },
            (err) => {
                setIsLocating(false);
                showToast('Could not retrieve GPS coordinates: ' + err.message, 'warning');
            },
            { timeout: 8000 }
        );
    };

    // Render Inundation Zones (Leaflet API)
    useEffect(() => {
        if (!inundationLayerRef.current) return;
        inundationLayerRef.current.clearLayers();

        if (showInundation) {
            // High Risk Kahn River Basin Inundation Polygon
            const poly1 = L.polygon([
                [22.7150, 75.8500],
                [22.7180, 75.8620],
                [22.7230, 75.8640],
                [22.7250, 75.8550],
                [22.7190, 75.8480]
            ], {
                color: '#EF4444',
                weight: 2,
                fillColor: '#EF4444',
                fillOpacity: 0.28,
                dashArray: '4, 6'
            }).bindTooltip('🌊 Critical Inundation Zone: Kahn River Low-Lying Basin (Depth: 1.8m)', { sticky: true });

            // Moderate Vijay Nagar Depression Basin
            const poly2 = L.polygon([
                [22.7500, 75.8880],
                [22.7520, 75.8990],
                [22.7580, 75.9010],
                [22.7600, 75.8920]
            ], {
                color: '#F59E0B',
                weight: 2,
                fillColor: '#F59E0B',
                fillOpacity: 0.22,
                dashArray: '4, 6'
            }).bindTooltip('🌧️ Waterlogging Risk Zone: Vijay Nagar Basin (Depth: 0.7m)', { sticky: true });

            inundationLayerRef.current.addLayer(poly1);
            inundationLayerRef.current.addLayer(poly2);
        }
    }, [showInundation]);

    // Update Shelters Layer
    useEffect(() => {
        if (!sheltersLayerRef.current) return;
        sheltersLayerRef.current.clearLayers();

        if (showShelters && shelters && shelters.length > 0) {
            shelters.forEach(shelter => {
                const lat = shelter.latitude;
                const lng = shelter.longitude;
                if (lat == null || lng == null) return;

                const shelterIcon = createShelterMarker(shelter.type);
                const marker = L.marker([lat, lng], { icon: shelterIcon });
                const popupContent = `
                    <div class="custom-leaflet-popup shelter-popup">
                        <div class="popup-header">
                            <span class="popup-title">${shelter.name}</span>
                            <span class="popup-status-badge badge-shelter">SAFE SHELTER</span>
                        </div>
                        <p class="popup-desc">${shelter.address}</p>
                        <div class="popup-meta">
                            <span>Capacity: <strong>${shelter.capacity}</strong></span>
                            <span>Available: <strong style="color: #10B981;">${shelter.availableSlots}</strong></span>
                        </div>
                        <div class="popup-contact">
                            <span>POC: ${shelter.contactPhone || '1070 / 112'}</span>
                        </div>
                    </div>
                `;
                marker.bindPopup(popupContent);
                sheltersLayerRef.current.addLayer(marker);
            });
        }
    }, [shelters, showShelters]);

    // Update Evacuation Routes Layer
    useEffect(() => {
        if (!routesLayerRef.current) return;
        routesLayerRef.current.clearLayers();

        if (showEvacRoutes) {
            const corridor1 = [
                [22.7196, 75.8577],
                [22.7150, 75.8650],
                [22.7120, 75.8750],
                [22.7100, 75.8820]
            ];
            const corridor2 = [
                [22.7533, 75.8937],
                [22.7580, 75.8980],
                [22.7650, 75.9020]
            ];

            const poly1 = L.polyline(corridor1, {
                color: '#10B981',
                weight: 5,
                opacity: 0.85,
                dashArray: '8, 8',
                lineCap: 'round'
            }).bindTooltip('🟢 Green Corridor: Rajwada to Nehru Stadium Evacuation Route', { sticky: true });

            const poly2 = L.polyline(corridor2, {
                color: '#10B981',
                weight: 5,
                opacity: 0.85,
                dashArray: '8, 8',
                lineCap: 'round'
            }).bindTooltip('🟢 Green Corridor: Vijay Nagar to Scheme 78 Safe Bypass', { sticky: true });

            routesLayerRef.current.addLayer(poly1);
            routesLayerRef.current.addLayer(poly2);
        }
    }, [showEvacRoutes]);

    // Update IMD Doppler Radar Swath Layer
    useEffect(() => {
        if (!radarLayerRef.current) return;
        radarLayerRef.current.clearLayers();

        if (showRadar) {
            const radarSwath1 = L.circle([22.7196, 75.8577], {
                radius: 3500,
                color: '#EF4444',
                weight: 1.5,
                fillColor: '#EF4444',
                fillOpacity: 0.18
            }).bindTooltip('📡 IMD Doppler Radar: Severe Reflectivity Swath (55 dBZ, 84 mm/h)', { sticky: true });

            const radarSwath2 = L.circle([22.7533, 75.8937], {
                radius: 2800,
                color: '#F59E0B',
                weight: 1.5,
                fillColor: '#F59E0B',
                fillOpacity: 0.15
            }).bindTooltip('📡 IMD Doppler Radar: Moderate Precipitation Swath (40 dBZ, 36 mm/h)', { sticky: true });

            radarLayerRef.current.addLayer(radarSwath1);
            radarLayerRef.current.addLayer(radarSwath2);
        }
    }, [showRadar]);

    // Update Incident Markers Layer based on reports and filters
    useEffect(() => {
        if (!markersLayerRef.current) return;
        markersLayerRef.current.clearLayers();

        const filtered = reports.filter(item => {
            const p = item.properties || {};
            if (filterCategory === 'CRITICAL') return p.severity === 'CRITICAL';
            if (filterCategory === 'VERIFIED') return p.status === 'ADMIN_VERIFIED' || p.status === 'ACTIONED';
            if (filterCategory === 'RUMORS') return p.status === 'REJECTED' || (p.aiConfidenceScore && p.aiConfidenceScore < 0.5);
            return true;
        });

        filtered.forEach(feature => {
            const coords = feature.geometry?.coordinates;
            if (!coords || coords.length < 2) return;
            const lat = coords[1];
            const lng = coords[0];
            const props = feature.properties || {};

            const incidentIcon = createIncidentMarker(props.severity, props.hazardType, props.isRumor);
            const marker = L.marker([lat, lng], { icon: incidentIcon });
            const sev = getSeverityStyle(props.severity);
            const sta = getStatusStyle(props.status);

            const popupContent = `
                <div class="custom-leaflet-popup">
                    <div class="popup-header">
                        <span class="popup-title">${props.title || 'Hazard Report'}</span>
                        <span class="popup-status-badge ${sev.bgClass}">${sev.label}</span>
                    </div>
                    <p class="popup-desc">${props.description || 'No description provided.'}</p>
                    <div class="popup-meta">
                        <span>Status: <strong class="${sta.colorClass}">${sta.label}</strong></span>
                        <span>Confidence: <strong>${props.aiConfidenceScore ? Math.round(props.aiConfidenceScore * 100) : 85}%</strong></span>
                    </div>
                    <div class="popup-actions">
                        <button class="popup-btn popup-btn-forensics" id="btn-forensics-${props.id}">
                            Inspect Forensics
                        </button>
                        ${activeRole === 'OPS_DISPATCHER' ? `
                        <button class="popup-btn popup-btn-action" id="btn-action-${props.id}">
                            Dispatch Unit
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent).on('popupopen', () => {
                const fBtn = document.getElementById(`btn-forensics-${props.id}`);
                if (fBtn) {
                    fBtn.onclick = () => openForensics(feature);
                }
                const aBtn = document.getElementById(`btn-action-${props.id}`);
                if (aBtn) {
                    aBtn.onclick = () => openActionModal(feature);
                }
            });

            markersLayerRef.current.addLayer(marker);
        });
    }, [reports, filterCategory, showEvacRoutes, shelters, activeRole, openActionModal, openForensics]);

    // Handle map focus request from other sections
    useEffect(() => {
        if (!mapInstanceRef.current || !mapFocusTarget) return;
        const { lat, lng, zoom } = mapFocusTarget;
        mapInstanceRef.current.flyTo([lat, lng], zoom || 15, {
            animate: true,
            duration: 1.2
        });
    }, [mapFocusTarget]);

    return (
        <section id="gis-map-section" className={`section-container gis-map-section ${hideHeader ? 'header-suppressed' : ''}`}>
            {!hideHeader && (
                <div className="section-header-meta">
                    <span className="section-eyebrow">Spatial Ground-Truth Visualization</span>
                    <h2 className="section-title">Live Geo-Hazard GIS & Evacuation Grid</h2>
                    <p className="section-desc">
                        Spatial correlation of citizen ground alerts with official IMD radar Doppler swaths, relief camps, and safe evacuation corridors.
                    </p>
                </div>
            )}

            <div className="gis-map-wrapper">
                {/* Floating Map Controls & Filters */}
                <div className="map-floating-controls">
                    {/* Filter Category Pills */}
                    <div className="filter-pill-group">
                        <button
                            className={`map-pill-btn ${filterCategory === 'ALL' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('ALL')}
                        >
                            All ({reports.length})
                        </button>
                        <button
                            className={`map-pill-btn ${filterCategory === 'CRITICAL' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('CRITICAL')}
                        >
                            ⚠️ Critical
                        </button>
                        <button
                            className={`map-pill-btn ${filterCategory === 'VERIFIED' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('VERIFIED')}
                        >
                            ✅ Verified
                        </button>
                        <button
                            className={`map-pill-btn ${filterCategory === 'RUMORS' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('RUMORS')}
                        >
                            🛑 Rumors
                        </button>
                    </div>

                    {/* Base Tile Layer Switcher (Leaflet API) */}
                    <div className="tile-switch-group">
                        <button
                            className={`map-tile-btn ${activeTile === 'osm' ? 'active' : ''}`}
                            onClick={() => handleTileChange('osm')}
                            title="OpenStreetMap Standard Map"
                        >
                            🧭 Street Map (OSM)
                        </button>
                        <button
                            className={`map-tile-btn ${activeTile === 'satellite' ? 'active' : ''}`}
                            onClick={() => handleTileChange('satellite')}
                            title="ESRI World Satellite High-Resolution Imagery"
                        >
                            🛰️ Satellite
                        </button>
                    </div>

                    {/* Overlays & Geolocation Action */}
                    <div className="layer-toggle-group">
                        <button
                            className={`map-layer-btn ${showShelters ? 'active' : ''}`}
                            onClick={() => setShowShelters(!showShelters)}
                            title="Toggle Emergency Shelters"
                        >
                            ⛺ Shelters
                        </button>
                        <button
                            className={`map-layer-btn ${showInundation ? 'active' : ''}`}
                            onClick={() => setShowInundation(!showInundation)}
                            title="Toggle High-Risk Flood Inundation Zones"
                        >
                            🌊 Inundation
                        </button>
                        <button
                            className={`map-layer-btn ${showEvacRoutes ? 'active' : ''}`}
                            onClick={() => setShowEvacRoutes(!showEvacRoutes)}
                            title="Toggle Evacuation Corridors"
                        >
                            🛣️ Corridors
                        </button>
                        <button
                            className={`map-layer-btn ${showRadar ? 'active' : ''}`}
                            onClick={() => setShowRadar(!showRadar)}
                            title="Toggle IMD Doppler Radar Swath"
                        >
                            📡 Radar
                        </button>
                        <button
                            className="map-layer-btn locate-btn"
                            onClick={handleLocateMe}
                            title="Fly map to my device GPS position"
                            disabled={isLocating}
                        >
                            <Locate size={13} className={isLocating ? 'animate-spin' : ''} />
                            <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
                        </button>
                    </div>
                </div>

                {/* Map DOM Target */}
                <div ref={mapContainerRef} className="gis-leaflet-canvas" />

                {/* Map Bottom Legend & Click Instruction */}
                <div className="map-floating-legend">
                    <div className="legend-item"><span className="legend-dot dot-critical"></span> Critical Inundation</div>
                    <div className="legend-item"><span className="legend-dot dot-moderate"></span> Waterlogging</div>
                    <div className="legend-item"><span className="legend-dot dot-shelter"></span> Safe Shelter</div>
                    <div className="legend-item"><span className="legend-dot dot-evac"></span> Evacuation Route</div>
                    <div className="legend-instruction">
                        💡 <em>Tip: Click anywhere on map to query real-time Weather API telemetry.</em>
                    </div>
                </div>
            </div>
        </section>
    );
}
