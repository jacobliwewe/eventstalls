import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import EventCard from '../components/EventCard';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching events:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                </div>
            ) : (
                <div className="container" style={{ padding: 0 }}>
                    {events.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '2.5rem',
                            justifyContent: 'center'
                        }}>
                            {events.map(event => (
                                <div key={event.id} style={{ maxWidth: '450px' }}>
                                    <EventCard event={event} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            <p>No events found. Admin has not created any events yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
