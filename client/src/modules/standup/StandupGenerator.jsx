import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FileText, Copy, Check, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import api from '../../services/api';

const StandupGenerator = () => {
    const { user, goals, fetchDashboardData } = useDashboardStore();
    const [standupText, setStandupText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        fetchRecentActivity();
    }, [fetchDashboardData]);

    const fetchRecentActivity = async () => {
        if (!user?.socials?.github) return;
        try {
            // Fetch the last few events from the user's Github to see what they actually did
            const res = await api.get(`/github/activity/${user.socials.github}`);
            setRecentActivity(res.data.slice(0, 5)); // Get top 5 recent actions
        } catch (err) {
            console.error("Failed to fetch detailed github activity", err);
        }
    };

    const generateStandup = () => {
        setIsGenerating(true);

        setTimeout(() => {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

            // Format Yesterday's Activity
            let yesterdayText = "Yesterday:\n";
            if (recentActivity && recentActivity.length > 0) {
                // Determine what they actually worked on
                const pushes = recentActivity.filter(a => a.type === 'PushEvent');
                const prs = recentActivity.filter(a => a.type === 'PullRequestEvent');
                const creates = recentActivity.filter(a => a.type === 'CreateEvent');

                if (pushes.length > 0) {
                    const repos = [...new Set(pushes.map(p => p.repo.name.split('/')[1]))];
                    yesterdayText += `- Pushed ${pushes.length} commits across ${repos.join(', ')}\n`;
                } else if (prs.length > 0) {
                    yesterdayText += `- Opened/Reviewed a Pull Request on ${prs[0].repo.name.split('/')[1]}\n`;
                } else if (creates.length > 0) {
                    yesterdayText += `- Created new branch/repo for ${creates[0].repo.name.split('/')[1]}\n`;
                } else {
                    yesterdayText += `- Reviewed code and maintained repositories\n`;
                }
            } else {
                yesterdayText += `- Continued development on active projects\n`;
            }

            // Format Today's Goals
            let todayText = "Today:\n";
            const activeGoals = goals.filter(g => !g.completed);
            if (activeGoals.length > 0) {
                activeGoals.forEach(g => {
                    todayText += `- ${g.title}\n`;
                });
            } else {
                todayText += `- Review backlog and plan next sprint tasks\n`;
            }

            const blockersText = "Blockers:\n- None so far.";

            const draft = `*Standup - ${today}*\n\n${yesterdayText}\n${todayText}\n${blockersText}`;

            setStandupText(draft);
            setIsGenerating(false);
            setIsCopied(false);
        }, 800); // Simulate slight delay for "generation" feel
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(standupText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 rounded-3xl">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                        <FileText className="w-10 h-10 text-primary" />
                        Daily Standup
                    </h1>
                    <p className="text-text-muted mt-2 text-lg">Automate your morning status updates.</p>
                </div>
                <Button
                    onClick={generateStandup}
                    disabled={isGenerating}
                    className="shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-shadow text-black font-bold"
                >
                    {isGenerating ? (
                        <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Drafting...</>
                    ) : (
                        <><Sparkles className="w-5 h-5 mr-2" /> Generate Draft</>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Context Sidebar */}
                <div className="space-y-6">
                    <Card className="rounded-3xl border-border/40 shadow-xl bg-surface/50 backdrop-blur-sm p-6">
                        <h3 className="font-bold mb-4 text-primary flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Data Sources
                        </h3>
                        <div className="space-y-4 text-sm text-text-muted">
                            <div className="flex justify-between items-center">
                                <span>Recent Commits</span>
                                <Badge variant={recentActivity.length > 0 ? "success" : "secondary"}>
                                    {recentActivity.length > 0 ? "Synced" : "No recent"}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Daily Goals</span>
                                <Badge variant={goals.length > 0 ? "primary" : "secondary"}>
                                    {goals.length} Active
                                </Badge>
                            </div>
                        </div>
                        <p className="mt-6 text-xs text-text-muted/70 leading-relaxed">
                            The system looks at your recent GitHub activity and active Daily Goals to intelligently draft your standup text.
                        </p>
                    </Card>
                </div>

                {/* Editor Area */}
                <div className="md:col-span-2">
                    <Card className="rounded-3xl border-border/40 shadow-xl bg-surface/50 backdrop-blur-sm p-2 overflow-hidden h-full flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-surfaceHighlight/20 rounded-t-2xl">
                            <Badge variant="secondary" className="bg-background">draft_standup.md</Badge>
                            {standupText && (
                                <Button size="sm" variant="ghost" className="hover:text-primary transition-colors" onClick={handleCopy}>
                                    {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    <span className="ml-2">{isCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
                                </Button>
                            )}
                        </div>

                        <div className="p-4 flex-1">
                            {!standupText ? (
                                <div className="h-full flex flex-col items-center justify-center text-text-muted/50 space-y-4">
                                    <FileText className="w-16 h-16 opacity-20" />
                                    <p>Click "Generate Draft" to create your standup.</p>
                                </div>
                            ) : (
                                <textarea
                                    className="w-full h-full min-h-[300px] bg-transparent resize-none outline-none text-text leading-relaxed font-mono text-sm custom-scrollbar p-2"
                                    value={standupText}
                                    onChange={(e) => setStandupText(e.target.value)}
                                    placeholder="Your standup draft..."
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StandupGenerator;
