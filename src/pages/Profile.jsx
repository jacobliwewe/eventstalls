import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    User, Mail, Shield, Camera, Edit2, Save, X,
    Loader2, CheckCircle2, AlertCircle, Phone
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
    const { user, updateUserData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        photoURL: user?.photoURL || '',
        phone: user?.phone || ''
    });
    const fileInputRef = useRef(null);

    if (!user) {
        return (
            <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
                    <AlertCircle size={48} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
                    <h2>Access Denied</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Please sign in to view your profile.</p>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        setUploadingImage(true);
        setUploadProgress(0);
        const uploadData = new FormData();
        uploadData.append('image', file);

        const xhr = new XMLHttpRequest();
        const API_URL = 'https://unimarket-mw.com/eventstalls/api/upload.php';

        xhr.open('POST', API_URL, true);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.status === 'success') {
                        setFormData(prev => ({ ...prev, photoURL: data.url }));
                        toast.success("Profile picture uploaded!");
                    } else {
                        toast.error(data.message || "Upload failed");
                    }
                } catch (e) {
                    toast.error("Failed to parse server response");
                }
            } else {
                toast.error("Server communication failed");
            }
            setUploadingImage(false);
            setUploadProgress(0);
        };

        xhr.onerror = () => {
            toast.error("Failed to connect to upload server");
            setUploadingImage(false);
            setUploadProgress(0);
        };

        xhr.send(uploadData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateUserData({
                name: formData.name,
                photoURL: formData.photoURL,
                phone: formData.phone
            });
            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '3rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Account Settings</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage your profile and preferences</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }} className="profile-grid">
                {/* Left Column: Avatar and Quick Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem', borderRadius: '50%', background: 'var(--bg-dark)', border: '2px solid var(--border-glass)', overflow: 'hidden' }}>
                            {formData.photoURL || user.photoURL ? (
                                <img
                                    src={isEditing ? formData.photoURL : (user.photoURL || formData.photoURL)}
                                    alt={user.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white' }}>{user.name?.charAt(0).toUpperCase()}</span>
                                </div>
                            )}

                            {isEditing && (
                                <button
                                    className="upload-btn-overlay"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                >
                                    {uploadingImage ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                            <Loader2 className="animate-spin" size={24} />
                                            <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>{uploadProgress}%</span>
                                        </div>
                                    ) : <Camera size={24} />}
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {uploadingImage && (
                            <div style={{ marginBottom: '1rem', width: '100%' }}>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--primary)', transition: 'width 0.2s ease' }}></div>
                                </div>
                            </div>
                        )}

                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>{user.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{user.email}</p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <div className="badge">
                                <Shield size={12} />
                                <span style={{ textTransform: 'capitalize' }}>{user.role || 'User'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Account Health</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <CheckCircle2 size={16} color={user.emailVerified ? "#4ade80" : "var(--text-muted)"} />
                                <span style={{ color: user.emailVerified ? "var(--text-main)" : "var(--text-muted)" }}>Email Verified</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <CheckCircle2 size={16} color="#4ade80" />
                                <span style={{ color: "var(--text-main)" }}>Security Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Personal Information</h3>
                        {!isEditing && (
                            <button className="btn btn-outline" onClick={() => setIsEditing(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                <Edit2 size={14} style={{ marginRight: '0.5rem' }} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="input-field">
                            <label><User size={14} style={{ marginRight: '0.5rem' }} /> Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={isEditing ? formData.name : user.name}
                                onChange={handleInputChange}
                                disabled={!isEditing || isLoading}
                                placeholder="Enter your full name"
                                className={!isEditing ? "readonly-input" : ""}
                            />
                        </div>

                        <div className="input-field">
                            <label><Mail size={14} style={{ marginRight: '0.5rem' }} /> Email Address</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="readonly-input"
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Email cannot be changed as it is linked to your login provider.</p>
                        </div>

                        <div className="input-field">
                            <label><Phone size={14} style={{ marginRight: '0.5rem' }} /> Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={isEditing ? formData.phone : (user.phone || 'Not provided')}
                                onChange={handleInputChange}
                                disabled={!isEditing || isLoading}
                                placeholder="e.g. +265 888 123 456"
                                className={!isEditing ? "readonly-input" : ""}
                            />
                        </div>

                        {isEditing && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading || uploadingImage}>
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Save Changes</>}
                                </button>
                                <button type="button" className="btn btn-outline" style={{ flex: 0.5 }} onClick={() => { setIsEditing(false); setFormData({ name: user.name, photoURL: user.photoURL, phone: user.phone || '' }); }} disabled={isLoading}>
                                    <X size={18} style={{ marginRight: '0.5rem' }} /> Cancel
                                </button>
                            </div>
                        )}
                    </form>

                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Technical Details</h4>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            User ID: {user.uid}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-grid {
                    grid-template-columns: 1fr 2fr;
                }
                @media (max-width: 768px) {
                    .profile-grid { grid-template-columns: 1fr; }
                }
                .upload-btn-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(2px);
                    border: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .upload-btn-overlay:hover {
                    opacity: 1;
                }
                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.35rem 0.8rem;
                    border-radius: 100px;
                    background: rgba(139, 92, 246, 0.1);
                    color: var(--primary);
                    font-size: 0.75rem;
                    font-weight: 600;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                }
                .input-field label {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0.6rem;
                    font-weight: 500;
                    color: var(--text-main);
                }
                .readonly-input {
                    border-color: transparent !important;
                    background: rgba(255, 255, 255, 0.05) !important;
                    cursor: default;
                    color: var(--text-muted) !important;
                }
            `}} />
        </div>
    );
}
