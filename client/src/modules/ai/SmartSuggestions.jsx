
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Sparkles, ArrowRight, Code, AlertCircle, Coffee } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const SmartSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                // Mock API call - in prod use auth headers
                const res = await api.get('/ai/suggestions');
                setSuggestions(res.data);
            } catch {
                console.error("Failed to fetch suggestions");
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    if (loading) return <Card className="animate-pulse h-48" />;
    if (suggestions.length === 0) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'leetcode': return <Code className="w-5 h-5 text-accent" />;
            case 'project': return <AlertCircle className="w-5 h-5 text-primary" />;
            default: return <Coffee className="w-5 h-5 text-secondary" />;
        }
    };

    return (
        <Card className="rounded-3xl border-primary/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] bg-gradient-to-br from-surface to-primary/5 p-8 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10 border-b border-primary/20 pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    Smart Insights
                </h2>
                <Badge variant="primary" className="bg-primary hover:bg-primary text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]">3 New</Badge>
            </div>

            <div className="space-y-4 relative z-10">
                {suggestions.map((s) => (
                    <div key={s.id} className="p-4 rounded-2xl bg-surface/80 backdrop-blur-md border border-primary/10 hover:border-primary/50 transition-all duration-300 flex items-center justify-between group hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:-translate-y-0.5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surfaceHighlight flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
                                {getIcon(s.type)}
                            </div>
                            <div>
                                <p className="text-base font-bold text-white leading-tight mb-1 group-hover:text-primary transition-colors">{s.message}</p>
                                <p className="text-sm text-text-muted font-medium">{s.action}</p>
                            </div>
                        </div>
                        {s.link && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(s.link)}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2 text-primary hover:bg-primary/10"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default SmartSuggestions;
