import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import {
    Plus, Trash2, Upload, Loader2, ArrowLeft,
    Image as ImageIcon, MapPin, Calendar, Info,
    Sparkles, ShieldCheck, Zap
} from 'lucide-react';

export default function CreateEvent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [eventData, setEventData] = useState({
        title: '',
        date: '',
        location: '',
        description: '',
        image: ''
    });

    const [stallTypes, setStallTypes] = useState([
        { id: Date.now(), name: '', dailyPrice: '', weeklyPrice: '' }
    ]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({ ...prev, [name]: value }));
    };

    const formatCurrency = (val) => {
        if (!val) return '';
        const num = val.toString().replace(/[^\d]/g, '');
        return new Intl.NumberFormat('en-US').format(num);
    };

    const parseCurrency = (val) => {
        return val.toString().replace(/[^\d]/g, '');
    };

    const handleStallChange = (id, field, value) => {
        let finalValue = value;
        if (field === 'dailyPrice' || field === 'weeklyPrice') {
            finalValue = formatCurrency(value);
        }
        setStallTypes(prev => prev.map(stall =>
            stall.id === id ? { ...stall, [field]: finalValue } : stall
        ));
    };

    const addStallType = () => {
        setStallTypes(prev => [...prev, { id: Date.now(), name: '', dailyPrice: '', weeklyPrice: '' }]);
    };

    const removeStallType = (id) => {
        if (stallTypes.length > 1) {
            setStallTypes(prev => prev.filter(stall => stall.id !== id));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const API_URL = 'https://unimarket-mw.com/eventstalls/api/upload.php';
            const response = await fetch(API_URL, { method: 'POST', body: formData });

            if (!response.ok) throw new Error("Server communication failed");

            const data = await response.json();
            if (data.status === 'success') {
                setEventData(prev => ({ ...prev, image: data.url }));
                toast.success("Artwork uploaded to secure server!");
            } else {
                throw new Error(data.message || "Upload failed");
            }
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error("Failed to upload: " + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!eventData.image) {
            toast.error("An event needs artwork to be published!");
            return;
        }

        setLoading(true);
        try {
            const finalEventData = {
                ...eventData,
                stallTypes: stallTypes.map(s => ({
                    id: s.name.toLowerCase().replace(/\s+/g, '-'),
                    name: s.name,
                    dailyPrice: Number(parseCurrency(s.dailyPrice)),
                    weeklyPrice: Number(parseCurrency(s.weeklyPrice))
                })),
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'events'), finalEventData);
            toast.success("Event is now LIVE!");
            navigate('/');
        } catch (error) {
            console.error("Error creating event:", error);
            toast.error("Failed to go live. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-event-page animate-fade-in">
            {/* Progress Bar */}
            {(loading || uploadingImage) && (
                <div className="global-progress">
                    <div className="progress-fill shimmer" style={{ width: uploadingImage ? '45%' : '90%' }}></div>
                </div>
            )}

            <div className="container">
                <Link to="/" className="back-link">
                    <ArrowLeft size={18} />
                    <span>Back to Home</span>
                </Link>

                <header className="page-header">
                    <div className="header-text">
                        <h1 className="text-gradient">Launch New Event</h1>
                        <p>Fill in the details to publish your event to the MUBAS community.</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="premium-form">
                    {/* Section 1: Event Details */}
                    <section className="form-section">
                        <div className="section-title">
                            <Info size={20} className="icon-violet" />
                            <h2>Core Information</h2>
                        </div>

                        <div className="input-grid">
                            <div className="input-group">
                                <label>Event Title</label>
                                <div className="input-with-icon">
                                    <Zap size={16} className="input-icon" />
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={eventData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Neon Nights 2024"
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Event Date</label>
                                <div className="input-with-icon">
                                    <Calendar size={16} className="input-icon" />
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={eventData.date}
                                        onChange={handleInputChange}
                                        className="premium-input-date"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Location</label>
                            <div className="input-with-icon">
                                <MapPin size={16} className="input-icon" />
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    value={eventData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g. MUBAS Campus Parking"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Event Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                required
                                value={eventData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the atmosphere, target audience, and highlights..."
                            ></textarea>
                        </div>
                    </section>

                    {/* Section 2: Artwork Upload */}
                    <section className="form-section">
                        <div className="section-title">
                            <ImageIcon size={20} className="icon-pink" />
                            <h2>Event Artwork</h2>
                        </div>

                        <div className="upload-container">
                            <div className={`artwork-preview ${uploadingImage ? 'is-uploading' : ''}`}>
                                {eventData.image ? (
                                    <img src={eventData.image} alt="Artwork Preview" />
                                ) : (
                                    <div className="placeholder-content">
                                        <ImageIcon size={48} strokeWidth={1} />
                                        <span>No image selected</span>
                                    </div>
                                )}
                                {uploadingImage && (
                                    <div className="upload-overlay">
                                        <Loader2 className="animate-spin" size={32} />
                                        <span>UPLOADING</span>
                                    </div>
                                )}
                            </div>
                            <div className="upload-controls">
                                <h3>Select Poster</h3>
                                <p>Upload a high-resolution 16:9 artwork for best platform visibility.</p>
                                <input
                                    type="file"
                                    id="artwork-upload"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="artwork-upload" className="btn btn-primary upload-btn">
                                    <Upload size={18} />
                                    {eventData.image ? 'Change Artwork' : 'Upload Image'}
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Stalls & Pricing */}
                    <section className="form-section">
                        <div className="section-title-flex">
                            <div className="section-title">
                                < Zap size={20} className="icon-cyan" />
                                <h2>Stall Inventory</h2>
                            </div>
                            <button type="button" onClick={addStallType} className="btn-small">
                                <Plus size={16} />
                                <span>Add Stall</span>
                            </button>
                        </div>

                        <div className="stall-list">
                            {stallTypes.map((stall) => (
                                <div key={stall.id} className="stall-card animate-fade-in">
                                    <div className="stall-main-info">
                                        <label>Category Label</label>
                                        <input
                                            type="text"
                                            value={stall.name}
                                            onChange={(e) => handleStallChange(stall.id, 'name', e.target.value)}
                                            placeholder="e.g. Premium Food"
                                            required
                                        />
                                    </div>
                                    <div className="stall-pricing">
                                        <div className="price-input">
                                            <label>Daily (MK)</label>
                                            <input
                                                type="text"
                                                value={stall.dailyPrice}
                                                onChange={(e) => handleStallChange(stall.id, 'dailyPrice', e.target.value)}
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                        <div className="price-input">
                                            <label>Weekly (MK)</label>
                                            <input
                                                type="text"
                                                value={stall.weeklyPrice}
                                                onChange={(e) => handleStallChange(stall.id, 'weeklyPrice', e.target.value)}
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-delete"
                                            onClick={() => removeStallType(stall.id)}
                                            disabled={stallTypes.length === 1}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <footer className="form-footer">
                        <div className="footer-info">
                            <ShieldCheck size={20} className="icon-violet" />
                            <div>
                                <h4>Ready to Publish?</h4>
                                <p>Double-check your pricing. Once live, vendors can book immediately.</p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary submit-btn"
                            disabled={loading || uploadingImage}
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" /><span>Syncing Records...</span></>
                            ) : (
                                <span>Go Live & Publish</span>
                            )}
                        </button>
                    </footer>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .create-event-page {
                    padding: 1rem 0;
                    min-height: 100vh;
                }
                .global-progress {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.05);
                    z-index: 10001;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                    transition: width 0.4s ease;
                }
                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-bottom: 2rem;
                    transition: color 0.2s;
                }
                .back-link:hover {
                    color: var(--text-main);
                }
                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .header-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 10px 20px var(--primary-glow);
                }
                .header-text h1 {
                    font-size: 2.8rem;
                    font-weight: 800;
                    line-height: 1.2;
                    margin-bottom: 0.2rem;
                }
                .header-text p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }
                .form-section {
                    background: var(--bg-card);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--border-glass);
                    border-radius: 24px;
                    padding: 1rem;
                    margin-bottom: 2.5rem;
                    transition: transform 0.3s;
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    margin-bottom: 2rem;
                }
                .section-title h2 {
                    font-size: 1.3rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                }
                .section-title-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .icon-violet { color: var(--primary); }
                .icon-pink { color: var(--secondary); }
                .icon-cyan { color: var(--accent); }

                .input-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                @media (max-width: 640px) {
                    .input-grid { grid-template-columns: 1fr; }
                    .page-header { flex-direction: column; text-align: center; }
                    .header-icon { margin: 0 auto; }
                }

                .input-group label {
                    font-weight: 600;
                    margin-bottom: 0.6rem;
                    color: var(--text-main);
                }
                .input-with-icon {
                    position: relative;
                }
                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .input-with-icon input {
                    padding-left: 2.8rem;
                    background: rgba(15, 23, 42, 0.4);
                }
                textarea {
                    background: rgba(15, 23, 42, 0.4);
                    padding: 1rem;
                    resize: none;
                }

                .upload-container {
                    display: flex;
                    gap: 3rem;
                    align-items: center;
                }
                @media (max-width: 768px) {
                    .upload-container { flex-direction: column; text-align: center; }
                }
                .artwork-preview {
                    width: 240px;
                    height: 160px;
                    border-radius: 20px;
                    background: #0a0f1d;
                    border: 2px dashed rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                }
                .artwork-preview img { width: 100%; height: 100%; objectFit: cover; }
                .placeholder-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .upload-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: var(--primary);
                    font-weight: 700;
                    font-size: 0.75rem;
                }
                .upload-controls h3 { margin-bottom: 0.5rem; }
                .upload-controls p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; }

                .btn-small {
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    color: var(--primary);
                    padding: 0.5rem 1rem;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-small:hover { background: rgba(139, 92, 246, 0.2); }

                .stall-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 18px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 1.5rem;
                    align-items: end;
                }
                @media (max-width: 640px) {
                    .stall-card { grid-template-columns: 1fr; }
                }
                .stall-pricing {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-end;
                }
                .price-input { width: 100px; }
                .btn-delete {
                    background: rgba(248, 113, 113, 0.1);
                    border: none;
                    color: #f87171;
                    padding: 0.7rem;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-delete:hover:not(:disabled) { background: rgba(248, 113, 113, 0.2); }
                .btn-delete:disabled { opacity: 0.2; cursor: not-allowed; }

                .form-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bg-card);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--border-glass);
                    border-radius: 24px;
                    padding: 2.5rem;
                    margin-top: 4rem;
                }
                @media (max-width: 768px) {
                    .form-footer { flex-direction: column; gap: 2rem; text-align: center; }
                    .footer-info { flex-direction: column; }
                }
                .footer-info { display: flex; gap: 1rem; align-items: flex-start; }
                .footer-info h4 { margin-bottom: 0.2rem; }
                .footer-info p { color: var(--text-muted); font-size: 0.85rem; }

                .submit-btn {
                    padding: 1.2rem 3rem;
                    font-size: 1.1rem;
                    box-shadow: 0 10px 30px var(--primary-glow);
                    gap: 0.8rem;
                }
                .shimmer {
                    background-size: 200% auto;
                    animation: shimmerAni 2s linear infinite;
                }
                @keyframes shimmerAni {
                    to { background-position: 200% center; }
                }
                .premium-input-date {
                    color-scheme: dark;
                }
            `}} />
        </div>
    );
}
