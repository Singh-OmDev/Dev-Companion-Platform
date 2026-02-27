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
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        if (user?.socials?.leetcode) {
            setUsername(user.socials.leetcode);
        }
    }, [user]);

    const fetchStats = useCallback(async () => {
        if (!username) return;
        setLoading(true);
        setLoadingSuggestions(true);
        try {
            // Fetch stats
            const res = await api.get(`/leetcode/${username}`);
            setStats(res.data);

            // Fetch Recommendations in background
            api.get(`/leetcode/${username}/recommendations`).then(sugRes => {
                setSuggestions(sugRes.data);
                setLoadingSuggestions(false);
            }).catch(e => {
                console.error("Failed to fetch LeetCode recommendations:", e);
                setLoadingSuggestions(false);
            });

        } catch {
            console.error("Failed to fetch LeetCode stats");
            setLoadingSuggestions(false);
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">LeetCode Tracker</h1>
                    <p className="text-white/50 mt-1 font-mono text-xs uppercase">Track your algorithm mastery.</p>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="LeetCode Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-48"
                    />
                    <Button onClick={fetchStats} disabled={loading} variant="primary">
                        {loading ? '...' : 'Sync Data'}
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
                                        contentStyle={{ backgroundColor: '#020202', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0', fontFamily: 'monospace' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-black">{stats.totalSolved}</span>
                                <span className="text-[10px] text-white/50 uppercase font-mono tracking-widest mt-1">Solved</span>
                            </div>
                        </div>

                        <div className="flex gap-6 mt-6 w-full px-6 font-mono uppercase text-xs">
                            <div className="flex-1 text-center">
                                <div className="text-[#00B8A3] font-bold text-xl">{stats.easySolved}</div>
                                <div className="text-white/40 mt-1">Easy</div>
                            </div>
                            <div className="flex-1 text-center border-l border-r border-white/10">
                                <div className="text-[#FFC01E] font-bold text-xl">{stats.mediumSolved}</div>
                                <div className="text-white/40 mt-1">Medium</div>
                            </div>
                            <div className="flex-1 text-center">
                                <div className="text-[#FF375F] font-bold text-xl">{stats.hardSolved}</div>
                                <div className="text-white/40 mt-1">Hard</div>
                            </div>
                        </div>
                    </Card>

                    {/* Right Details */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" /> Global Ranking
                            </h3>
                            <div className="text-4xl font-black font-sans tracking-tighter text-[#D4F23F]">#{stats.ranking?.toLocaleString()}</div>
                            <p className="text-white/50 font-mono text-xs uppercase mt-2">Top {Math.max(100 - stats.acceptanceRate, 5).toFixed(1)}% of users</p>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-[#D4F23F]" /> Acceptance Rate
                            </h3>
                            <div className="text-4xl font-black font-sans tracking-tighter text-[#D4F23F]">{stats.acceptanceRate}%</div>
                            <p className="text-white/50 font-mono text-xs uppercase mt-2">Average is 45%</p>
                        </Card>

                        <Card className="md:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Award className="w-5 h-5 text-secondary" /> Suggestions
                                </h3>
                                <Badge variant="primary">Recommended</Badge>
                            </div>

                            <div className="space-y-3">
                                {loadingSuggestions ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-white/50 space-y-3 animate-fade-in font-mono text-xs uppercase">
                                        <div className="w-8 h-8 border-2 border-[#D4F23F] border-t-transparent animate-spin" />
                                        <p>Synthesizing personalized recommendations...</p>
                                    </div>
                                ) : suggestions && suggestions.length > 0 ? (
                                    suggestions.map((sug, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-3 border border-white/10 bg-white/5 hover:border-white/30 transition-colors cursor-pointer group"
                                            onClick={() => window.open(sug.link, '_blank')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs uppercase border ${sug.difficulty === 'E' ? 'border-[#00B8A3] text-[#00B8A3]' :
                                                    sug.difficulty === 'M' ? 'border-[#FFC01E] text-[#FFC01E]' :
                                                        'border-[#FF375F] text-[#FF375F]'
                                                    }`}>
                                                    {sug.difficulty}
                                                </div>
                                                <div>
                                                    <div className={`font-bold text-sm transition-colors ${sug.difficulty === 'E' ? 'group-hover:text-[#00B8A3]' :
                                                        sug.difficulty === 'M' ? 'group-hover:text-[#FFC01E]' :
                                                            'group-hover:text-[#FF375F]'
                                                        }`}>
                                                        {sug.title}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-white/40 uppercase mt-1">{sug.topics}</div>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-white/50 text-xs font-mono uppercase">
                                        No recommendations available. Try solving more problems!
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeetCodeTracker;
