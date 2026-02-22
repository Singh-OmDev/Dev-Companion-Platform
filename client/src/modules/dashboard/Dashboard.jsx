import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Activity, Code, GitCommit, Trophy, ArrowRight, Zap } from 'lucide-react';
import SmartSuggestions from '../ai/SmartSuggestions';

const StatCard = ({ label, value, icon: Icon, trend }) => (
    <Card className="flex items-center justify-between p-6 hover:border-primary/50 transition-colors group">
        <div>
            <span className="text-text-muted text-sm font-medium uppercase tracking-wider">{label}</span>
            <div className="text-3xl font-bold mt-2 font-mono group-hover:text-primary transition-colors">{value}</div>
            {trend && <div className="text-xs text-green-500 mt-2 flex items-center gap-1">▲ {trend} this week</div>}
        </div>
        <div className="w-12 h-12 rounded-xl bg-surfaceHighlight flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
        </div>
    </Card>
);

const Dashboard = () => {
    const { user, stats, goals, activity, fetchDashboardData } = useDashboardStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold">
                        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user.name}</span>.
                    </h1>
                    <p className="text-text-muted mt-2 text-lg">You're on a <span className="text-primary font-bold">{user.streak} day streak</span>! Keep it up. 🚀</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate('/profile')}>Customize</Button>
                    <Button onClick={() => navigate('/goals')}>Daily Check-in</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Commits" value={stats.totalCommits} icon={GitCommit} trend="12%" />
                <StatCard label="Problems Solved" value={stats.leetcodeSolved} icon={Code} trend="4%" />
                <StatCard label="Projects" value={stats.projectsCompleted} icon={Trophy} />
                <StatCard label="Hours Coded" value={stats.hoursCoded} icon={Activity} trend="8h" />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Activity & Focus */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Graph Placeholder */}
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Activity Intensity
                            </h2>
                            <Badge>Last 30 Days</Badge>
                        </div>
                        <div className="h-48 flex items-end justify-between gap-2 px-2">
                            {activity.map((day, i) => (
                                <div
                                    key={i}
                                    className="w-full bg-primary/20 rounded-t-sm hover:bg-primary/50 transition-colors relative group"
                                    style={{ height: `${Math.min(day.count * 10, 100)}%` }}
                                >
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surfaceHighlight px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                                        {day.count} commits
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Active Projects (Placeholder) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card hover className="relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Code className="w-24 h-24" />
                            </div>
                            <Badge variant="primary" className="mb-4">Active</Badge>
                            <h3 className="text-xl font-bold mb-2">Dev Companion OS</h3>
                            <p className="text-text-muted text-sm mb-6">Building the ultimate developer productivity platform.</p>
                            <div className="w-full bg-surfaceHighlight h-2 rounded-full mb-4 overflow-hidden">
                                <div className="bg-primary h-full w-3/4" />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">75% Complete</span>
                                <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent hover:text-primary">Resume <ArrowRight className="w-4 h-4 ml-1" /></Button>
                            </div>
                        </Card>

                        <Card hover className="flex flex-col justify-center items-center text-center border-dashed">
                            <div className="w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center mb-4 text-text-muted">
                                +
                            </div>
                            <h3 className="font-bold">New Project</h3>
                            <p className="text-text-muted text-sm mt-1">Start something new</p>
                        </Card>
                    </div>
                </div>

                {/* Right Col: Goals & Suggestions */}
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Today's Focus
                        </h2>
                        <div className="space-y-3">
                            {goals.map((goal) => (
                                <div key={goal.id} className="flex items-start gap-3 p-3 rounded-lg bg-surfaceHighlight/50 border border-transparent hover:border-border transition-colors">
                                    <div
                                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${goal.completed ? 'bg-primary border-primary' : 'border-text-muted'}`}
                                    >
                                        {goal.completed && <span className="text-black text-xs">✓</span>}
                                    </div>
                                    <div className={goal.completed ? 'line-through text-text-muted' : ''}>
                                        <p className="font-medium text-sm">{goal.title}</p>
                                        <span className="text-xs text-text-muted capitalize">{goal.type} Goal</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" className="w-full mt-6 text-sm">Add New Goal</Button>
                    </Card>

                    {/* AI Suggestions Widget */}
                    <SmartSuggestions />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
