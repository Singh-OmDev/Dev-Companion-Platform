import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Activity, Code, GitCommit, Trophy, ArrowRight, Zap } from 'lucide-react';
import SmartSuggestions from '../ai/SmartSuggestions';

const StatCard = ({ label, value, icon: Icon, trend }) => (
    <Card className="flex items-center justify-between p-8 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-primary/20 bg-gradient-to-br from-surface to-surfaceHighlight/30 inset-0 border border-border/50 rounded-2xl">
        <div>
            <span className="text-text-muted text-xs font-bold uppercase tracking-widest">{label}</span>
            <div className="text-4xl font-extrabold mt-3 font-mono group-hover:text-primary group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-300 tracking-tight">{value}</div>
            {trend && <div className="text-sm text-green-500 mt-2 flex items-center gap-1 font-medium bg-green-500/10 px-2 py-1 rounded w-fit">▲ {trend} this week</div>}
        </div>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-3 transition-all duration-300 shadow-inner">
            <Icon className="w-7 h-7" />
        </div>
    </Card>
);

const Dashboard = () => {
    const { user, stats, goals, activity, projects, fetchDashboardData } = useDashboardStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 rounded-3xl">
                <div>
                    <h1 className="text-5xl font-extrabold tracking-tight">
                        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-accent animate-gradient-x">{user.name}</span>.
                    </h1>
                    <p className="text-text-muted mt-3 text-lg font-medium">You're on a <span className="text-primary font-bold px-2 py-1 bg-primary/10 rounded-md">{user.streak} day streak</span>! Keep the momentum going. 🚀</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="hover:bg-surfaceHighlight" onClick={() => navigate('/profile')}>Customize</Button>
                    <Button onClick={() => navigate('/goals')} className="shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-shadow">Daily Check-in</Button>
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
                    <Card className="border-border/40 hover:border-border/80 transition-colors bg-surface/50 backdrop-blur-sm shadow-xl p-8 rounded-3xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Activity className="w-6 h-6 text-primary" />
                                </div>
                                Activity Intensity
                            </h2>
                            <Badge variant="secondary" className="bg-surfaceHighlight/50 border-border/50 text-text-muted">Last 30 Days</Badge>
                        </div>
                        <div className="h-56 flex items-end justify-between gap-2 px-2 relative">
                            {/* Decorative background lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pt-8 pb-0 pointer-events-none opacity-10">
                                {[...Array(4)].map((_, i) => <div key={i} className="w-full border-t border-white" />)}
                            </div>

                            {activity.map((day, i) => (
                                <div
                                    key={i}
                                    className="w-full bg-primary/30 rounded-t-md hover:bg-primary transition-colors relative group cursor-crosshair z-10"
                                    style={{ height: `${Math.max(Math.min(day.count * 10, 100), 5)}%` }} // Ensure a minimum height for visibility
                                >
                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-surface px-3 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:-translate-y-1 group-hover:scale-105 whitespace-nowrap border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20">
                                        {day.count} commits
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 opacity-0 group-hover:opacity-100 rounded-t-md transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Active Projects (Dynamic) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.length > 0 ? projects.slice(0, 3).map((project) => (
                            <Card key={project._id || project.id} hover className="relative overflow-hidden cursor-pointer group bg-gradient-to-br from-surface to-surfaceHighlight/20 border-border/50 hover:border-primary/40 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1" onClick={() => navigate('/projects')}>
                                <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 transform group-hover:rotate-12 group-hover:scale-110">
                                    <Code className="w-40 h-40 text-primary" />
                                </div>
                                <Badge variant="primary" className="mb-4 bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(16,185,129,0.2)] px-3 py-1 text-xs">Active</Badge>
                                <h3 className="text-2xl font-extrabold mb-3 truncate group-hover:text-primary transition-colors">{project.title}</h3>
                                <p className="text-text-muted text-sm mb-8 line-clamp-2 leading-relaxed">{project.description}</p>
                                <div className="flex items-center justify-between text-sm mt-auto border-t border-border/50 pt-4">
                                    <span className="text-text-muted font-medium flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        In Progress
                                    </span>
                                    <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-text-muted group-hover:text-primary transition-colors font-bold tracking-wide">Enter Project <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" /></Button>
                                </div>
                            </Card>
                        )) : (
                            <Card hover className="flex flex-col justify-center items-center text-center border-dashed border-border/60 cursor-pointer py-16 bg-surfaceHighlight/10 hover:bg-surfaceHighlight/30 hover:border-primary/50 transition-all rounded-3xl group" onClick={() => navigate('/projects')}>
                                <div className="w-16 h-16 rounded-2xl bg-surfaceHighlight flex items-center justify-center mb-6 text-text-muted transition-all duration-300 group-hover:text-primary group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-90">
                                    <span className="text-3xl font-light">+</span>
                                </div>
                                <h3 className="font-bold text-xl mb-2 group-hover:text-white transition-colors">Launch New Project</h3>
                                <p className="text-text-muted text-sm max-w-[200px] leading-relaxed">Initialize a new repository and start building.</p>
                            </Card>
                        )}

                        {/* Always show the exact "+ New Project" card if they have less than 2 projects to fill the grid row nicely */}
                        {projects.length >= 1 && projects.length < 2 && (
                            <Card hover className="flex flex-col justify-center items-center text-center border-dashed border-border/60 cursor-pointer py-16 bg-surfaceHighlight/10 hover:bg-surfaceHighlight/30 hover:border-primary/50 transition-all rounded-3xl group" onClick={() => navigate('/projects')}>
                                <div className="w-16 h-16 rounded-2xl bg-surfaceHighlight flex items-center justify-center mb-6 text-text-muted transition-all duration-300 group-hover:text-primary group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-90">
                                    <span className="text-3xl font-light">+</span>
                                </div>
                                <h3 className="font-bold text-xl mb-2 group-hover:text-white transition-colors">Another Project</h3>
                                <p className="text-text-muted text-sm max-w-[200px] leading-relaxed">Start tracking your next big idea.</p>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Right Col: Goals & Suggestions */}
                <div className="space-y-6">
                    <Card className="rounded-3xl border-border/40 shadow-xl bg-surface/50 backdrop-blur-sm p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <Zap className="w-6 h-6 text-yellow-500" />
                            </div>
                            Today's Protocol
                        </h2>
                        <div className="space-y-4">
                            {goals.map((goal) => (
                                <div key={goal.id} className="flex items-start gap-4 p-4 rounded-xl bg-surfaceHighlight/30 border border-transparent hover:border-primary/30 transition-all duration-200 group">
                                    <div
                                        className={`w-6 h-6 mt-0.5 rounded-md border-2 flex flex-shrink-0 items-center justify-center cursor-pointer transition-colors ${goal.completed ? 'bg-primary border-primary shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'border-text-muted group-hover:border-primary/50'}`}
                                    >
                                        {goal.completed && <span className="text-black text-sm font-bold">✓</span>}
                                    </div>
                                    <div className={`flex-1 ${goal.completed ? 'line-through text-text-muted opacity-60' : ''}`}>
                                        <p className="font-bold text-base leading-snug mb-1 group-hover:text-white transition-colors">{goal.title}</p>
                                        <span className="text-xs text-text-muted capitalize font-medium flex items-center gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${goal.type === 'learning' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                                            {goal.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" className="w-full mt-8 py-4 font-bold tracking-wide hover:border-primary/50 transition-colors bg-surfaceHighlight/50 border-border/50 rounded-xl">Define New Mission</Button>
                    </Card>

                    {/* Smart Suggestions Widget */}
                    <SmartSuggestions />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
