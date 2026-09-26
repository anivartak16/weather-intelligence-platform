/**
 * NationalAlertsPage Component - NDMA SACHET National Early Warning Stream
 */
import React, { useState, useEffect } from 'react';
import { endpoints } from '../api/endpoints.js';
import { Bell, Shield, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';

export default function NationalAlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const data = await endpoints.getNationalAlerts();
            if (Array.isArray(data)) setAlerts(data);
        } catch (e) {
            console.warn('[NationalAlertsPage] Fetch error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    return (
        <div className="gov-console-page animate-fade-in">
            <div className="gov-page-header-strip">
                <div>
                    <span className="gov-service-badge">NDMA SACHET LIVE CAP FEED</span>
                    <h1 className="gov-console-title">National Disaster Advisories & Alerts</h1>
                    <p className="gov-console-desc">
                        Official early warning bulletins ingested directly from the National Disaster Management Authority (NDMA) & IMD.
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={fetchAlerts} disabled={loading}>
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    <span>Sync Alerts</span>
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    Loading SACHET disaster advisories...
                </div>
            ) : alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    No active national disaster advisories at this time.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
                    {alerts.map((alert, idx) => (
                        <div key={idx} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <AlertTriangle size={18} style={{ color: '#EF4444' }} />
                                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                        {alert.title || 'National Advisory'}
                                    </strong>
                                </div>
                                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                                    {alert.description || 'Disaster management alert issued by NDMA / IMD.'}
                                </p>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                <span>🏛️ {alert.author || 'NDMA SACHET'}</span>
                                {alert.link && (
                                    <a href={alert.link} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                                        <span>CAP Bulletin</span>
                                        <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
