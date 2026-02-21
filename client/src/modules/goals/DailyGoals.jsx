import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Target, CheckCircle, Circle, Flame, Plus, Trash2, Sparkles } from 'lucide-react';
import clsx from 'clsx';

import api from '../../services/api';

const DailyGoals = () => {
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState('');
    const [loading, setLoading] = useState(true);
    const [generatingAI, setGeneratingAI] = useState(false);
    // Streak logic would ideally come from backend too, keeping simple for now or fetch from user stats
    const [streak] = useState(12);

    const fetchGoals = async () => {
        try {
            const res = await api.get('/goals');
            if (Array.isArray(res.data)) {
                setGoals(res.data);
            } else {
                setGoals([]);
                console.error("API returned non-array:", res.data);
            }
        } catch {
            console.error("Failed to fetch goals");
            setGoals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const toggleGoal = async (id) => {
        try {
            // Optimistic update
            setGoals(goals.map(g => g._id === id ? { ...g, completed: !g.completed } : g)); // Note: _id from mongo
            await api.put(`/goals/${id}/toggle`);
            // Optionally refetch to ensure sync
        } catch {
            console.error("Failed to toggle goal");
            fetchGoals(); // Revert on error
        }
    };

    const addGoal = async () => {
        if (!newGoal.trim()) return;
        try {
            // Send the actual goal type if it was AI generated, else default to 'other'
            const type = newGoal.includes('[AI]') ? 'learning' : 'other';
            const cleanTitle = newGoal.replace('[AI] ', '');

            const res = await api.post('/goals', { title: cleanTitle, type });
            setGoals([...goals, res.data]);
            setNewGoal('');
        } catch {
            console.error("Failed to add goal");
        }
    };

    const generateAIGoal = async () => {
        setGeneratingAI(true);
        try {
            const res = await api.get('/ai/generate-goal');
            // Populate the input with the suggested goal
            setNewGoal(`[AI] ${res.data.title}`);
        } catch (err) {
            console.error("Failed to generate AI goal", err);
        } finally {
            setGeneratingAI(false);
        }
    };

    const deleteGoal = async (id) => {
        try {
            // Optimistic
            setGoals(goals.filter(g => g._id !== id));
            await api.delete(`/goals/${id}`);
        } catch {
            console.error("Failed to delete goal");
            fetchGoals();
        }
    };

    const safeGoals = Array.isArray(goals) ? goals : [];
    const completedCount = safeGoals.filter(g => g.isCompleted || g.completed).length;
    const progress = safeGoals.length === 0 ? 0 : (completedCount / safeGoals.length) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Daily Protocol</h1>
                    <p className="text-text-muted mt-1">Discipline equals freedom.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full animate-pulse-slow">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <span className="font-bold text-orange-200">{streak} Day Streak</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-surfaceHighlight rounded-full overflow-hidden w-full">
                <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <Card className="min-h-[400px]">
                <div className="flex gap-2 mb-6">
                    <Input
                        placeholder="Add a new mission..."
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                        className={newGoal.startsWith('[AI]') ? 'border-primary text-primary' : ''}
                    />
                    <Button onClick={generateAIGoal} variant="secondary" disabled={generatingAI} title="Auto-Suggest Goal">
                        {generatingAI ? <Sparkles className="w-5 h-5 animate-spin text-primary" /> : <Sparkles className="w-5 h-5 text-primary" />}
                    </Button>
                    <Button onClick={addGoal} variant="primary"><Plus className="w-5 h-5" /></Button>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-10 animate-pulse">Loading Missions...</div>
                    ) : safeGoals.map((goal) => (
                        <div
                            key={goal._id}
                            className={clsx(
                                "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group",
                                goal.isCompleted || goal.completed
                                    ? "bg-surfaceHighlight/30 border-primary/20 opacity-60"
                                    : "bg-surface border-surfaceHighlight hover:border-border"
                            )}
                        >
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleGoal(goal._id)}>
                                <div className={clsx(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                    goal.completed
                                        ? "bg-primary border-primary text-black"
                                        : "border-text-muted group-hover:border-primary"
                                )}>
                                    {(goal.isCompleted || goal.completed) && <CheckCircle className="w-4 h-4" />}
                                </div>
                                <div className={clsx("font-medium text-lg", (goal.isCompleted || goal.completed) && "line-through text-text-muted")}>
                                    {goal.title}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Badge variant="default" className="capitalize">{goal.type}</Badge>
                                <button
                                    onClick={() => deleteGoal(goal._id)}
                                    className="text-text-muted hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}



                    {!loading && safeGoals.length === 0 && (
                        <div className="text-center py-20 text-text-muted">
                            <Target className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>No goals set for today.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DailyGoals;
