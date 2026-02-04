import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import {
    Clock, CheckCircle, XCircle, Search,
    Loader2, Calendar, User, ShoppingBag,
    CreditCard, ExternalLink, Download, ShieldCheck
} from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';

export default function Transactions() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [verifyingIds, setVerifyingIds] = useState(new Set()); // Track in-session verifications

    useEffect(() => {
        if (!user) return;

        let q;
        if (user.role === 'admin') {
            // Admins see everything
            q = query(
                collection(db, 'bookings'),
                orderBy('createdAt', 'desc')
            );
        } else {
            // Normal users see only their own
            q = query(
                collection(db, 'bookings'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTransactions(data);
            setLoading(false);
        }, (error) => {
            console.error("Firestore transactions error:", error);
            toast.error("Failed to load transaction history");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Auto-verify pending transactions
    useEffect(() => {
        try {
            // All pending transactions are now considered auditable 
            // strictly using the official tx_ref field saved in Firestore
            const pending = transactions.filter(t =>
                (t.status === 'pending' || !t.status) &&
                !verifyingIds.has(t.id)
            );

            if (pending.length > 0) {
                console.log(`Auditing ${pending.length} pending transactions...`);
                pending.forEach(tx => {
                    setVerifyingIds(prev => new Set(prev).add(tx.id));
                    verifyTransaction(tx);
                });
            }
        } catch (err) {
            console.error("Auto-audit useEffect crash:", err);
        }
    }, [transactions, verifyingIds]);

    const verifyTransaction = async (tx) => {
        if (!tx.tx_ref) {
            console.log(`Skipping verification for ${tx.id}: No tx_ref found.`);
            return;
        }

        console.log(`Starting verification for ${tx.id} with ref ${tx.tx_ref}`);

        try {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer sec-live-Bg66AXsH6yJAskyTguhXjrzH06O62L6H'
                }
            };

            const response = await fetch(`https://api.paychangu.com/verify-payment/${tx.tx_ref}`, options);

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errText}`);
            }

            const result = await response.json();
            console.log(`API Result for ${tx.id}:`, result);

            if (result.status === 'success') {
                if (result.data?.status === 'success') {
                    const bookingRef = doc(db, 'bookings', tx.id);

                    await updateDoc(bookingRef, {
                        status: 'paid',
                        paymentStatus: 'completed',
                        paychanguRef: result.data.reference,
                        verifiedAt: new Date().toISOString()
                    });

                    toast.success(`Verified: ${tx.eventName} for ${tx.name}`);

                    // Send Email Permit
                    sendPermitEmail({ ...tx, id: tx.id });
                } else {
                    toast.info(`Payment for ${tx.eventName} is ${result.data?.status || 'not found'}.`, {
                        description: "The transaction might not be completed yet."
                    });
                }
            } else {
                toast.error(`Verification failed: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(`Verification error for ${tx.id}:`, error);
            toast.error("Network error during verification. Please try again.");
        } finally {
            setVerifyingIds(prev => {
                const next = new Set(prev);
                next.delete(tx.id);
                return next;
            });
        }
    };

    const sendPermitEmail = (data) => {
        const serviceId = 'service_placeholder';
        const templateId = 'template_placeholder';
        const publicKey = 'public_key_placeholder';

        if (serviceId === 'service_placeholder') return;

        const templateParams = {
            to_name: data.name,
            to_email: data.email,
            event_name: data.eventName,
            stall_name: data.stallName,
            amount: data.price,
            booking_id: data.id,
            duration: data.duration === 'day' ? '1 Day' : '1 Week'
        };

        emailjs.send(serviceId, templateId, templateParams, publicKey)
            .catch(err => console.error("EmailJS Error in Ledger:", err));
    };

    const filteredTransactions = transactions.filter(t =>
        t.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.stallName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="status-container">
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p>Syncing ledger history...</p>
            </div>
        );
    }

    return (
        <div className="transactions-page animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="text-gradient">Financial Ledger</h1>
                    <p>{user?.role === 'admin' ? 'Monitoring all platform financial activity.' : 'Track your bookings and permit history.'}</p>
                </div>
                <div className="header-actions">
                    <div className="search-box glass-panel">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="stats-summary">
                <div className="stat-pill glass-panel">
                    <span className="label">Total Volume</span>
                    <span className="val">MK {transactions.reduce((acc, t) => acc + (t.status === 'paid' ? t.price : 0), 0).toLocaleString()}</span>
                </div>
                <div className="stat-pill glass-panel">
                    <span className="label">Successful</span>
                    <span className="val">{transactions.filter(t => t.status === 'paid').length}</span>
                </div>
                <div className="stat-pill glass-panel">
                    <span className="label">Awaiting</span>
                    <span className="val">{transactions.filter(t => t.status === 'pending').length}</span>
                </div>
            </div>

            <div className="transactions-list">
                {filteredTransactions.length > 0 ? (
                    <div className="ledger-table-container glass-panel">
                        <table className="ledger-table">
                            <thead>
                                <tr>
                                    <th>Ref / Date</th>
                                    <th>Event & Stall</th>
                                    {user?.role === 'admin' && <th>Customer</th>}
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>
                                            <div className="ref-cell">
                                                <span className="tx-id">#{tx.id.substring(0, 8)}</span>
                                                <span className="tx-date">{tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : 'Recent'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="info-cell">
                                                <span className="ev-name">{tx.eventName}</span>
                                                <span className="st-name">{tx.stallName}</span>
                                            </div>
                                        </td>
                                        {user?.role === 'admin' && (
                                            <td>
                                                <div className="user-cell">
                                                    <span className="u-name">{tx.name}</span>
                                                    <span className="u-email">{tx.email}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <span className="price-tag">MK {tx.price?.toLocaleString()}</span>
                                        </td>
                                        <td>
                                            <div className={`status-pill ${tx.status}`}>
                                                {tx.status === 'paid' && <CheckCircle size={14} />}
                                                {tx.status === 'pending' && <Clock size={14} />}
                                                {tx.status === 'failed' && <XCircle size={14} />}
                                                <span className="capitalize">{tx.status || 'pending'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                {tx.status === 'paid' && (
                                                    <button className="icon-btn" title="Download Permit">
                                                        <Download size={18} />
                                                    </button>
                                                )}
                                                {(tx.status === 'pending' || !tx.status) && (
                                                    <button
                                                        className={`icon-btn ${verifyingIds.has(tx.id) ? 'verifying' : ''}`}
                                                        title="Verify Payment"
                                                        onClick={() => {
                                                            if (verifyingIds.has(tx.id)) return;
                                                            toast.info(`Verifying payment for ${tx.eventName}...`);
                                                            setVerifyingIds(prev => new Set(prev).add(tx.id));
                                                            verifyTransaction(tx);
                                                        }}
                                                        disabled={verifyingIds.has(tx.id)}
                                                    >
                                                        {verifyingIds.has(tx.id) ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                                    </button>
                                                )}
                                                <Link to={`/book/${tx.eventId}`} className="icon-btn" title="View Event">
                                                    <ExternalLink size={18} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-ledger glass-panel">
                        <ShoppingBag size={48} color="var(--text-muted)" />
                        <h3>No activity recorded</h3>
                        <p>When you or your vendors start booking, transaction records will appear here.</p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .transactions-page { padding: 3rem 0; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; gap: 2rem; }
                @media (max-width: 768px) { .page-header { flex-direction: column; align-items: stretch; text-align: center; } }
                
                .page-header h1 { font-size: 2.8rem; font-weight: 800; margin-bottom: 0.5rem; }
                .page-header p { color: var(--text-muted); font-size: 1.1rem; }
                
                .search-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; border-radius: 14px; width: 320px; }
                .search-box input { background: transparent; border: none; color: white; width: 100%; outline: none; }
                @media (max-width: 768px) { .search-box { width: 100%; } }

                .stats-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
                .stat-pill { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; border-radius: 20px; }
                .stat-pill .label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
                .stat-pill .val { font-size: 1.8rem; font-weight: 800; color: white; }
                @media (max-width: 600px) { .stats-summary { grid-template-columns: 1fr; } }

                .ledger-table-container { overflow-x: auto; border-radius: 24px; }
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px; }
                .ledger-table th { padding: 1.25rem 1.5rem; background: rgba(255,255,255,0.02); color: var(--text-muted); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .ledger-table td { padding: 1.25rem 1.5rem; border-top: 1px solid var(--border-glass); vertical-align: middle; }
                .ledger-table tr { transition: background 0.2s; }
                .ledger-table tr:hover { background: rgba(255,255,255,0.01); }

                .ref-cell { display: flex; flex-direction: column; }
                .tx-id { color: var(--primary); font-family: monospace; font-weight: 700; }
                .tx-date { font-size: 0.8rem; color: var(--text-muted); }

                .info-cell, .user-cell { display: flex; flex-direction: column; }
                .ev-name, .u-name { font-weight: 700; color: var(--text-main); }
                .st-name, .u-email { font-size: 0.85rem; color: var(--text-muted); }

                .price-tag { font-weight: 800; color: white; font-size: 1.1rem; }

                .status-pill { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
                .status-pill.paid { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill.failed { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .capitalize { text-transform: capitalize; }

                .row-actions { display: flex; gap: 0.5rem; }
                .icon-btn { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
                .icon-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
                .icon-btn.verifying { opacity: 0.7; pointer-events: none; color: var(--primary); }
                
                .status-note { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: help; }

                .empty-ledger { padding: 5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
                .empty-ledger p { color: var(--text-muted); max-width: 400px; }

                .status-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 1.5rem; }
            `}} />
        </div>
    );
}
