import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Sparkles, Plus, Loader2, ArrowRight, CheckCircle2, Trash2, LayoutTemplate } from 'lucide-react';
import api from '../../services/api';
import KanbanBoard from './KanbanBoard';

const FeaturePipeline = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [idea, setIdea] = useState('');
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [featureToDelete, setFeatureToDelete] = useState(null);

    const fetchFeatures = async () => {
        try {
            const res = await api.get('/features');
            setFeatures(res.data);
            if (res.data.length > 0 && !selectedFeature) {
                setSelectedFeature(res.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch features", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatures();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGenerate = async () => {
        if (!idea.trim()) return;
        setGenerating(true);
        try {
            // 1. Generate the feature using AI
            const genRes = await api.post('/features/generate', { idea });
            const generatedFeature = genRes.data.feature;

            // 2. Save it to DB
            const saveRes = await api.post('/features', {
                title: generatedFeature.title,
                description: generatedFeature.description,
                tasks: generatedFeature.tasks
            });

            const newFeature = saveRes.data;
            setFeatures([newFeature, ...features]);
            setSelectedFeature(newFeature);
            setIdea('');
        } catch (err) {
            console.error("Generation failed", err);
            alert("Failed to generate feature. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleFeatureUpdate = (updatedFeature) => {
        setFeatures(features.map(f => f._id === updatedFeature._id ? updatedFeature : f));
        setSelectedFeature(updatedFeature);
    };

    const confirmDelete = (featureId, e) => {
        e.stopPropagation();
        setFeatureToDelete(featureId);
    };

    const handleDeleteFeature = async () => {
        if (!featureToDelete) return;

        try {
            await api.delete(`/features/${featureToDelete}`);
            const updatedFeatures = features.filter(f => f._id !== featureToDelete);
            setFeatures(updatedFeatures);
            if (selectedFeature && selectedFeature._id === featureToDelete) {
                setSelectedFeature(updatedFeatures.length > 0 ? updatedFeatures[0] : null);
            }
        } catch (err) {
            console.error("Failed to delete feature", err);
            alert("Failed to delete feature. Please try again.");
        } finally {
            setFeatureToDelete(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <LayoutTemplate className="w-8 h-8 text-primary" />
                        Feature Scoping
                    </h1>
                    <p className="text-text-muted mt-2 max-w-2xl">
                        Convert feature requirements into a structured Kanban board of technical tickets.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                {/* Sidebar: Feature Input & List */}
                <div className="lg:col-span-1 border-r border-border pr-6 flex flex-col gap-6 overflow-y-auto">
                    <Card className="p-4 border border-primary/30 bg-primary/5">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> New Feature Idea
                        </h3>
                        <textarea
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="e.g., I need a user authentication system with email verification..."
                            className="w-full bg-surface border border-border rounded-lg p-3 text-sm min-h-[120px] focus:outline-none focus:border-primary transition-colors resize-none mb-3"
                        />
                        <Button
                            className="w-full"
                            onClick={handleGenerate}
                            disabled={generating || !idea.trim()}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing requirements...
                                </>
                            ) : (
                                <>
                                    <LayoutTemplate className="w-4 h-4 mr-2" /> Generate Tickets
                                </>
                            )}
                        </Button>
                    </Card>

                    <div className="space-y-3">
                        <h3 className="font-bold text-sm text-text-muted uppercase tracking-wider">Your Features</h3>
                        {loading ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-16 bg-surfaceHighlight rounded-lg"></div>
                                <div className="h-16 bg-surfaceHighlight rounded-lg"></div>
                            </div>
                        ) : features.length === 0 ? (
                            <p className="text-sm text-text-muted text-center py-4">No features yet. Create one above!</p>
                        ) : (
                            features.map(f => (
                                <button
                                    key={f._id}
                                    onClick={() => setSelectedFeature(f)}
                                    className={`group cursor-pointer w-full text-left p-4 rounded-lg border transition-all ${selectedFeature?._id === f._id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border bg-surface hover:border-text-muted'
                                        }`}
                                >
                                    <h4 className="font-bold text-sm truncate">{f.title}</h4>
                                    <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                                        <div className="flex text-xs items-center gap-2">
                                            <span>{f.tasks?.length || 0} tasks</span>
                                            {f.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-success" />}
                                        </div>
                                        <button
                                            onClick={(e) => confirmDelete(f._id, e)}
                                            className="p-1.5 rounded-md hover:bg-danger/20 hover:text-danger text-text-muted transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                            title="Delete Feature"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content: Kanban Board */}
                <div className="lg:col-span-3 flex flex-col h-full bg-surface/30 rounded-xl overflow-hidden min-h-0">
                    {selectedFeature ? (
                        <div className="flex-1 flex flex-col min-h-0 p-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold">{selectedFeature.title}</h2>
                                <p className="text-text-muted mt-1">{selectedFeature.description}</p>
                            </div>
                            <KanbanBoard
                                feature={selectedFeature}
                                onFeatureUpdate={handleFeatureUpdate}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-12 text-center">
                            <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
                            <h2 className="text-xl font-bold text-white mb-2">Select or Create a Feature</h2>
                            <p className="max-w-md">Describe your feature requirements on the left to automatically generate a breakdown of technical tickets.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {featureToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <Card className="w-full max-w-sm border-danger/30 bg-surface shadow-2xl">
                        <h2 className="text-xl font-bold mb-2">Delete Feature?</h2>
                        <p className="text-text-muted text-sm mb-6">
                            This will permanently delete this feature and all of its associated tasks. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="secondary" onClick={() => setFeatureToDelete(null)}>Cancel</Button>
                            <Button
                                className="bg-danger hover:bg-danger/90 text-white border-0"
                                onClick={handleDeleteFeature}
                            >
                                Delete Feature
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default FeaturePipeline;
