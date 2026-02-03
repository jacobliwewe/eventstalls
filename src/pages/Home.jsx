import { EVENTS } from '../data/events';
import EventCard from '../components/EventCard';

export default function Home() {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <div style={{ textAlign: 'center', margin: '4rem 0 6rem' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800 }}>
                    <span className="text-gradient">MUBAS Events Hub</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    Secure your spot at the hottest social events on campus. Sell drinks, food, and vibes to the crowd.
                </p>
            </div>

            {/* Events Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {EVENTS.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}
