/**
 * SocialIntelPage Component - Social Media NLP Rumor Detection Stream
 */
import React, { useState, useEffect } from 'react';
import { endpoints } from '../api/endpoints.js';
import { Radio, AlertOctagon, CheckCircle2, RefreshCw, MessageSquare } from 'lucide-react';

export default function SocialIntelPage() {
    const [stream, setStream] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStream = async () => {
        setLoading(true);
        try {
            const data = await endpoints.getSocialStream();
            if (Array.isArray(data)) setStream(data);
        } catch (e) {
            // Mock social stream data if backend service offline
            setStream([
                { id: 1, author: '@indore_updates', content: 'Dam burst in Indore city area! Submerged 4 floors!', rumorScore: 0.92, isRumor: true, sentiment: 'PANIC_ALARMIST', hazard: 'FLASH_FLOOD' },
                { id: 2, author: '@IMD_Weather', content: '#IMD Alert: Moderate rain 45mm recorded at Indore observatory. No dam breach.', rumorScore: 0.05, isRumor: false, sentiment: 'INFORMATIVE_OBJECTIVE', hazard: 'WATERLOGGING' },
                { id: 3, author: '@citizen_scout_9', content: 'Waterlogging near Vijay Nagar square, traffic moving slow.', rumorScore: 0.12, isRumor: false, sentiment: 'OBSERVATIONAL_NEUTRAL', hazard: 'WATERLOGGING' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStream();
    }, []);

    return (
        <div className="gov-console-page animate-fade-in">
            <div className="gov-page-header-strip">
                <div>
                    <span className="gov-service-badge">AI MULTIMODAL RUMOR DETECTION ENGINE</span>
                    <h1 className="gov-console-title">#IMD Social Media Rumor Stream</h1>
                    <p className="gov-console-desc">
                        NLP panic sentiment classification & misinfo scoring engine analyzing microblogs and social broadcasts.
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={loadStream} disabled={loading}>
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    <span>Scrape Stream</span>
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    Analyzing NLP microblogs...
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {stream.map((post) => {
                        const rumorPercent = Math.round((post.rumorScore || 0) * 100);
                        const isRumor = post.isRumor || rumorPercent >= 70;

                        return (
                            <div key={post.id} style={{ background: 'var(--surface-card)', border: `1px solid ${isRumor ? 'rgba(239,68,68,0.4)' : 'var(--border-subtle)'}`, borderRadius: 12, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <strong style={{ fontSize: '0.88rem', color: 'var(--brand-primary)' }}>{post.author}</strong>
                                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: 'var(--surface-subtle)', color: 'var(--text-muted)' }}>{post.hazard || 'GENERAL'}</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                                        "{post.content}"
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: 140 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontWeight: 800, fontSize: '0.85rem', color: isRumor ? '#EF4444' : '#10B981' }}>
                                        {isRumor ? <AlertOctagon size={16} /> : <CheckCircle2 size={16} />}
                                        <span>{isRumor ? 'FLAGGED RUMOR' : 'VERIFIED'}</span>
                                    </div>
                                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        Rumor Score: <strong>{rumorPercent}%</strong>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
