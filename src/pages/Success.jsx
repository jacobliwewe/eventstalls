import { useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Success() {
    const { state } = useLocation();

    if (!state) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p>No booking details found.</p>
                <Link to="/" className="btn btn-outline" style={{ marginTop: '1rem' }}>Return Home</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '4rem 0', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '3rem' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(52, 211, 153, 0.2)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <CheckCircle size={48} color="#34d399" />
                </div>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Booking Confirmed!</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Thank you for booking with MUBAS Events. Your permit details have been sent to <strong>{state.email}</strong>.
                </p>

                <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Event</span>
                        <span style={{ fontWeight: 600 }}>{state.eventName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Stall Name</span>
                        <span style={{ fontWeight: 600 }}>{state.stallName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Duration</span>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{state.duration === 'day' ? '1 Day' : '1 Week'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Total Paid</span>
                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>MK {state.price.toLocaleString()}</span>
                    </div>
                </div>

                <Link to="/" className="btn btn-primary">
                    Return to Events
                </Link>
            </div>
        </div>
    );
}
