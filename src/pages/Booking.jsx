import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import {
    Check, AlertCircle, Loader2, ArrowLeft,
    User, Phone, Mail, ShoppingBag,
    Clock, Calendar, MapPin, CreditCard,
    ShieldCheck, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function Booking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        stallType: '',
        duration: 'day',
        stallName: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone
            }));
        }
    }, [user]);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const docRef = doc(db, 'events', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() });
                } else {
                    toast.error("Event not found");
                }
            } catch (error) {
                console.error("Error fetching event:", error);
                toast.error("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();

        // Security check: only logged in users can book
        if (!loading && !user) {
            toast.error("Please sign in to book a stall");
            navigate('/signin', { state: { from: `/book/${id}` } });
        }
    }, [id, user, loading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const selectedStall = useMemo(() => {
        if (!event || !formData.stallType) return null;
        return event.stallTypes.find(s => s.id.toString() === formData.stallType.toString());
    }, [event, formData.stallType]);

    const price = useMemo(() => {
        if (!selectedStall) return 0;
        return formData.duration === 'day' ? Number(selectedStall.dailyPrice) : Number(selectedStall.weeklyPrice);
    }, [selectedStall, formData.duration]);

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!selectedStall) {
            toast.error("Please select a stall type first");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Create a pending booking in Firestore
            const bookingRef = await addDoc(collection(db, 'bookings'), {
                ...formData,
                userId: user?.uid || 'guest',
                eventId: id,
                eventName: event.title,
                price,
                status: 'pending',
                paymentStatus: 'awaiting_initiation',
                createdAt: serverTimestamp()
            });

            // 2. Prepare PayChangu Payment Initiation
            // Using a unique numeric reference as requested (timestamp + 4 random digits)
            const tx_ref = `${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

            // Save tx_ref back to doc for verification ledger
            await updateDoc(bookingRef, { tx_ref });

            // Note: In a production app, the Secret Key should BE HIDDEN in environment variables
            // and the payment initiation should ideally happen on a secure backend server.
            // Since this is a client-side direct implementation as per user request:
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: 'Bearer sec-live-Bg66AXsH6yJAskyTguhXjrzH06O62L6H' // Secure key provided by user
                },
                body: JSON.stringify({
                    currency: 'MWK',
                    amount: price.toString(),
                    tx_ref: tx_ref,
                    first_name: formData.name.split(' ')[0] || 'User',
                    last_name: formData.name.split(' ')[1] || 'User',
                    email: formData.email,
                    callback_url: 'https://eventstalls.vercel.app/success', // Assuming a success route
                    return_url: window.location.origin + '/success' // Return to success for verification
                })
            };

            const response = await fetch('https://api.paychangu.com/payment', options);
            const resData = await response.json();

            if (resData.status === 'success' && resData.data?.checkout_url) {
                // 3. CAPTURE OFFICIAL TX_REF AND UPDATE FIRESTORE
                // PayChangu might return a different ref or we use ours, 
                // but we must ensure what we use for verification is what they have.
                const officialRef = resData.data.tx_ref || tx_ref;

                await updateDoc(bookingRef, {
                    tx_ref: officialRef,
                    paymentStatus: 'initiated'
                });

                toast.success("Redirecting to secure payment...");
                window.location.href = resData.data.checkout_url;
            } else {
                console.error("PayChangu Error:", resData);
                throw new Error(resData.message || "Could not initiate payment gateway");
            }

        } catch (error) {
            console.error("Booking/Payment error:", error);
            toast.error("Failed to process booking: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p>Curating event details...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="empty-state container">
                <AlertCircle size={64} color="#f87171" />
                <h2>Event Disappeared</h2>
                <p>We couldn't find the event you're looking for. It might have been moved or removed.</p>
                <Link to="/" className="btn btn-outline">Back to HUB</Link>
            </div>
        );
    }

    return (
        <div className="booking-page animate-fade-in">
            <div className="container">
                <Link to="/" className="back-btn">
                    <ArrowLeft size={18} />
                    <span>Explore More Events</span>
                </Link>

                <div className="booking-layout">
                    {/* Main Content: Form */}
                    <div className="booking-main">
                        <header className="booking-header">
                            <h1 className="text-gradient">Secure Your Spot</h1>
                            <p>Fill in your business details to reserve your stall at {event.title}.</p>
                        </header>

                        <form onSubmit={handlePayment} className="premium-form">
                            <div className="form-section">
                                <div className="section-head">
                                    <User size={18} className="text-violet" />
                                    <h3>Personal Credentials</h3>
                                </div>
                                <div className="input-grid">
                                    <div className="input-group">
                                        <label>Full Name</label>
                                        <div className="input-icon-box">
                                            <User size={14} className="field-icon" />
                                            <input type="text" name="name" required placeholder="Jacob Liwewe" value={formData.name} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Contact Number</label>
                                        <div className="input-icon-box">
                                            <Phone size={14} className="field-icon" />
                                            <input type="tel" name="phone" required placeholder="+265 99..." value={formData.phone} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <div className="input-icon-box">
                                        <Mail size={14} className="field-icon" />
                                        <input type="email" name="email" required placeholder="liwewe@mubas.ac.mw" value={formData.email} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-head">
                                    <ShoppingBag size={18} className="text-pink" />
                                    <h3>Business Branding</h3>
                                </div>
                                <div className="input-group">
                                    <label>Stall Display Name</label>
                                    <div className="input-icon-box">
                                        <Sparkles size={14} className="field-icon" />
                                        <input type="text" name="stallName" required placeholder="e.g. MUBAS Gourmet Kitchen" value={formData.stallName} onChange={handleChange} />
                                    </div>
                                    <p className="field-hint">This name will be visible to all event attendees.</p>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-head">
                                    <Clock size={18} className="text-cyan" />
                                    <h3>Stall Configuration</h3>
                                </div>
                                <div className="input-grid">
                                    <div className="input-group">
                                        <label>Category</label>
                                        <select name="stallType" required value={formData.stallType} onChange={handleChange}>
                                            <option value="">Choose a tier</option>
                                            {event.stallTypes.map(type => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Rental Duration</label>
                                        <div className="duration-toggle">
                                            <button
                                                type="button"
                                                className={formData.duration === 'day' ? 'active' : ''}
                                                onClick={() => setFormData(p => ({ ...p, duration: 'day' }))}
                                            >Daily</button>
                                            <button
                                                type="button"
                                                className={formData.duration === 'week' ? 'active' : ''}
                                                onClick={() => setFormData(p => ({ ...p, duration: 'week' }))}
                                            >Full Week</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-footer">
                                <div className="footer-left">
                                    {price > 0 && (
                                        <div className="footer-price animate-fade-in">
                                            <span className="price-label">Total Duo:</span>
                                            <span className="price-value">MK {price.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="security-notice">
                                        <ShieldCheck size={18} />
                                        <span>Payments secured by PayChangu</span>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary payment-btn" disabled={price === 0 || submitting}>
                                    {submitting ? (
                                        <><Loader2 className="animate-spin" /><span>Initializing...</span></>
                                    ) : (
                                        <><CreditCard size={18} /><span>Pay & Confirm</span></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar: Summary */}
                    <aside className="booking-sidebar">
                        <div className="summary-card glass-panel">
                            <div className="summary-artwork">
                                <img src={event.image} alt={event.title} />
                                <div className="artwork-overlay"></div>
                            </div>
                            <div className="summary-content">
                                <div className="event-info">
                                    <h3>{event.title}</h3>
                                    <div className="info-row">
                                        <Calendar size={14} />
                                        <span>{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span>
                                    </div>
                                    <div className="info-row">
                                        <MapPin size={14} />
                                        <span>{event.location}</span>
                                    </div>
                                </div>

                                <div className="price-breakdown">
                                    <h4>Order Summary</h4>
                                    <div className="summary-row">
                                        <span>Stall Tier</span>
                                        <span>{selectedStall ? selectedStall.name : 'Not selected'}</span>
                                    </div>
                                    <div className="summary-row border-top">
                                        <span className="total-label">Total Amount</span>
                                        <span className="total-price">MK {price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="help-box">
                            <h4>Need Assistance?</h4>
                            <p>Contact support at support@mubasevents.com or call +265 888 123 456</p>
                        </div>
                    </aside>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .booking-page { padding: 3rem 0; min-height: 100vh; }
                .loading-state, .empty-state { display: flex; flexDirection: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; }
                .loading-state p { margin-top: 1rem; color: var(--text-muted); font-weight: 500; }
                
                .back-btn { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-muted); text-decoration: none; margin-bottom: 2rem; font-size: 0.95rem; transition: color 0.3s; }
                .back-btn:hover { color: var(--text-main); }

                .booking-layout { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 3rem; align-items: start; }
                @media (max-width: 900px) { .booking-layout { grid-template-columns: 1fr; gap: 2rem; } }

                .booking-header { margin-bottom: 2.5rem; }
                .booking-header h1 { font-size: 2.8rem; font-weight: 800; margin-bottom: 0.5rem; }
                .booking-header p { color: var(--text-muted); font-size: 1.1rem; }

                .form-section { background: rgba(30, 41, 59, 0.4); border: 1px solid var(--border-glass); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; }
                .section-head { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
                .section-head h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
                .text-violet { color: var(--primary); }
                .text-pink { color: var(--secondary); }
                .text-cyan { color: var(--accent); }

                .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
                @media (max-width: 500px) { .input-grid { grid-template-columns: 1fr; } }

                .input-group { margin-bottom: 1.25rem; }
                .input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; }
                .input-icon-box { position: relative; }
                .field-icon { position: absolute; left: 1rem; top: 1rem; color: var(--text-muted); opacity: 0.6; }
                .input-icon-box input { padding-left: 2.8rem; background: rgba(15, 23, 42, 0.4); height: 48px; }
                
                select { height: 48px; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-glass); border-radius: 12px; color: white; padding: 0 1rem; width: 100%; }
                
                .duration-toggle { display: flex; background: rgba(15, 23, 42, 0.4); padding: 0.25rem; border-radius: 12px; height: 48px; border: 1px solid var(--border-glass); }
                .duration-toggle button { flex: 1; border: none; background: transparent; color: var(--text-muted); border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
                .duration-toggle button.active { background: var(--primary); color: white; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3); }

                .field-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem; padding-left: 0.2rem; }

                .payment-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 2rem; background: rgba(139, 92, 246, 0.05); padding: 1.5rem; borderRadius: 20px; border: 1px dashed var(--primary-glow); }
                @media (max-width: 600px) { 
                    .payment-footer { flex-direction: column; gap: 1.5rem; align-items: stretch; text-align: center; } 
                    .footer-left { align-items: center; }
                }
                .footer-left { display: flex; flex-direction: column; gap: 1rem; }
                .footer-price { display: flex; flex-direction: column; line-height: 1.2; }
                .price-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                .price-value { font-size: 1.8rem; font-weight: 800; color: var(--primary); }
                .security-notice { display: flex; align-items: center; gap: 0.6rem; color: #10b981; font-size: 0.85rem; font-weight: 600; }
                .payment-btn { height: 56px; padding: 0 2rem; display: flex; gap: 0.75rem; font-size: 1.05rem; box-shadow: 0 10px 20px var(--primary-glow); }

                .booking-sidebar { position: sticky; top: 100px; }
                .summary-card { border-radius: 28px; overflow: hidden; }
                .summary-artwork { height: 160px; position: relative; }
                .summary-artwork img { width: 100%; height: 100%; object-fit: cover; }
                .artwork-overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--bg-card), transparent); }
                
                .summary-content { padding: 1.5rem; }
                .event-info { margin-bottom: 2rem; }
                .event-info h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; }
                .info-row { display: flex; align-items: center; gap: 0.6rem; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.4rem; }
                
                .price-breakdown { background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border-glass); }
                .summary-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem; }
                .summary-row.border-top { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-glass); color: var(--text-main); }
                .total-label { font-weight: 700; font-size: 1.1rem; }
                .total-price { font-size: 1.8rem; font-weight: 800; color: var(--primary); }

                .help-box { margin-top: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid var(--border-glass); text-align: center; }
                .help-box h4 { margin-bottom: 0.5rem; color: var(--text-main); }
                .help-box p { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }
            `}} />
        </div>
    );
}
