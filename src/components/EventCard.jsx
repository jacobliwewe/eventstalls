import { Calendar, MapPin, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
    const getStatusInfo = (dateString) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        if (isNaN(eventDate.getTime())) {
            return { label: 'Upcoming', color: 'var(--accent)', bg: 'rgba(6, 182, 212, 0.1)', isClosed: false };
        }

        if (eventDate.getTime() === today.getTime()) {
            return { label: 'Active', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', isClosed: false };
        } else if (eventDate.getTime() > today.getTime()) {
            return { label: 'Upcoming', color: 'var(--accent)', bg: 'rgba(6, 182, 212, 0.1)', isClosed: false };
        } else {
            return { label: 'Closed', color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', isClosed: true };
        }
    };

    const status = getStatusInfo(event.date);

    return (
        <div className="glass-panel" style={{
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            opacity: status.isClosed ? 0.8 : 1
        }}>
            <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                <img
                    src={event.image}
                    alt={event.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s ease',
                        filter: status.isClosed ? 'grayscale(0.4)' : 'none'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.08)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />

                {/* Star Rating Overlay */}
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.4rem 0.7rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                    <Star size={14} fill="#fbbf24" color="#fbbf24" strokeWidth={0} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>4.8</span>
                </div>
            </div>

            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2, flex: 1 }}>{event.title}</h3>

                    {/* Status Chip moved to content area */}
                    <div style={{
                        background: status.bg,
                        color: status.color,
                        padding: '0.3rem 0.6rem',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        border: `1px solid ${status.color}22`,
                        whiteSpace: 'nowrap',
                        height: 'fit-content',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                    }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: status.color }}></div>
                        {status.label}
                    </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', flex: 1, lineHeight: 1.5 }}>
                    {event.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 500 }}>{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 500 }}>{event.location}</span>
                    </div>
                </div>

                {status.isClosed ? (
                    <button className="btn btn-disabled" style={{ width: '100%', cursor: 'not-allowed', opacity: 0.6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }} disabled>
                        Bookings Closed
                    </button>
                ) : (
                    <Link to={`/book/${event.id}`} className="btn btn-primary" style={{ width: '100%', textDecoration: 'none', display: 'flex', gap: '0.5rem' }}>
                        Book a Stall <ArrowRight size={18} />
                    </Link>
                )}
            </div>
        </div>
    );
}
