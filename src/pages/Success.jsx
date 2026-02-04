import { useEffect, useState } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2, ArrowRight, Mail } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';

export default function Success() {
    const [searchParams] = useSearchParams();
    const tx_ref = searchParams.get('tx_ref');
    const [status, setStatus] = useState('verifying'); // verifying, success, failed, error
    const [bookingData, setBookingData] = useState(null);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!tx_ref) {
                setStatus('error');
                return;
            }

            try {
                // 1. Verify with PayChangu
                const options = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: 'Bearer sec-live-Bg66AXsH6yJAskyTguhXjrzH06O62L6H'
                    }
                };

                const response = await fetch(`https://api.paychangu.com/verify-payment/${tx_ref}`, options);
                const result = await response.json();

                if (result.status === 'success' && result.data?.status === 'success') {
                    // 2. Find booking by official tx_ref field
                    const q = query(collection(db, 'bookings'), where('tx_ref', '==', tx_ref));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const bookingDoc = querySnapshot.docs[0];
                        const bookingRef = doc(db, 'bookings', bookingDoc.id);
                        const data = bookingDoc.data();

                        setBookingData({ id: bookingDoc.id, ...data });

                        // 3. Update Firestore
                        await updateDoc(bookingRef, {
                            status: 'paid',
                            paymentStatus: 'completed',
                            paychanguRef: result.data.reference,
                            verifiedAt: new Date().toISOString()
                        });

                        setStatus('success');

                        // 4. Send Email Permit
                        sendPermitEmail({ id: bookingDoc.id, ...data });
                    } else {
                        console.error("Booking record with ref not found in Firestore:", tx_ref);
                        setStatus('failed');
                    }
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [tx_ref]);

    const sendPermitEmail = (data) => {
        // NOTE: User needs to provide Service ID, Template ID and Public Key
        // Placeholder values used below
        const serviceId = 'service_placeholder';
        const templateId = 'template_placeholder';
        const publicKey = 'public_key_placeholder';

        if (serviceId === 'service_placeholder') {
            console.log("EmailJS keys not configured yet. Skipping email.");
            return;
        }

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
            .then(() => {
                setEmailSent(true);
                toast.success("Permit sent to your email!");
            })
            .catch((err) => {
                console.error("EmailJS Error:", err);
                toast.error("Failed to send email permit.");
            });
    };

    if (status === 'verifying') {
        return (
            <div className="status-screen animate-fade-in">
                <Loader2 className="animate-spin" size={64} color="var(--primary)" />
                <h2>Securing Your Transaction</h2>
                <p>We are verifying your payment with PayChangu. Please don't close this window.</p>
            </div>
        );
    }

    if (status === 'failed' || status === 'error') {
        return (
            <div className="status-screen animate-fade-in">
                <XCircle size={80} color="#f87171" />
                <h1 className="text-gradient">Verification Failed</h1>
                <p>We couldn't confirm your payment. If you've been charged, please contact support with your TX Ref: <strong>{tx_ref}</strong></p>
                <div className="action-row">
                    <Link to="/" className="btn btn-outline">Back to Home</Link>
                    <a href="mailto:support@unimarket-mw.com" className="btn btn-primary">Contact Support</a>
                </div>
            </div>
        );
    }

    return (
        <div className="status-screen success-view animate-fade-in">
            <div className="success-card glass-panel">
                <div className="icon-badge">
                    <CheckCircle size={48} color="#10b981" />
                </div>

                <h1 className="text-gradient">Booking Secured!</h1>
                <p className="subtitle">Your stall at <strong>{bookingData?.eventName}</strong> is now confirmed.</p>

                <div className="permit-slip">
                    <div className="permit-header">
                        <h3>Booking Permit</h3>
                        <span className="permit-id">#{bookingData?.id?.substring(0, 8)}</span>
                    </div>

                    <div className="permit-details">
                        <div className="p-row">
                            <span className="p-label">Stall Name</span>
                            <span className="p-value">{bookingData?.stallName}</span>
                        </div>
                        <div className="p-row">
                            <span className="p-label">Duration</span>
                            <span className="p-value capitalize">{bookingData?.duration === 'day' ? '1 Day' : '1 Week'}</span>
                        </div>
                        <div className="p-row border-top">
                            <span className="p-label">Amount Paid</span>
                            <span className="p-value highlight">MK {bookingData?.price?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {emailSent && (
                    <div className="email-status">
                        <Mail size={16} />
                        <span>Permit sent to {bookingData?.email}</span>
                    </div>
                )}

                <div className="next-steps">
                    <Link to="/profile" className="btn btn-primary">
                        <span>Go to My Bookings</span>
                        <ArrowRight size={18} />
                    </Link>
                    <Link to="/" className="btn btn-outline">Back to Hub</Link>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .status-screen { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; }
                .status-screen h2 { margin-top: 1.5rem; font-size: 2rem; }
                .status-screen p { color: var(--text-muted); max-width: 500px; margin-top: 0.5rem; }
                
                .success-view { padding-top: 4rem; }
                .success-card { max-width: 550px; width: 100%; padding: 3rem; border-radius: 32px; position: relative; }
                .icon-badge { display: inline-flex; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 50%; margin-bottom: 2rem; }
                
                .subtitle { font-size: 1.1rem; margin-bottom: 2.5rem; }
                
                .permit-slip { background: rgba(0,0,0,0.2); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem; border-left: 4px solid #10b981; text-align: left; }
                .permit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
                .permit-header h3 { font-size: 1.2rem; font-weight: 700; margin: 0; }
                .permit-id { font-family: monospace; color: var(--text-muted); font-size: 0.9rem; }
                
                .p-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem; }
                .p-label { color: var(--text-muted); }
                .p-value { font-weight: 600; }
                .p-value.capitalize { text-transform: capitalize; }
                .p-value.highlight { color: var(--accent); font-size: 1.2rem; font-weight: 800; }
                .border-top { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-glass); }
                
                .email-status { display: flex; align-items: center; gap: 0.5rem; color: #10b981; font-size: 0.85rem; font-weight: 600; margin-bottom: 2rem; justify-content: center; }
                
                .action-row, .next-steps { display: flex; gap: 1rem; width: 100%; justify-content: center; }
                @media (max-width: 500px) { .action-row, .next-steps { flex-direction: column; } }
                
                .next-steps .btn { flex: 1; height: 52px; display: flex; align-items: center; justify-content: center; gap: 0.75rem; border-radius: 14px; }
            `}} />
        </div>
    );
}
