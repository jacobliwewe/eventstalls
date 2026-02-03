import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();

    if (!user) return <div className="container" style={{ paddingTop: '2rem' }}>Please sign in.</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0', maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="text-gradient" style={{ marginBottom: '2rem', textAlign: 'center' }}>My Profile</h1>
            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '50%' }}>
                    <User size={48} color="#8b5cf6" />
                </div>

                <div style={{ width: '100%', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{user.name}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{user.email}</p>
                    <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.1)', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                        Role: {user.role || 'User'}
                    </div>
                </div>

                <div style={{ width: '100%', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Account Details</h3>
                    <div style={{ display: 'grid', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>User ID:</span>
                            <span style={{ fontFamily: 'monospace' }}>{user.uid}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Email Verified:</span>
                            <span style={{ color: user.emailVerified ? '#4ade80' : '#f87171' }}>{user.emailVerified ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
