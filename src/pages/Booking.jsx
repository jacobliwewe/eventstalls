import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { EVENTS } from '../data/events';
import { Check, AlertCircle } from 'lucide-react';

export default function Booking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const event = EVENTS.find(e => e.id === Number(id));

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        stallType: '', // id of stall type
        duration: 'day', // 'day' or 'week'
        stallName: '' // Custom name for the stall
    });

    if (!event) {
        return <div className="container" style={{ paddingTop: '4rem' }}>Event not found</div>;
    }

    const selectedStall = event.stallTypes.find(s => s.id === formData.stallType);

    const price = useMemo(() => {
        if (!selectedStall) return 0;
        return formData.duration === 'day' ? selectedStall.dailyPrice : selectedStall.weeklyPrice;
    }, [selectedStall, formData.duration]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        navigate('/success', { state: { ...formData, eventName: event.title, price } });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Book a Stall</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    For <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{event.title}</span>
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label>Full Name</label>
                            <input type="text" name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} />
                        </div>
                        <div>
                            <label>Phone Number</label>
                            <input type="tel" name="phone" required placeholder="+265..." value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label>Email Address</label>
                        <input type="email" name="email" required placeholder="john@example.com" value={formData.email} onChange={handleChange} />
                    </div>

                    <div>
                        <label>Stall Name (Business Name)</label>
                        <input type="text" name="stallName" required placeholder="e.g. Tipsy Tiger Cocktails" value={formData.stallName} onChange={handleChange} />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-glass)', margin: '1rem 0' }}></div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label>Stall Type</label>
                            <select name="stallType" required value={formData.stallType} onChange={handleChange}>
                                <option value="">-- Select Type --</option>
                                {event.stallTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Duration</label>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'white' }}>
                                    <input
                                        type="radio"
                                        name="duration"
                                        value="day"
                                        checked={formData.duration === 'day'}
                                        onChange={handleChange}
                                        style={{ width: 'auto' }}
                                    />
                                    1 Day
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'white' }}>
                                    <input
                                        type="radio"
                                        name="duration"
                                        value="week"
                                        checked={formData.duration === 'week'}
                                        onChange={handleChange}
                                        style={{ width: 'auto' }}
                                    />
                                    Whole Week
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--primary-glow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Estimated Total</span>
                                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    MK {price.toLocaleString()}
                                </span>
                                {selectedStall && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        {selectedStall.name} • {formData.duration === 'day' ? 'Single Day Access' : 'Full Week Access'}
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={price === 0}>
                                Confirm Booking
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
