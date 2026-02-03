import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
    return (
        <div className="glass-panel" style={{ overflow: 'hidden', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '200px', overflow: 'hidden' }}>
                <img
                    src={event.image}
                    alt={event.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
            </div>

            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{event.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>{event.description}</p>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={16} color="var(--accent)" />
                        <span>{event.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={16} color="var(--secondary)" />
                        <span>{event.location}</span>
                    </div>
                </div>

                <Link to={`/book/${event.id}`} className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
                    Book a Stall <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                </Link>
            </div>
        </div>
    );
}
