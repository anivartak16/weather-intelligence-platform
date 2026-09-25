/**
 * SURAKSHA-NET API Endpoints
 * Accurately mapped to live Spring Boot & Python AI backend controllers
 */

import { request } from './client.js';

export const endpoints = {
    // Reports & GeoJSON Incidents
    getIncidents: () => request('/api/reports/geojson'),
    getIncidentById: (id) => request(`/api/reports/${id}`),
    
    // Submit Citizen Report (Multipart or JSON)
    submitReport: (formData) => request('/api/reports', {
        method: 'POST',
        body: formData
    }),

    // Operator Verification (PUT /api/admin/reports/{id}/verify)
    verifyIncident: (id, payload = {}) => request(`/api/admin/reports/${id}/${payload.verified ? 'verify' : 'false-alarm'}`, {
        method: 'PUT',
        body: JSON.stringify({
            adminUser: 'admin_ndrf',
            comments: payload.comments || 'Ground truth verified via commander dispatch console'
        })
    }),

    // Operator Action Dispatch (PUT /api/admin/reports/{id}/action)
    dispatchAction: (id, payload = {}) => request(`/api/admin/reports/${id}/action`, {
        method: 'PUT',
        body: JSON.stringify({
            teamName: payload.assignedUnit || 'NDRF Quick Response Team 4',
            instructions: payload.notes || 'Dispatched inflatable motorboats and rescue squads'
        })
    }),

    // Shelters & Safe Zones GeoJSON
    getShelters: async () => {
        const geojson = await request('/api/shelters/geojson');
        if (geojson && Array.isArray(geojson.features)) {
            return geojson.features.map(f => ({
                id: f.properties?.id,
                name: f.properties?.name,
                type: f.properties?.type,
                address: f.properties?.address,
                contactPhone: f.properties?.contactPhone,
                capacity: f.properties?.capacity,
                availableSlots: f.properties?.availableSlots,
                latitude: f.geometry?.coordinates?.[1],
                longitude: f.geometry?.coordinates?.[0]
            }));
        }
        return [];
    },

    // Citizen Sentinel Leaderboard (/api/reputation/leaderboard)
    getLeaderboard: () => request('/api/reputation/leaderboard'),

    // IMD Telemetry Weather Data (/api/telemetry/current)
    getTelemetry: (city = 'Indore') => request(`/api/telemetry/current?city=${encodeURIComponent(city)}`),

    // NDMA SACHET National Alerts
    getNationalAlerts: () => request('/api/alerts/national'),

    // GeoNames Indian Cities Search
    searchCities: (query) => request(`/api/cities/search?query=${encodeURIComponent(query)}`),

    // SITREP Tactical Report (HTML / Plaintext)
    getSitrep: () => request('/api/reports/sitrep', {
        headers: { 'Accept': 'text/plain' }
    }),

    // Tracking Ledger
    getTracking: (trackingId) => request(`/api/reports/tracking/${encodeURIComponent(trackingId)}`),

    // Social Media #IMD Scraper & Stream
    getSocialStream: () => request('/api/social/stream'),
    scrapeSocialNow: (count = 3) => request(`/api/social/scrape-now?count=${count}`, {
        method: 'POST'
    }),
    getSocialAnalytics: () => request('/api/social/analytics'),

    // Crisis Simulation Triggers
    triggerSimulation: (scenario = 'FLASH_FLOOD') => request('/api/simulate/crisis', {
        method: 'POST',
        body: JSON.stringify({ scenario })
    }),

    // Executive Big Data Analytics
    getAnalyticsSummary: () => request('/api/analytics/summary'),
    getAnalyticsTrends: () => request('/api/analytics/trends'),
    getHazardBreakdown: () => request('/api/analytics/hazard-breakdown'),

    // Citizen Disaster Preparedness Guidelines
    getGuidelines: () => request('/api/guidelines'),

    // Perceptual Hash Forensic Comparison
    compareForensics: (hash1, hash2) => request('/api/forensics/compare', {
        method: 'POST',
        body: JSON.stringify({ hash1, hash2 })
    }),

    // --- Weather API Endpoints ---
    getWeatherCurrent: (city = 'Indore', lat = 22.7196, lon = 75.8577) => 
        request(`/api/weather/current?city=${encodeURIComponent(city)}&lat=${lat}&lon=${lon}`),
    
    getWeatherForecast: (city = 'Indore', lat = 22.7196, lon = 75.8577) => 
        request(`/api/weather/forecast?city=${encodeURIComponent(city)}&lat=${lat}&lon=${lon}`),
    
    getWeatherStations: () => 
        request('/api/weather/stations'),
    
    getRadarTelemetry: (stationId = 'IND-DWR-01') => 
        request(`/api/weather/radar-telemetry?stationId=${encodeURIComponent(stationId)}`),

    // Direct OpenWeatherMap API Call (using openWeatherAPI key from env)
    getOpenWeatherLive: async (city = 'Indore', apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || 'fe4fd9c5e7d8104bbcad4360ab880f6b') => {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`OpenWeather API returned ${res.status}`);
            return await res.json();
        } catch (err) {
            console.warn('[OpenWeatherMap Direct API] Fallback to backend weather proxy:', err.message);
            return null;
        }
    },

    // --- Leaflet GIS API Endpoints ---
    getLeafletConfig: () => 
        request('/api/leaflet/config'),
    
    getLeafletLayer: (layerName) => 
        request(`/api/leaflet/layers/${encodeURIComponent(layerName)}`)
};
