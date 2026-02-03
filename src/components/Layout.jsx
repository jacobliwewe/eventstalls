import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Calendar, Ticket, PlusSquare, BarChart3, LogOut } from 'lucide-react';
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

    const handleSignOut = async () => {
        try {
            await logout();
            setMobileMenuOpen(false);
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="navbar-glass" style={{
                position: 'fixed',
                top: '0.75rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '94%',
                maxWidth: '1200px',
                zIndex: 1000,
                padding: '0.7rem 2rem',
                borderRadius: '16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                        <img src={logo} alt="MUBAS Events" style={{ height: '36px', width: 'auto' }} />
                        <span className="text-gradient">Event Hub</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="desktop-menu">
                        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                            <Calendar size={18} />
                            <span>Events</span>
                        </Link>

                        {user && (
                            <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
                                <Ticket size={18} />
                                <span>My Bookings</span>
                            </Link>
                        )}

                        {user?.role === 'admin' && (
                            <>
                                <Link to="/admin/create-event" className={`nav-link ${isActive('/admin/create-event') ? 'active' : ''}`} style={{ color: 'var(--accent)' }}>
                                    <PlusSquare size={18} />
                                    <span>Create Event</span>
                                </Link>
                                <Link to="/admin/transactions" className={`nav-link ${isActive('/admin/transactions') ? 'active' : ''}`} style={{ color: 'var(--accent)' }}>
                                    <BarChart3 size={18} />
                                    <span>Transactions</span>
                                </Link>
                            </>
                        )}

                        <div style={{ width: '1px', height: '20px', background: 'var(--border-glass)', margin: '0 0.25rem' }}></div>

                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        color: 'white'
                                    }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.9rem' }}>{user.name}</span>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="btn btn-outline"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link to="/signin" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Dropdown - Outside nav to avoid inherited transparency */}
            {mobileMenuOpen && (
                <div className="mobile-menu-dropdown">
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} style={{ fontSize: '1.2rem' }}>
                        <Calendar size={22} />
                        <span>Events</span>
                    </Link>

                    {user && (
                        <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`} style={{ fontSize: '1.2rem' }}>
                            <Ticket size={22} />
                            <span>My Bookings</span>
                        </Link>
                    )}

                    {user?.role === 'admin' && (
                        <>
                            <Link to="/admin/create-event" className={`nav-link ${isActive('/admin/create-event') ? 'active' : ''}`} style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
                                <PlusSquare size={22} />
                                <span>Create Event</span>
                            </Link>
                            <Link to="/admin/transactions" className={`nav-link ${isActive('/admin/transactions') ? 'active' : ''}`} style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
                                <BarChart3 size={22} />
                                <span>Transactions</span>
                            </Link>
                        </>
                    )}

                    <div style={{ height: '1px', background: 'var(--border-glass)', margin: '0.5rem 0' }}></div>

                    {user ? (
                        <>
                            <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`} style={{ fontSize: '1.2rem' }}>
                                <User size={22} /> <span>Profile ({user.name})</span>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="btn btn-outline"
                                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.8rem' }}
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link to="/signin" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', marginTop: '1rem', padding: '0.8rem' }}>
                            Sign In
                        </Link>
                    )}
                </div>
            )}
        </>
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
