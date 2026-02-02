import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Sparkles, ArrowRight, Code, AlertCircle, Coffee } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SmartSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                // Mock API call - in prod use auth headers
                const res = await axios.get('http://localhost:5000/api/ai/suggestions');
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
        <Card className="border-primary/20 bg-gradient-to-br from-surface to-surfaceHighlight/30">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    AI Insights
                </h2>
                <Badge variant="primary">3 New</Badge>
            </div>

            <div className="space-y-3">
                {suggestions.map((s) => (
                    <div key={s.id} className="p-3 rounded-lg bg-surface/50 border border-border hover:border-primary/50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surfaceHighlight flex items-center justify-center">
                                {getIcon(s.type)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{s.message}</p>
                                <p className="text-xs text-text-muted">{s.action}</p>
                            </div>
                        </div>
                        {s.link && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(s.link)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default SmartSuggestions;
