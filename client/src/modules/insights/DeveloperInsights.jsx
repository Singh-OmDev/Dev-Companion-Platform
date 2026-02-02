
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend } from 'recharts';
import { Activity, Zap, Target, BookOpen } from 'lucide-react';
import api from '../../services/api';

const DeveloperInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await api.get('/insights');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (loading) return <div className="p-10 text-center animate-pulse">Analyzing Developer DNA...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary" />
                Developer Insights
            </h1>
            <p className="text-text-muted">Visualizing your coding habits and productivity patterns.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Productivity Pulse */}
                <Card className="flex flex-col items-center justify-center p-6 relative overflow-hidden">
                    <h3 className="text-lg font-bold mb-4 w-full flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        Productivity Pulse
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" barSize={20} data={[{ name: 'Score', value: data?.productivityPulse || 0, fill: '#8884d8' }]} startAngle={90} endAngle={-270}>
                                <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-3xl font-bold font-mono">
                                    {data?.productivityPulse}
                                </text>
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 2. Tech Stack Radar */}
                <Card className="col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Tech Focus Radar
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data?.focusRadar || []}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                <Radar name="Projects" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 3. Activity Trend */}
                <Card className="col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        Activity Trend (7 Days)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.activityTrend || []}>
                                <defs>
                                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorLearning" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#555" />
                                <YAxis stroke="#555" />
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                <Area type="monotone" dataKey="commits" stroke="#8884d8" fillOpacity={1} fill="url(#colorCommits)" />
                                <Area type="monotone" dataKey="learning" stroke="#82ca9d" fillOpacity={1} fill="url(#colorLearning)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 4. Learning Distribution */}
                <Card>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        Learning Topics
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.learningDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data?.learningDistribution?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DeveloperInsights;
