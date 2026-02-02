import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import api from '../services/api';
import Badge from './ui/Badge';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Token check handled by interceptor (mostly), but quick check here is fine or just rely on API failure
                const res = await api.get('/notifications');
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            } catch (err) {
                console.error('Failed to fetch notifications');
            }
        };

        fetchNotifications();
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);

            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put(`/notifications/read-all`);

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    }

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-surfaceHighlight transition-colors text-text-muted hover:text-white"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse border border-background"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-full bottom-0 ml-4 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 animate-fade-in origin-bottom-left overflow-hidden">
                    <div className="p-3 border-b border-border flex justify-between items-center bg-surfaceHighlight/30">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary hover:text-primaryHighlight">
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-text-muted text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                No notifications yet
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {notifications.map(n => (
                                    <div
                                        key={n._id}
                                        className={`p-3 flex gap-3 hover:bg-surfaceHighlight/50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm leading-snug">{n.message}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[10px] text-text-muted">
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </span>
                                                <div className="flex gap-2">
                                                    {n.link && (
                                                        <Link to={n.link} onClick={() => setIsOpen(false)} className="text-xs text-primary hover:underline flex items-center gap-1">
                                                            View <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                    {!n.isRead && (
                                                        <button onClick={() => markAsRead(n._id)} className="text-text-muted hover:text-green-400" title="Mark read">
                                                            <Check className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
