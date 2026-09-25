/**
 * Meteorological Telemetry Polling Service
 * Syncs IMD Doppler radar data and weather sensor observations
 */
import { endpoints } from '../api/endpoints.js';
import { MOCK_TELEMETRY } from '../data/mockData.js';

class TelemetryService {
    constructor() {
        this.cache = { ...MOCK_TELEMETRY };
        this.pollInterval = null;
    }

    async fetchTelemetry(city = 'Indore') {
        try {
            const data = await endpoints.getWeatherCurrent(city);
            if (data && typeof data === 'object') {
                const normalized = {
                    city: data.city || city,
                    temperature: data.temperatureC ?? data.temperature ?? 24.0,
                    feelsLike: data.feelsLikeC ?? data.feelsLike ?? 26.0,
                    humidity: data.humidityPercent ?? data.humidity ?? 80.0,
                    precipitationMm: data.precipitationMmPerHour ?? data.precipitationMm ?? 0.0,
                    windSpeedKmh: data.windSpeedKmh ?? 10.0,
                    windDirection: data.windDirection || 'WSW',
                    pressureHpa: data.surfacePressureHpa ?? data.pressureHpa ?? 1010.0,
                    floodRiskLevel: data.floodRiskLevel || 'NORMAL_READINESS',
                    weatherCondition: data.weatherCondition || 'OVERCAST',
                    latitude: data.latitude,
                    longitude: data.longitude,
                    source: data.source || 'OpenWeatherMap API & IMD Doppler Radar'
                };
                this.cache = normalized;
                return normalized;
            }
        } catch (err) {
            console.warn('[Telemetry] Error fetching live data, falling back to cached telemetry:', err.message);
        }
        return this.cache;
    }

    startPolling(city = 'Indore', intervalMs = 20000, onUpdate) {
        this.stopPolling();
        // Initial fetch
        this.fetchTelemetry(city).then(onUpdate);

        this.pollInterval = setInterval(async () => {
            const updated = await this.fetchTelemetry(city);
            if (onUpdate) onUpdate(updated);
        }, intervalMs);
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
}

export const telemetryService = new TelemetryService();
