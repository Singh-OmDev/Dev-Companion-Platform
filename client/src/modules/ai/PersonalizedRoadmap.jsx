
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Map, Zap, CheckCircle, Lock, Loader, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import clsx from 'clsx';

const PersonalizedRoadmap = () => {
    const [goal, setGoal] = useState('');
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateRoadmap = async () => {
        if (!goal.trim()) return;
        setLoading(true);
        try {
            // Mock API call
            const res = await api.post('/ai/roadmap', { goal });
            setRoadmap(res.data.roadmap);
        } catch {
            console.error("Failed to generate roadmap");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
                    <Map className="w-10 h-10 text-primary" />
                    AI Architect
                </h1>
                <p className="text-text-muted text-lg max-w-2xl mx-auto">
                    Define your ambition. Our AI will construct the optimal path to mastery, tailored to your current skill level.
                </p>
            </div>

            {/* Input Section */}
            <Card className="p-8 border-primary/20 bg-gradient-to-br from-surface to-surfaceHighlight/50">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-sm font-bold ml-1 text-primary">TARGET GOAL</label>
                        <Input
                            placeholder="e.g. Senior Backend Engineer, React Expert, System Architect..."
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generateRoadmap()}
                            className="h-14 text-lg bg-black/50 border-primary/30 focus:border-primary"
                        />
                    </div>
                    <Button
                        onClick={generateRoadmap}
                        size="lg"
                        variant="primary"
                        disabled={loading}
                        className="h-14 px-8 min-w-[150px]"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2"><Zap className="w-5 h-5" /> Generate</span>}
                    </Button>
                </div>
            </Card>

            {/* Timeline Results */}
            {roadmap && (
                <div className="relative pl-8 md:pl-0">
                    {/* Vertical Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2 hidden md:block" />
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-border md:hidden" />

                    <div className="space-y-12 py-8">
                        {roadmap.map((step, index) => (
                            <div key={index} className={clsx("relative flex items-center justify-between md:justify-center group",
                                index % 2 === 0 ? "md:flex-row-reverse" : ""
                            )}>
                                {/* Center Icon */}
                                <div className={clsx(
                                    "absolute left-0 md:left-1/2 w-10 h-10 -ml-5 rounded-full border-4 z-10 flex items-center justify-center transition-all duration-500",
                                    step.status === 'completed' ? "bg-primary border-black text-black" :
                                        step.status === 'in-progress' ? "bg-surface border-primary text-primary animate-pulse" :
                                            "bg-surface border-border text-text-muted"
                                )}>
                                    {step.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                                        step.status === 'locked' ? <Lock className="w-4 h-4" /> :
                                            <div className="w-3 h-3 bg-primary rounded-full" />}
                                </div>

                                {/* Content Card */}
                                <div className={clsx("w-full md:w-[45%] pl-12 md:pl-0",
                                    index % 2 === 0 ? "md:pl-12" : "md:pr-12 md:text-right"
                                )}>
                                    <div className={clsx(
                                        "p-6 rounded-xl border transition-all duration-300 hover:scale-105 hover:bg-surfaceHighlight/50",
                                        step.status === 'in-progress' ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(212,242,63,0.1)]" : "border-border bg-surface"
                                    )}>
                                        <div className={clsx("flex items-center gap-2 mb-2",
                                            index % 2 !== 0 ? "md:justify-end" : ""
                                        )}>
                                            <Badge variant={step.status === 'in-progress' ? 'primary' : 'secondary'} className="uppercase tracking-widest text-[10px]">
                                                Week {step.week}
                                            </Badge>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                        <p className="text-text-muted text-sm">{step.description}</p>

                                        {step.status !== 'locked' && (
                                            <Button variant="ghost" size="sm" className="mt-4 group-hover:text-primary p-0">
                                                View Resources <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Spacer for flex alignment */}
                                <div className="hidden md:block w-[45%]" />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-8">
                        <Button variant="secondary" size="lg">Save to Learning Tracker</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalizedRoadmap;
