import React, { useState, useEffect, useCallback } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Code, Trophy, Target, Award, ArrowUpRight, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const LeetCodeTracker = () => {
    const { user } = useDashboardStore();
    const [username, setUsername] = useState(user?.socials?.leetcode || '');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.socials?.leetcode) {
            setUsername(user.socials.leetcode);
        }
    }, [user]);

    const fetchStats = useCallback(async () => {
        if (!username) return;
        setLoading(true);
        try {
            // Using our backend proxy which handles CORS and Mocking
            const res = await api.get(`/leetcode/${username}`);
            setStats(res.data);
        } catch {
            console.error("Failed to fetch LeetCode stats");
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const data = stats ? [
        { name: 'Easy', value: stats.easySolved || 0, color: '#00B8A3' },
        { name: 'Medium', value: stats.mediumSolved || 0, color: '#FFC01E' },
        { name: 'Hard', value: stats.hardSolved || 0, color: '#FF375F' },
    ] : [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">LeetCode Tracker</h1>
                    <p className="text-text-muted mt-1">Track your algorithm mastery.</p>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="LeetCode Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-48"
                    />
                    <Button onClick={fetchStats} disabled={loading}>
                        {loading ? '...' : 'Sync'}
                    </Button>
                </div>
            </div>

            {/* Main Stats Area */}
            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Chart */}
                    <Card className="flex flex-col items-center justify-center">
                        <div className="relative w-64 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#2A2A2A', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-bold">{stats.totalSolved}</span>
                                <span className="text-xs text-text-muted uppercase tracking-widest">Solved</span>
                            </div>
                        </div>

                        <div className="flex gap-6 mt-6 w-full px-6">
                            <div className="flex-1 text-center">
                                <div className="text-[#00B8A3] font-bold text-xl">{stats.easySolved}</div>
                                <div className="text-xs text-text-muted">Easy</div>
                            </div>
                            <div className="flex-1 text-center border-l border-r border-border">
                                <div className="text-[#FFC01E] font-bold text-xl">{stats.mediumSolved}</div>
                                <div className="text-xs text-text-muted">Medium</div>
                            </div>
                            <div className="flex-1 text-center">
                                <div className="text-[#FF375F] font-bold text-xl">{stats.hardSolved}</div>
                                <div className="text-xs text-text-muted">Hard</div>
                            </div>
                        </div>
                    </Card>

                    {/* Right Details */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" /> Global Ranking
                            </h3>
                            <div className="text-4xl font-bold font-mono">#{stats.ranking?.toLocaleString()}</div>
                            <p className="text-text-muted text-sm mt-2">Top {Math.max(100 - stats.acceptanceRate, 5).toFixed(1)}% of users</p>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" /> Acceptance Rate
                            </h3>
                            <div className="text-4xl font-bold font-mono text-primary">{stats.acceptanceRate}%</div>
                            <p className="text-text-muted text-sm mt-2">Average is 45%</p>
                        </Card>

                        <Card className="md:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Award className="w-5 h-5 text-secondary" /> Suggestions
                                </h3>
                                <Badge variant="primary">AI Recommended</Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-surfaceHighlight hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-[#FFC01E]/20 text-[#FFC01E] flex items-center justify-center font-bold text-xs">M</div>
                                        <div>
                                            <div className="font-medium group-hover:text-[#FFC01E] transition-colors">Course Schedule II</div>
                                            <div className="text-xs text-text-muted">Graph • Cyclic Detection</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-surfaceHighlight hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-[#00B8A3]/20 text-[#00B8A3] flex items-center justify-center font-bold text-xs">E</div>
                                        <div>
                                            <div className="font-medium group-hover:text-[#00B8A3] transition-colors">Maximum Subarray</div>
                                            <div className="text-xs text-text-muted">Array • DP</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeetCodeTracker;
