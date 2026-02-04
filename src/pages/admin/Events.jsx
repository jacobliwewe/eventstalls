import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import {
    Plus, Edit2, Trash2, Calendar, MapPin,
    Loader2, Search, ExternalLink, AlertCircle,
    LayoutGrid, Activity, ShoppingBag, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function Events() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'events'),
            where('createdBy', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching admin events:", error);
            toast.error("Failed to load your events");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            total: events.length,
            active: events.filter(e => {
                const eDate = new Date(e.date);
                eDate.setHours(0, 0, 0, 0);
                return eDate.getTime() >= today.getTime();
            }).length,
            stallTypes: events.reduce((acc, e) => acc + (e.stallTypes?.length || 0), 0)
        };
    }, [events]);

    const handleDelete = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'events', eventId));
            toast.success("Event deleted successfully");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete event");
        }
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p>Curating your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-events-page animate-fade-in">
            <header className="admin-header">
                <div className="header-main">
                    <h1 className="text-gradient">Manager Console</h1>
                    <p>Orchestrate your events and monitor vendor engagement.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar glass-panel">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Find an event..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link to="/admin/create-event" className="btn btn-primary create-btn">
                        <Plus size={18} />
                        <span>Launch Event</span>
                    </Link>
                </div>
            </header>

            {/* Dashboard Stats */}
            <div className="stats-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-icon purple">
                        <LayoutGrid size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Events</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon green">
                        <Activity size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Active Events</span>
                        <span className="stat-value">{stats.active}</span>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon blue">
                        <ShoppingBag size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Stall Offerings</span>
                        <span className="stat-value">{stats.stallTypes}</span>
                    </div>
                </div>
            </div>

            <section className="events-section">
                <div className="section-title">
                    <h2>Live Catalog</h2>
                    <span className="count-pill">{filteredEvents.length} Events Found</span>
                </div>

                {filteredEvents.length > 0 ? (
                    <div className="events-stack">
                        {filteredEvents.map((event) => {
                            const eventDate = new Date(event.date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            eventDate.setHours(0, 0, 0, 0);

                            let status = { label: 'Upcoming', color: 'var(--primary)', bg: 'rgba(139, 92, 246, 0.1)' };
                            if (eventDate.getTime() === today.getTime()) {
                                status = { label: 'Active', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
                            } else if (eventDate.getTime() < today.getTime()) {
                                status = { label: 'Closed', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
                            }

                            return (
                                <div key={event.id} className="event-dashboard-card glass-panel">
                                    <div className="card-thumb">
                                        <img src={event.image} alt={event.title} />
                                        <div className="status-indicator" style={{ backgroundColor: status.bg, color: status.color }}>
                                            {status.label}
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="content-top">
                                            <h3>{event.title}</h3>
                                            <div className="config-tag">
                                                {event.stallTypes?.length || 0} Categories
                                            </div>
                                        </div>

                                        <div className="content-meta">
                                            <div className="meta-box">
                                                <Calendar size={14} />
                                                <span>{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            <div className="meta-box">
                                                <MapPin size={14} />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>

                                        <div className="stall-pills">
                                            {event.stallTypes?.slice(0, 3).map((s, i) => (
                                                <div key={i} className="price-pill">
                                                    <span className="p-name">{s.name}</span>
                                                    <span className="p-val">MK {Number(s.dailyPrice).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {event.stallTypes?.length > 3 && (
                                                <div className="price-pill more">
                                                    +{event.stallTypes.length - 3} More Tiers
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <Link to={`/admin/edit-event/${event.id}`} className="tool-btn edit" title="Modify Event">
                                            <Edit2 size={16} />
                                            <span>Edit</span>
                                        </Link>
                                        <Link to={`/book/${event.id}`} target="_blank" className="tool-btn preview" title="Preview Gate">
                                            <ArrowUpRight size={16} />
                                            <span>Live</span>
                                        </Link>
                                        <button onClick={() => handleDelete(event.id)} className="tool-btn delete" title="Tear Down Event">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-dashboard glass-panel">
                        <div className="empty-icon">
                            <AlertCircle size={48} />
                        </div>
                        <h3>The Hub is Empty</h3>
                        <p>{searchTerm ? `No events match "${searchTerm}".` : "You haven't initialized any events in the console."}</p>
                        {!searchTerm && (
                            <Link to="/admin/create-event" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                                Deploy New Event
                            </Link>
                        )}
                    </div>
                )}
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-events-page { padding: 3rem 0; max-width: 1200px; margin: 0 auto; }
                
                .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3.5rem; gap: 2rem; }
                .header-main h1 { font-size: 3rem; font-weight: 800; margin-bottom: 0.5rem; }
                .header-main p { color: var(--text-muted); font-size: 1.1rem; }
                
                .header-actions { display: flex; align-items: center; gap: 1rem; }
                .search-bar { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 1.2rem; border-radius: 14px; width: 280px; }
                .search-bar input { background: transparent; border: none; color: white; width: 100%; outline: none; font-size: 0.9rem; }
                .create-btn { height: 44px; padding: 0 1.5rem; border-radius: 14px; }

                @media (max-width: 900px) {
                    .admin-header { flex-direction: column; align-items: stretch; text-align: center; }
                    .header-actions { flex-direction: column; }
                    .search-bar { width: 100%; }
                }

                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 4rem; }
                .stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; border-radius: 24px; }
                .stat-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
                .stat-icon.purple { background: rgba(139, 92, 246, 0.15); color: var(--primary); }
                .stat-icon.green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
                .stat-icon.blue { background: rgba(6, 182, 212, 0.15); color: var(--accent); }
                .stat-label { display: block; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem; }
                .stat-value { font-size: 2rem; font-weight: 800; color: white; }
                
                @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr; } }

                .events-section { margin-top: 2rem; }
                .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .section-title h2 { font-size: 1.8rem; font-weight: 700; }
                .count-pill { font-size: 0.8rem; background: rgba(255,255,255,0.05); padding: 0.4rem 1rem; border-radius: 20px; color: var(--text-muted); }

                .events-stack { display: flex; flex-direction: column; gap: 1.25rem; }
                
                .event-dashboard-card { display: flex; padding: 1.25rem; gap: 2rem; border-radius: 28px; transition: all 0.3s; border: 1px solid transparent; }
                .event-dashboard-card:hover { transform: scale(1.01); border-color: var(--border-glass); background: rgba(255,255,255,0.03); }
                
                .card-thumb { width: 160px; height: 110px; border-radius: 18px; overflow: hidden; position: relative; flex-shrink: 0; }
                .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .status-indicator { position: absolute; top: 0.6rem; left: 0.6rem; font-size: 0.65rem; font-weight: 800; padding: 0.25rem 0.75rem; border-radius: 12px; text-transform: uppercase; }

                .card-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }
                .content-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
                .content-top h3 { font-size: 1.4rem; font-weight: 800; }
                .config-tag { font-size: 0.7rem; background: var(--primary-glow); color: var(--primary); font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 8px; }

                .content-meta { display: flex; gap: 1.5rem; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem; }
                .meta-box { display: flex; align-items: center; gap: 0.5rem; }

                .stall-pills { display: flex; flex-wrap: wrap; gap: 0.6rem; }
                .price-pill { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 12px; padding: 0.3rem 0.8rem; font-size: 0.8rem; }
                .p-name { color: var(--text-muted); border-right: 1px solid var(--border-glass); padding-right: 0.5rem; }
                .p-val { font-weight: 700; color: white; }
                .price-pill.more { border-style: dashed; color: var(--primary); }

                .card-actions { display: flex; flex-direction: column; justify-content: center; gap: 0.6rem; border-left: 1px solid var(--border-glass); padding-left: 2rem; }
                .tool-btn { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1.2rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600; text-decoration: none; border: 1px solid transparent; transition: all 0.2s; cursor: pointer; background: transparent; color: var(--text-muted); }
                
                .tool-btn.edit { background: rgba(139, 92, 246, 0.05); color: var(--primary); }
                .tool-btn.edit:hover { background: var(--primary); color: white; }
                
                .tool-btn.preview { background: rgba(6, 182, 212, 0.05); color: var(--accent); }
                .tool-btn.preview:hover { background: var(--accent); color: white; }
                
                .tool-btn.delete:hover { background: #ef4444; color: white; border-color: #ef4444; }

                @media (max-width: 900px) {
                    .event-dashboard-card { flex-direction: column; padding: 1.5rem; align-items: stretch; text-align: center; }
                    .card-thumb { width: 100%; height: 180px; }
                    .content-top, .content-meta, .stall-pills { justify-content: center; }
                    .card-actions { border-left: none; border-top: 1px solid var(--border-glass); padding-left: 0; padding-top: 1.5rem; flex-direction: row; justify-content: center; }
                }

                .empty-dashboard { padding: 5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .empty-icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 1rem; }
                .empty-dashboard h3 { font-size: 2rem; font-weight: 800; }
                .empty-dashboard p { color: var(--text-muted); max-width: 450px; }

                .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; gap: 1.5rem; }
                .loading-container p { color: var(--text-muted); font-weight: 500; font-size: 1.1rem; }
            `}} />
        </div>
    );
}
