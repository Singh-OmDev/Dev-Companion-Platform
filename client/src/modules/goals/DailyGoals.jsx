import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Target, CheckCircle, Circle, Flame, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const DailyGoals = () => {
    // Basic Mock State (would connect to API in full version)
    const [goals, setGoals] = useState([
        { id: 1, title: 'Solve 1 LeetCode Hard', completed: false, type: 'leetcode' },
        { id: 2, title: 'Read 2 Systems Design Papers', completed: true, type: 'learning' },
        { id: 3, title: 'Push Project Update', completed: false, type: 'project' }
    ]);
    const [newGoal, setNewGoal] = useState('');
    const [streak] = useState(12);

    const toggleGoal = (id) => {
        setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
    };

    const addGoal = () => {
        if (!newGoal.trim()) return;
        setGoals([...goals, {
            id: Date.now(),
            title: newGoal,
            completed: false,
            type: 'other'
        }]);
        setNewGoal('');
    };

    const deleteGoal = (id) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const completedCount = goals.filter(g => g.completed).length;
    const progress = (completedCount / goals.length) * 100;

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
                    />
                    <Button onClick={addGoal} variant="primary"><Plus className="w-5 h-5" /></Button>
                </div>

                <div className="space-y-3">
                    {goals.map((goal) => (
                        <div
                            key={goal.id}
                            className={clsx(
                                "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group",
                                goal.completed
                                    ? "bg-surfaceHighlight/30 border-primary/20 opacity-60"
                                    : "bg-surface border-surfaceHighlight hover:border-border"
                            )}
                        >
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleGoal(goal.id)}>
                                <div className={clsx(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                    goal.completed
                                        ? "bg-primary border-primary text-black"
                                        : "border-text-muted group-hover:border-primary"
                                )}>
                                    {goal.completed && <CheckCircle className="w-4 h-4" />}
                                </div>
                                <div className={clsx("font-medium text-lg", goal.completed && "line-through text-text-muted")}>
                                    {goal.title}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Badge variant="default" className="capitalize">{goal.type}</Badge>
                                <button
                                    onClick={() => deleteGoal(goal.id)}
                                    className="text-text-muted hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {goals.length === 0 && (
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
