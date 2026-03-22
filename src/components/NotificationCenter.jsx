import { useState, useEffect } from 'react';
import { Bell, X, Check, ArrowRight, Info } from 'lucide-react';
import { api } from '../services/api';
import './NotificationCenter.css';

export default function NotificationCenter({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user')) || { id: 1 };

    useEffect(() => {
        if (isOpen) {
            const fetchNotifications = async () => {
                try {
                    const data = await api.getNotifications(user.id);
                    setNotifications(data.reverse());
                } catch (err) {
                    console.error("Failed to fetch notifications", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchNotifications();
        }
    }, [isOpen, user.id]);

    if (!isOpen) return null;

    return (
        <div className="notification-overlay animate-fade-in" onClick={onClose}>
            <div className="notification-panel glass-panel animate-slide-left" onClick={e => e.stopPropagation()}>
                <div className="notification-header">
                    <h2><Bell size={20} /> Notifications</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="notification-list">
                    {loading ? (
                        <div className="noti-empty">Loading alerts...</div>
                    ) : notifications.length > 0 ? (
                        notifications.map(noti => (
                            <div key={noti.id} className={`noti-item ${noti.type}`}>
                                <div className="noti-icon">
                                    {noti.type === 'request' ? <Bell size={16} /> : <Info size={16} />}
                                </div>
                                <div className="noti-content">
                                    <p>{noti.message}</p>
                                    <div className="noti-actions">
                                        {noti.type === 'request' ? (
                                            <button className="noti-btn-primary" onClick={() => window.location.href = `/club/${noti.clubId}`}>
                                                Manage <ArrowRight size={14} />
                                            </button>
                                        ) : (
                                            <button className="noti-btn-secondary" onClick={() => window.location.href = `/club/${noti.clubId}`}>
                                                View Club
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="noti-empty">
                            <Bell size={40} className="mb-3 opacity-20" />
                            <p>All caught up! No new alerts.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
