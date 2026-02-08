import React, { useEffect, useState } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Github, GitCommit, Star, GitBranch, MapPin, Link as LinkIcon, Code } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const GithubStats = () => {




    const { user: dashboardUser } = useDashboardStore();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState(null);

    // Use real data if available, otherwise fallback to mock
    const languageData = user?.languages || [];

    const contributionData = user?.contributions || [];

    useEffect(() => {
        const fetchGithubData = async () => {
            // Priority: 1. User's linked GitHub (socials), 2. Prompt to connect
            let githubUsername = dashboardUser?.socials?.github;

            if (githubUsername && githubUsername.includes('github.com')) {
                const parts = githubUsername.split('/').filter(Boolean);
                githubUsername = parts[parts.length - 1];
            }

            if (!githubUsername) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`http://localhost:5000/api/github/stats/${githubUsername}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error("Failed to fetch", err);
                setError("Could not load GitHub data. Please check your username.");
            } finally {
                setLoading(false);
            }
        };

        if (dashboardUser) {
            fetchGithubData();
        }
    }, [dashboardUser]);

    if (loading) return <div className="p-10 text-center animate-pulse">Loading GitHub Data...</div>;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-fade-in">
                <Github className="w-16 h-16 text-text-muted opacity-50" />
                <h2 className="text-2xl font-bold">No GitHub Account Linked</h2>
                <p className="text-text-muted max-w-md">
                    Connect your GitHub account in your Profile settings to see your stats, repositories, and activity here.
                </p>
                <Button variant="primary" onClick={() => window.location.href = '/profile'}>
                    Go to Profile Settings
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Profile */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-surface border border-border p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

                <img
                    src={user?.avatar_url || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-surfaceHighlight shadow-2xl"
                />

                <div className="flex-1 text-center md:text-left relative z-10">
                    <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-3">
                        {user?.name || user?.login}
                        <Badge variant="primary">Pro</Badge>
                    </h1>
                    <p className="text-text-muted mt-2 max-w-xl">{user?.bio || "Full Stack Developer building the future of web."}</p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-text-muted">
                        {user?.location && (
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.location}</span>
                        )}
                        {user?.blog && (
                            <span className="flex items-center gap-1"><LinkIcon className="w-4 h-4" /> {user.blog}</span>
                        )}
                        <span className="flex items-center gap-1"><Github className="w-4 h-4" /> @{user?.login}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[150px]">
                    <Button variant="primary" onClick={() => window.open(user?.html_url, '_blank')}>
                        <Github className="w-4 h-4 mr-2" /> View Profile
                    </Button>
                    <Button variant="secondary" onClick={async () => {
                        try {
                            setLoading(true);
                            await fetch('http://localhost:5000/api/github/sync', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                            });
                            window.location.reload();
                        } catch (e) {
                            console.error(e);
                            setLoading(false);
                        }
                    }}>Sync Data</Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="flex flex-col items-center justify-center py-8">
                    <span className="text-4xl font-bold">{user?.public_repos}</span>
                    <span className="text-text-muted text-sm mt-1">Repositories</span>
                </Card>
                <Card className="flex flex-col items-center justify-center py-8">
                    <span className="text-4xl font-bold">{user?.followers}</span>
                    <span className="text-text-muted text-sm mt-1">Followers</span>
                </Card>
                <Card className="flex flex-col items-center justify-center py-8">
                    <span className="text-4xl font-bold">{user?.following}</span>
                    <span className="text-text-muted text-sm mt-1">Following</span>
                </Card>
                <Card className="flex flex-col items-center justify-center py-8">
                    <span className="text-4xl font-bold">{user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}</span>
                    <span className="text-text-muted text-sm mt-1">Joined Year</span>
                </Card>
            </div>

            {/* Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Languages */}
                <Card>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Code className="w-5 h-5 text-accent" /> Top Languages
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={languageData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {languageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#2A2A2A', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E5E5' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        {languageData.map(lang => (
                            <div key={lang.name} className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                                {lang.name}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-primary" /> Contribution Activity
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contributionData}>
                                <XAxis dataKey="day" hide />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#2A2A2A', borderRadius: '8px' }}
                                    itemStyle={{ color: '#D4F23F' }}
                                />
                                <Bar dataKey="commits" fill="#D4F23F" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-center text-sm text-text-muted mt-4">Last 14 Days of Activity</p>
                </Card>
            </div>
        </div>
    );
};

export default GithubStats;
