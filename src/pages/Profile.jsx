import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    User, Mail, Shield, Camera, Edit2, Save, X,
    Loader2, CheckCircle2, AlertCircle, Phone,
    Calendar, Key, ExternalLink
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

    // If user state is still loading or not available
    if (!user) {
        return (
            <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
                    <AlertCircle size={48} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Access Denied</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Please sign in to manage your account.</p>
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
                        toast.success("Profile picture updated!");
                    } else {
                        toast.error(data.message || "Upload failed");
                    }
                } catch (e) {
                    toast.error("Server response error");
                }
            } else {
                toast.error("Upload failed");
            }
            setUploadingImage(false);
            setUploadProgress(0);
        };

        xhr.onerror = () => {
            toast.error("Connection failed");
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
            toast.success("Changes saved successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Error updating profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="profile-container animate-fade-in">
            {/* Background Blobs for Atmosphere */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <div className="container content-layer">
                <header className="profile-header">
                    <div>
                        <h1 className="text-gradient">Account Settings</h1>
                        <p>Manage your account settings and preferences</p>
                    </div>
                </header>

                <div className="profile-layout">
                    {/* Left: Avatar & Badges */}
                    <aside className="profile-sidebar">
                        <section className="glass-panel profile-card">
                            <div className="avatar-wrapper">
                                <div className="avatar-circle">
                                    {(isEditing ? formData.photoURL : user.photoURL) || user.photoURL ? (
                                        <img
                                            src={isEditing ? formData.photoURL : user.photoURL}
                                            alt={user.name}
                                        />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <button
                                            className="avatar-edit-overlay"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            type="button"
                                            aria-label="Upload profile picture"
                                        >
                                            {uploadingImage ? (
                                                <div className="upload-loader">
                                                    <Loader2 className="animate-spin" size={24} />
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                            ) : <Camera size={24} />}
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>

                            {uploadingImage && (
                                <div className="upload-progress-bar-container">
                                    <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            )}

                            <div className="user-info-brief">
                                <h2>{user.name}</h2>
                                <p>{user.email}</p>
                            </div>

                            <div className="user-badges">
                                <div className="profile-badge">
                                    <Shield size={12} />
                                    <span>{user.role}</span>
                                </div>
                            </div>
                        </section>

                        <section className="glass-panel account-status">
                            <h3>Account Health</h3>
                            <ul className="status-list">
                                <li className={user.emailVerified ? 'active' : ''}>
                                    <CheckCircle2 size={16} />
                                    <span>Email Verified</span>
                                </li>
                                <li className="active">
                                    <CheckCircle2 size={16} />
                                    <span>Security Active</span>
                                </li>
                                <li className="active">
                                    <Calendar size={16} />
                                    <span>Member since 2024</span>
                                </li>
                            </ul>
                        </section>
                    </aside>

                    {/* Right: Main Form Content */}
                    <main className="profile-main-content">
                        <div className="glass-panel main-form-panel">
                            <header className="panel-header">
                                <div className="panel-title">
                                    <User size={20} className="icon-violet" />
                                    <h2>Personal Details</h2>
                                </div>
                                {!isEditing && (
                                    <button
                                        className="btn btn-outline edit-btn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit2 size={14} />
                                        <span>Edit Profile</span>
                                    </button>
                                )}
                            </header>

                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>
                                            <User size={14} /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={isEditing ? formData.name : user.name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || isLoading}
                                            placeholder="John Doe"
                                            className={!isEditing ? "input-readonly" : "input-editable"}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <Mail size={14} /> Email Address
                                        </label>
                                        <div className="input-with-icon-static">
                                            <input
                                                type="email"
                                                value={user.email}
                                                disabled
                                                className="input-readonly"
                                            />
                                            <Key size={14} className="input-lock-icon" />
                                        </div>
                                        <p className="input-hint">Email is managed by your provider.</p>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <Phone size={14} /> Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={isEditing ? formData.phone : (user.phone || 'Not set')}
                                            onChange={handleInputChange}
                                            disabled={!isEditing || isLoading}
                                            placeholder="+265 888 123 456"
                                            className={!isEditing ? "input-readonly" : "input-editable"}
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-save"
                                            disabled={isLoading || uploadingImage}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
                                            <span>Save Changes</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-cancel"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    name: user.name,
                                                    photoURL: user.photoURL,
                                                    phone: user.phone || ''
                                                });
                                            }}
                                            disabled={isLoading}
                                        >
                                            <X size={18} />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                )}
                            </form>

                            <footer className="panel-footer">
                                <div className="footer-meta">
                                    <h4>Technical Details</h4>
                                    <div className="uid-display">
                                        <code>UID: {user.uid}</code>
                                        <ExternalLink size={12} />
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </main>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-container {
                    position: relative;
                    padding: 4rem 0;
                    min-height: 100vh;
                    overflow: hidden;
                }

                .bg-blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: 1;
                    opacity: 0.15;
                    pointer-events: none;
                }

                .blob-1 {
                    width: 400px;
                    height: 400px;
                    background: var(--primary);
                    top: -100px;
                    right: -100px;
                }

                .blob-2 {
                    width: 300px;
                    height: 300px;
                    background: var(--secondary);
                    bottom: -50px;
                    left: -50px;
                }

                .content-layer {
                    position: relative;
                    z-index: 2;
                }

                .profile-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .profile-header h1 {
                    font-size: 3rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    margin-bottom: 0.5rem;
                }

                .profile-header p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }

                .profile-layout {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                @media (max-width: 900px) {
                    .profile-layout {
                        grid-template-columns: 1fr;
                    }
                    .profile-sidebar {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 2rem;
                    }
                }

                @media (max-width: 600px) {
                    .profile-sidebar {
                        grid-template-columns: 1fr;
                    }
                    .profile-header h1 {
                        font-size: 2.25rem;
                    }
                }

                .profile-card {
                    padding: 2.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .avatar-wrapper {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .avatar-circle {
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    background: var(--bg-dark);
                    padding: 4px;
                    border: 1px solid var(--border-glass);
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }

                .avatar-circle img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    font-size: 3rem;
                    font-weight: 800;
                    color: white;
                    border-radius: 50%;
                }

                .avatar-edit-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    border: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 50%;
                }

                .avatar-edit-overlay:hover {
                    opacity: 1;
                }

                .upload-loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                }

                .upload-loader span {
                    font-size: 0.7rem;
                    font-weight: 700;
                }

                .upload-progress-bar-container {
                    width: 100%;
                    height: 6px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 3px;
                    margin-bottom: 1rem;
                    overflow: hidden;
                }

                .upload-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                    transition: width 0.3s ease;
                }

                .user-info-brief h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .user-info-brief p {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                }

                .profile-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(139, 92, 246, 0.1);
                    color: var(--primary);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .account-status {
                    padding: 2rem;
                }

                .account-status h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                }

                .status-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .status-list li {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    transition: color 0.3s;
                }

                .status-list li.active {
                    color: var(--text-main);
                }

                .status-list li.active svg {
                    color: #4ade80;
                }

                .main-form-panel {
                    padding: 3rem;
                    height: 100%;
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }

                .panel-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .panel-title h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                }

                .edit-btn {
                    padding: 0.6rem 1.2rem;
                    font-size: 0.9rem;
                    gap: 0.5rem;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                @media (max-width: 1100px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 0.95rem;
                }

                .form-group input {
                    padding: 1rem 1.25rem;
                    background: rgba(15, 23, 42, 0.4);
                    border: 1px solid var(--border-glass);
                    border-radius: 12px;
                    transition: all 0.3s;
                }

                .input-readonly {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border-color: transparent !important;
                    color: var(--text-muted) !important;
                    cursor: default;
                }

                .input-editable:focus {
                    background: rgba(15, 23, 42, 0.6);
                    border-color: var(--primary);
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
                }

                .input-with-icon-static {
                    position: relative;
                }

                .input-lock-icon {
                    position: absolute;
                    right: 1.25rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    opacity: 0.5;
                }

                .input-hint {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-top: 0.5rem;
                    opacity: 0.7;
                }

                .form-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 3rem;
                }

                .btn-save {
                    flex: 2;
                    padding: 1rem;
                    gap: 0.75rem;
                }

                .btn-cancel {
                    flex: 1;
                    padding: 1rem;
                    gap: 0.75rem;
                }

                .panel-footer {
                    margin-top: 4rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border-glass);
                }

                .footer-meta h4 {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-muted);
                    margin-bottom: 1rem;
                }

                .uid-display {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.25rem;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }

                .uid-display code {
                    font-family: inherit;
                    opacity: 0.8;
                }

                .icon-violet {
                    color: var(--primary);
                }
            `}} />
        </div>
    );
}
