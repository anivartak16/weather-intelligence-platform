/**
 * NationalFooter Component
 * Official Government of India Footer
 */
import React from 'react';
import { Shield } from 'lucide-react';

export default function NationalFooter() {
    return (
        <footer className="national-footer-wrapper">
            <div className="national-footer-container">
                <div className="footer-columns-grid">
                    <div>
                        <div className="footer-brand-header">
                            <div className="footer-emblem-box">
                                <Shield size={20} className="text-brand-primary" />
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '1.05rem', fontWeight: 800 }}>सुरक्षा-NET</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>National Weather Intelligence Console</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Official National Disaster Operations Console under the Ministry of Earth Sciences and IMD.
                            Providing real-time GIS telemetry, rumor verification, and automated relief logistics.
                        </p>
                    </div>

                    <div>
                        <strong style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem' }}>Emergency Portals</strong>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li><a href="https://ndma.gov.in" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>NDMA Official Portal ↗</a></li>
                            <li><a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>IMD Weather Warnings ↗</a></li>
                            <li><a href="https://ndrf.gov.in" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>NDRF Disaster Response ↗</a></li>
                            <li><a href="https://sachet.ndma.gov.in" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>SACHET Early Alert System ↗</a></li>
                        </ul>
                    </div>

                    <div>
                        <strong style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem' }}>Helplines & Toll-Free</strong>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-secondary)' }}>
                            <li>National Emergency: <strong>112</strong></li>
                            <li>Disaster Management: <strong>1077</strong></li>
                            <li>NDRF Control Room: <strong>011-24363260</strong></li>
                            <li>IMD Weather Forecast: <strong>1800-180-1717</strong></li>
                        </ul>
                    </div>

                    <div>
                        <strong style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem' }}>Security & Compliance</strong>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            Designed for Government of India Disaster Operation Centers (DEOC/SEOC).
                            Certified for ISO 27001 data integrity & automated pHash perceptual forensics.
                        </p>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>© {new Date().getFullYear()} Government of India • Ministry of Earth Sciences. All Rights Reserved.</span>
                    <span>SURAKSHA-NET v1.0.0 (Build 2026.09)</span>
                </div>
            </div>
        </footer>
    );
}
