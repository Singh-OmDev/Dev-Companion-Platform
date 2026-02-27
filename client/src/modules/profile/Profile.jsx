import React, { useState, useCallback, useEffect } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { User, MapPin, Link as LinkIcon, Github, Linkedin, Twitter, Globe, Edit2, Save, X, Briefcase, Code, Terminal, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { useUser } from '@clerk/clerk-react';

const Profile = () => {
    const { user, fetchDashboardData } = useDashboardStore();
    const { user: clerkUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const isGithubConnected = clerkUser?.externalAccounts?.some(acc => acc.provider === 'oauth_github');

    const connectGithub = async () => {
        try {
            console.log("Attempting to connect GitHub for Clerk user:", clerkUser.id);
            const res = await clerkUser?.createExternalAccount({
                strategy: 'oauth_github',
                redirectUrl: window.location.href,
            });
            console.log("Create External Account Response:", res);
            if (res && res.verification && res.verification.status !== 'verified') {
                const redirectUrl = res.verification.externalVerificationRedirectURL?.href;
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    alert("No redirect URL found in verification object.");
                }
            } else if (res?.verification?.status === 'verified') {
                alert("Account is already verified and connected!");
            }
        } catch (error) {
            console.error("Failed to connect GitHub", error);
            alert(`Failed to connect GitHub: ${error.message || JSON.stringify(error)}`);
        }
    };

    const handleSync = useCallback(async () => {
        // user check inside callback to avoid dependency on specific user properties if possible, 
        // but here we need user.socials.github.
        // If we include 'user' in dependency, it might change too often.
        // let's rely on user object stability or just properties needed.
        if (!user?.socials?.github) return;
        setSyncing(true);
        try {
            await api.post('/github/sync');
            await fetchDashboardData();
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            setSyncing(false);
        }
    }, [user?.socials?.github, fetchDashboardData]);

    // Auto-sync if github connected but no stats
    useEffect(() => {
        if (user?.socials?.github && (!user?.stats?.totalRepos || user?.stats?.totalRepos === 0)) {
            handleSync();
        }
    }, [handleSync, user?.socials?.github, user?.stats?.totalRepos]); // Run once on mount if condition met

    // Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        title: user?.title || '',
        bio: user?.bio || '',
        skills: user?.skills?.join(', ') || '',
        github: user?.socials?.github || '',
        linkedin: user?.socials?.linkedin || '',
        twitter: user?.socials?.twitter || '',
        website: user?.socials?.website || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
            const updateData = {
                bio: formData.bio,
                title: formData.title,
                skills: skillsArray,
                socials: {
                    github: formData.github.trim(),
                    linkedin: formData.linkedin.trim(),
                    twitter: formData.twitter.trim(),
                    website: formData.website.trim()
                }
            };

            await api.put('/profile', updateData);

            await fetchDashboardData(); // Refresh global store

            // Sync GitHub Stats if username provided
            if (updateData.socials.github) {
                await api.post('/github/sync').catch(err => console.error("Sync failed", err));
                await fetchDashboardData(); // Refetch to get updated stats
            }

            setIsEditing(false);
            // Simple feedback for now - specialized toast component would be better but this works
            // alert("Profile Updated & GitHub Synced!"); 
            // Better: just let the UI update speak for itself, or use a small temp state for "Saved!"
        } catch (err) {
            console.error(err);
            alert("Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center">Loading Profile...</div>;

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="relative mb-12">
                <div className="h-48 bg-[#0a0a0a] border border-white/10"></div>
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 border-4 border-[#020202] bg-white/5 overflow-hidden">
                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover grayscale" />
                        </div>
                        <div className="absolute inset-0 bg-[#D4F23F] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-black">
                            <User className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="mb-2">
                        <h1 className="text-3xl font-black tracking-tighter uppercase">{user.name || user.username}</h1>
                        <p className="text-[#D4F23F] font-mono text-xs uppercase flex items-center gap-2">
                            <Terminal className="w-4 h-4" />
                            {user.title || 'Full Stack Developer'}
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-4 right-8">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={loading}>
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSave} disabled={loading}>
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-12">
                {/* Left Column: Stats & Socials */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-black tracking-tighter uppercase mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-[#D4F23F]" />
                            Career Stats
                            {user?.socials?.github && (
                                <button
                                    onClick={handleSync}
                                    className={`ml-auto p-1 rounded-full hover:bg-surfaceHighlight transition-all ${syncing ? 'animate-spin' : ''}`}
                                    title="Sync GitHub Stats"
                                >
                                    <RefreshCw className="w-4 h-4 text-text-muted hover:text-primary" />
                                </button>
                            )}
                        </h3>
                        <div className="space-y-4 font-mono text-xs uppercase">
                            <div className="flex justify-between items-center p-3 border border-white/10 bg-white/5">
                                <span className="text-white/50">Repositories</span>
                                <span className="font-bold text-sm text-[#D4F23F]">{user.stats?.totalRepos || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border border-white/10 bg-white/5">
                                <span className="text-white/50">Commits</span>
                                <span className="font-bold text-sm text-[#D4F23F]">{user.stats?.totalCommits || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border border-white/10 bg-white/5">
                                <span className="text-white/50">Streak</span>
                                <span className="font-bold text-sm text-[#D4F23F]">{user.stats?.currentStreak || 0} days</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-black tracking-tighter uppercase mb-4 flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-[#D4F23F]" />
                            Connect
                        </h3>
                        {isEditing ? (
                            <div className="space-y-3">
                                {isGithubConnected ? (
                                    <div className="flex items-center gap-2 bg-white/5 p-2 border border-[#D4F23F] text-[#D4F23F]">
                                        <Github className="w-4 h-4" />
                                        <span className="text-xs font-mono uppercase font-bold">GitHub Connected</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={connectGithub}
                                        className="w-full flex items-center justify-center gap-2 bg-[#D4F23F] text-black p-2 border border-[#D4F23F] hover:bg-black hover:text-[#D4F23F] transition-colors"
                                    >
                                        <Github className="w-4 h-4" />
                                        <span className="text-xs font-mono uppercase font-black tracking-wider">Connect GitHub</span>
                                    </button>
                                )}
                                <SocialInput icon={Linkedin} name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" />
                                <SocialInput icon={Twitter} name="twitter" value={formData.twitter} onChange={handleChange} placeholder="Twitter URL" />
                                <SocialInput icon={Globe} name="website" value={formData.website} onChange={handleChange} placeholder="Portfolio URL" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <SocialLink icon={Github} label="GitHub" href={user.socials?.github} />
                                <SocialLink icon={Linkedin} label="LinkedIn" href={user.socials?.linkedin} />
                                <SocialLink icon={Twitter} label="Twitter" href={user.socials?.twitter} />
                                <SocialLink icon={Globe} label="Website" href={user.socials?.website} />
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column: Bio & Skills */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="min-h-[200px] p-6">
                        <h3 className="text-lg font-black tracking-tighter uppercase mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-[#D4F23F]" />
                            About Me
                        </h3>
                        {isEditing ? (
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full h-32 bg-[#020202] border border-white/10 p-3 text-white focus:outline-none focus:border-[#D4F23F] transition-colors resize-none font-mono text-sm"
                                placeholder="Tell us about your coding journey..."
                            />
                        ) : (
                            <p className="text-white/60 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                                {user.bio || "No bio added yet. Click 'Edit Profile' to introduce yourself!"}
                            </p>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-black tracking-tighter uppercase mb-4 flex items-center gap-2">
                            <Code className="w-5 h-5 text-[#D4F23F]" />
                            Skills & Stack
                        </h3>
                        {isEditing ? (
                            <div>
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    className="w-full bg-[#020202] border border-white/10 p-3 text-white mb-2 focus:outline-none focus:border-[#D4F23F] font-mono text-sm"
                                    placeholder="React, Node.js, Python (comma separated)"
                                />
                                <p className="text-[10px] text-white/40 font-mono uppercase">Separate skills with commas</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {user.skills && user.skills.length > 0 ? (
                                    user.skills.map((skill, index) => (
                                        <Badge key={index} variant="default" className="text-white/70">
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-white/40 italic font-mono text-xs">No skills listed.</p>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const SocialInput = ({ icon: Icon, name, value, onChange, placeholder }) => (
    <div className="flex items-center gap-2 bg-[#020202] p-2 border border-white/10 focus-within:border-[#D4F23F] transition-colors">
        <Icon className="w-4 h-4 text-white/40" />
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="bg-transparent border-none focus:outline-none text-xs font-mono w-full text-white"
            placeholder={placeholder}
        />
    </div>
);

const SocialLink = ({ icon: Icon, label, href }) => {
    if (!href) return null;
    return (
        <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-[#D4F23F] hover:text-black transition-all group border border-white/10">
            <Icon className="w-4 h-4 text-white/50 group-hover:text-black transition-colors" />
            <span className="text-xs font-mono uppercase">{label}</span>
            <LinkIcon className="w-3 h-3 text-black ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
    );
};

export default Profile;
