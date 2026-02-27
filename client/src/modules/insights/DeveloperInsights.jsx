
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

    const COLORS = ['#D4F23F', '#EBEBEB', '#7A7A7A', '#333333', '#1A1A1A'];

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
                <Activity className="w-8 h-8 text-[#D4F23F]" />
                Developer Insights
            </h1>
            <p className="text-white/50 font-mono text-xs uppercase">Visualizing your coding habits and productivity patterns.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Productivity Pulse */}
                <Card className="flex flex-col items-center justify-center p-6 relative overflow-hidden">
                    <h3 className="text-lg font-black tracking-tighter uppercase mb-4 w-full flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#D4F23F]" />
                        Productivity Pulse
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" barSize={15} data={[{ name: 'Score', value: data?.productivityPulse || 0, fill: '#D4F23F' }]} startAngle={90} endAngle={-270}>
                                <RadialBar minAngle={15} background={{ fill: '#1A1A1A' }} clockWise dataKey="value" cornerRadius={0} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-4xl font-black font-mono tracking-tighter">
                                    {data?.productivityPulse}
                                </text>
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 2. Tech Stack Radar */}
                <Card className="col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-black tracking-tighter uppercase mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#D4F23F]" />
                        Tech Focus Radar
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data?.focusRadar || []}>
                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#A0A0A0', fontSize: 10, fontFamily: 'monospace' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                <Radar name="Projects" dataKey="A" stroke="#D4F23F" strokeWidth={2} fill="#D4F23F" fillOpacity={0.2} />
                                <Tooltip contentStyle={{ backgroundColor: '#020202', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0', fontFamily: 'monospace' }} itemStyle={{ color: '#D4F23F' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 3. Activity Trend */}
                <Card className="col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-black tracking-tighter uppercase mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#D4F23F]" />
                        Activity Trend (7 Days)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.activityTrend || []}>
                                <defs>
                                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4F23F" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#D4F23F" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorLearning" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EBEBEB" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#EBEBEB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#A0A0A0', fontSize: 10, fontFamily: 'monospace' }} />
                                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: '#A0A0A0', fontSize: 10, fontFamily: 'monospace' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#020202', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0', fontFamily: 'monospace' }} />
                                <Area type="step" dataKey="commits" stroke="#D4F23F" strokeWidth={2} fillOpacity={1} fill="url(#colorCommits)" />
                                <Area type="step" dataKey="learning" stroke="#EBEBEB" strokeWidth={2} fillOpacity={1} fill="url(#colorLearning)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 4. Learning Distribution */}
                <Card>
                    <h3 className="text-lg font-black tracking-tighter uppercase mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#D4F23F]" />
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
                                <Tooltip contentStyle={{ backgroundColor: '#020202', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0', fontFamily: 'monospace' }} />
                                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px', color: '#A0A0A0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DeveloperInsights;
