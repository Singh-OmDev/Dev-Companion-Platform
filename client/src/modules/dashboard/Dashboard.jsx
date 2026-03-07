import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Activity, Code, GitCommit, Trophy, ArrowRight, Zap, Terminal, RefreshCw, BrainCircuit } from 'lucide-react';
import SmartSuggestions from '../ai/SmartSuggestions';

const StatCard = ({ label, value, icon: Icon, trend }) => (
    <Card className="flex items-center justify-between p-8 group">
        <div>
            <span className="text-white/50 text-[10px] font-mono uppercase tracking-widest">{label}</span>
            <div className="text-4xl font-black mt-3 font-sans group-hover:text-[#D4F23F] transition-colors tracking-tighter">{value}</div>
            {trend && <div className="text-[10px] text-[#D4F23F] mt-2 flex items-center gap-1 font-mono uppercase bg-[#D4F23F]/10 px-2 py-1 w-fit border border-[#D4F23F]/30">▲ {trend} this week</div>}
        </div>
        <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-[#D4F23F] group-hover:text-black transition-colors">
            <Icon className="w-6 h-6" />
        </div>
    </Card>
);

const Dashboard = () => {
    const {
        user, stats, goals, activity, projects, languages, leetcodeRecommendations,
        dailyMission, isGeneratingMission,
        fetchDashboardData, fetchLeetCodeRecommendations, generateDailyMission,
        isLoading
    } = useDashboardStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        if (user.socials?.leetcode) {
            fetchLeetCodeRecommendations(user.socials.leetcode);
        }
    }, [user.socials?.leetcode, fetchLeetCodeRecommendations]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/50 space-y-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-[#D4F23F]/30 border-t-[#D4F23F] rounded-full animate-spin" />
                <p className="font-mono text-sm uppercase tracking-widest">Loading Dashboard Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">
                        Hello, <span className="text-[#D4F23F] glitch" data-text={user.name}>{user.name}</span>.
                    </h1>
                    <p className="text-white/60 mt-3 text-sm font-mono">You're on a <span className="text-black font-bold px-2 py-0.5 bg-[#D4F23F] uppercase tracking-wider">{user.streak} day streak</span>! Keep the momentum going. 🚀</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/profile')}>Customize</Button>
                    <Button onClick={() => navigate('/goals')}>Daily Check-in</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Commits" value={stats.totalCommits} icon={GitCommit} />
                <StatCard label="Problems Solved" value={stats.leetcodeSolved} icon={Code} />
                <StatCard label="Projects" value={stats.projectsCompleted} icon={Trophy} />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Activity & Focus */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Graph Placeholder */}
                    <Card className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold flex items-center gap-3">
                                <Activity className="w-5 h-5 text-[#D4F23F]" />
                                Activity Intensity
                            </h2>
                            <span className="text-[10px] font-mono uppercase text-white/40">Last 30 Days</span>
                        </div>
                        <div className="h-56 flex items-end justify-between gap-2 px-2 relative">
                            {/* Decorative background lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pt-8 pb-0 pointer-events-none opacity-10">
                                {[...Array(4)].map((_, i) => <div key={i} className="w-full border-t border-white" />)}
                            </div>

                            {activity.length > 0 ? activity.map((day, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-[#D4F23F]/20 hover:bg-[#D4F23F] transition-colors relative group cursor-crosshair z-10 mx-[1px] rounded-t-sm"
                                    style={{ height: `${Math.max(Math.min(day.count * 15, 100), 5)}%` }}
                                >
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#020202] px-2 py-1 text-[10px] font-mono text-[#D4F23F] uppercase border border-[#D4F23F]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        {day.count} commits
                                    </div>
                                </div>
                            )) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white/30 font-mono text-xs uppercase z-20">
                                    No activity data found. Connect GitHub to track commits.
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Active Projects (Dynamic) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {projects.length > 0 ? projects.slice(0, 3).map((project) => (
                            <Card hover key={project._id || project.id} className="flex flex-col">
                                <div className="absolute -top-6 -right-6 p-4 opacity-5 pointer-events-none">
                                    <Code className="w-40 h-40 text-white" />
                                </div>
                                <Badge variant="primary" className="mb-4">{project.language || 'Active'}</Badge>
                                <h3 className="text-xl font-bold mb-3 truncate group-hover:text-[#D4F23F] transition-colors" title={project.name || project.title}>{project.name || project.title}</h3>
                                <p className="text-white/50 text-sm mb-8 line-clamp-2 leading-relaxed">{project.description || 'No description provided.'}</p>
                                <div className="flex items-center justify-between text-[10px] font-mono uppercase mt-auto border-t border-white/10 pt-4">
                                    <span className="text-white/40 flex items-center gap-2">
                                        Updated: {project.pushed_at ? new Date(project.pushed_at).toLocaleDateString() : 'Recently'}
                                    </span>
                                    {project.html_url ? (
                                        <a href={project.html_url} target="_blank" rel="noreferrer" className="text-[#D4F23F] hover:text-white transition-colors flex items-center z-10">Open Repo <ArrowRight className="w-3 h-3 ml-1" /></a>
                                    ) : (
                                        <span className="text-white/50 group-hover:text-white transition-colors flex items-center cursor-pointer z-10" onClick={() => navigate('/projects')}>Enter Project <ArrowRight className="w-3 h-3 ml-1" /></span>
                                    )}
                                </div>
                            </Card>
                        )) : (
                            <Card hover className="flex flex-col justify-center items-center text-center py-16" onClick={() => navigate('/projects')}>
                                <div className="w-12 h-12 border border-white/20 bg-white/5 flex items-center justify-center mb-6 text-white/50 group-hover:text-[#D4F23F] group-hover:border-[#D4F23F] group-hover:bg-[#D4F23F]/10 transition-colors">
                                    <span className="text-2xl font-light">+</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Launch New Project</h3>
                                <p className="text-white/50 text-sm max-w-[200px] leading-relaxed">Initialize a new repository and start building.</p>
                            </Card>
                        )}

                        {/* Always show the exact "+ New Project" card if they have less than 2 projects to fill the grid row nicely */}
                        {projects.length >= 1 && projects.length < 2 && (
                            <Card hover className="flex flex-col justify-center items-center text-center py-16" onClick={() => navigate('/projects')}>
                                <div className="w-12 h-12 border border-white/20 bg-white/5 flex items-center justify-center mb-6 text-white/50 group-hover:text-[#D4F23F] group-hover:border-[#D4F23F] group-hover:bg-[#D4F23F]/10 transition-colors">
                                    <span className="text-2xl font-light">+</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Another Project</h3>
                                <p className="text-white/50 text-sm max-w-[200px] leading-relaxed">Start tracking your next big idea.</p>
                            </Card>
                        )}
                    </div>

                    {/* Top Used Languages */}
                    {languages.length > 0 && (
                        <Card className="p-8 mt-6">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-[#D4F23F]" />
                                Language Distribution <span className="text-[10px] font-mono uppercase text-white/40 ml-auto font-normal">Recent</span>
                            </h2>
                            <div className="flex flex-col gap-4">
                                {/* Language distribution bar */}
                                <div className="w-full h-3 flex rounded overflow-hidden shadow-inner bg-white/5">
                                    {languages.map((lang, idx) => (
                                        <div key={idx} style={{ width: `${lang.value}%`, backgroundColor: lang.color }} className="h-full hover:brightness-125 transition-all cursor-crosshair" title={`${lang.name}: ${lang.value}%`} />
                                    ))}
                                </div>
                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {languages.map((lang, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-[10px] font-mono uppercase text-white/70">
                                            <div className="w-2.5 h-2.5 rounded-full shadow" style={{ backgroundColor: lang.color }} />
                                            {lang.name} <span className="opacity-40">{lang.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Col: Goals & Suggestions */}
                <div className="space-y-6">
                    <Card className="p-8">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                            <Zap className="w-5 h-5 text-[#D4F23F]" />
                            Today's Protocol
                        </h2>
                        <div className="space-y-3">
                            {goals.map((goal) => (
                                <div key={goal.id} className="flex items-start gap-4 p-4 border border-white/10 bg-white/5 hover:border-white/20 transition-colors group">
                                    <div
                                        className={`w-5 h-5 mt-0.5 border flex flex-shrink-0 items-center justify-center cursor-pointer transition-colors ${goal.completed ? 'bg-[#D4F23F] border-[#D4F23F]' : 'border-white/30 group-hover:border-[#D4F23F]'}`}
                                    >
                                        {goal.completed && <span className="text-black text-xs font-bold">✓</span>}
                                    </div>
                                    <div className={`flex-1 ${goal.completed ? 'line-through text-white/40' : ''}`}>
                                        <p className="font-bold text-sm leading-snug mb-1 group-hover:text-[#D4F23F] transition-colors">{goal.title}</p>
                                        <span className="text-[10px] text-white/50 font-mono uppercase flex items-center gap-1">
                                            {goal.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {dailyMission && (
                            <div className="mt-6 p-4 bg-[#D4F23F]/10 border border-[#D4F23F]/30 rounded">
                                <h3 className="text-[10px] font-bold font-mono uppercase text-[#D4F23F] mb-2 flex items-center gap-2"><BrainCircuit className="w-3.5 h-3.5" /> AI Mission Protocol</h3>
                                <p className="text-sm leading-relaxed text-white/80">{dailyMission}</p>
                            </div>
                        )}

                        <Button
                            variant="secondary"
                            className="w-full mt-6 flex justify-center items-center gap-2"
                            onClick={() => generateDailyMission()}
                            disabled={isGeneratingMission}
                        >
                            {isGeneratingMission ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Activity...</> : "Define New Mission"}
                        </Button>
                    </Card>

                    {/* LeetCode Recommendations Widget */}
                    {leetcodeRecommendations.length > 0 && (
                        <Card className="p-8">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                                <Code className="w-5 h-5 text-[#D4F23F]" />
                                Next Targets
                            </h2>
                            <div className="space-y-3">
                                {leetcodeRecommendations.map((rec, idx) => (
                                    <a key={idx} href={rec.link} target="_blank" rel="noreferrer" className="block p-4 border border-white/10 bg-white/5 hover:border-[#D4F23F]/50 transition-colors group">
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <h3 className="font-bold text-sm group-hover:text-[#D4F23F] transition-colors line-clamp-2">{rec.title}</h3>
                                            <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${rec.difficulty === 'E' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : rec.difficulty === 'M' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                {rec.difficulty === 'E' ? 'EASY' : rec.difficulty === 'M' ? 'MEDIUM' : 'HARD'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{rec.topics}</p>
                                    </a>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Smart Suggestions Widget */}
                    <SmartSuggestions />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
