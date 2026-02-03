import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const handleSignOut = () => {
        logout();
        setMobileMenuOpen(false);
        navigate('/');
    };

    return (
        <nav className="glass-panel" style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '1200px',
            zIndex: 100,
            padding: '0.8rem 2rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <img src={logo} alt="MUBAS Events" style={{ height: '40px', width: 'auto' }} />
                    <span className="text-gradient">Event Hub</span>
                </Link>

                {/* Desktop Menu */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-menu">
                    <Link to="/" style={{ fontWeight: 500 }}>Events</Link>
                    {user && <Link to="/bookings" style={{ fontWeight: 500 }}>My Bookings</Link>}

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.name}</span>
                            <button
                                onClick={handleSignOut}
                                className="btn btn-outline"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link to="/signin" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="mobile-menu-dropdown">
                    <Link to="/" style={{ padding: '0.5rem', fontWeight: 500 }}>Events</Link>
                    {user && <Link to="/bookings" style={{ padding: '0.5rem', fontWeight: 500 }}>My Bookings</Link>}

                    {user ? (
                        <>
                            <div style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <User size={16} /> <span>{user.name}</span>
                            </div>
                            <button onClick={handleSignOut} className="btn btn-outline" style={{ width: '100%' }}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link to="/signin" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                            Sign In
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};

const Footer = () => (
    <footer style={{ marginTop: 'auto', padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="container">
            <p>&copy; {new Date().getFullYear()} MUBAS Events Hub. All rights reserved.</p>
        </div>
    </footer>
);

export default function Layout({ children }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '100px' }}>
            <Navbar />
            <main className="container" style={{ flex: 1, width: '100%' }}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
