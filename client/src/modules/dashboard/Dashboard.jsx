import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Activity, Code, GitCommit, Trophy, ArrowRight, Zap } from 'lucide-react';
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
    const { user, stats, goals, activity, projects, fetchDashboardData } = useDashboardStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

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

                            {activity.map((day, i) => (
                                <div
                                    key={i}
                                    className="w-full bg-[#D4F23F]/20 hover:bg-[#D4F23F] transition-colors relative group cursor-crosshair z-10"
                                    style={{ height: `${Math.max(Math.min(day.count * 10, 100), 5)}%` }}
                                >
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#020202] px-2 py-1 text-[10px] font-mono text-[#D4F23F] uppercase border border-[#D4F23F]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        {day.count} commits
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Active Projects (Dynamic) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {projects.length > 0 ? projects.slice(0, 3).map((project) => (
                            <Card hover key={project._id || project.id} onClick={() => navigate('/projects')}>
                                <div className="absolute -top-6 -right-6 p-4 opacity-5 pointer-events-none">
                                    <Code className="w-40 h-40 text-white" />
                                </div>
                                <Badge variant="primary" className="mb-4">Active</Badge>
                                <h3 className="text-xl font-bold mb-3 truncate group-hover:text-[#D4F23F] transition-colors">{project.title}</h3>
                                <p className="text-white/50 text-sm mb-8 line-clamp-2 leading-relaxed">{project.description}</p>
                                <div className="flex items-center justify-between text-xs font-mono uppercase mt-auto border-t border-white/10 pt-4">
                                    <span className="text-[#D4F23F] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#D4F23F] animate-pulse" />
                                        In Progress
                                    </span>
                                    <span className="text-white/50 group-hover:text-white transition-colors flex items-center">Enter Project <ArrowRight className="w-3 h-3 ml-1" /></span>
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
                        <Button variant="secondary" className="w-full mt-6">Define New Mission</Button>
                    </Card>

                    {/* Smart Suggestions Widget */}
                    <SmartSuggestions />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
