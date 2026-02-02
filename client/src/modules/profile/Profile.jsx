import React, { useState } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { User, MapPin, Link as LinkIcon, Github, Linkedin, Twitter, Globe, Edit2, Save, X, Briefcase, Code, Terminal } from 'lucide-react';
import api from '../../services/api';

const Profile = () => {
    const { user, fetchDashboardData } = useDashboardStore();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

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
                    github: formData.github,
                    linkedin: formData.linkedin,
                    twitter: formData.twitter,
                    website: formData.website
                }
            };

            await api.put('/profile', updateData);

            await fetchDashboardData(); // Refresh global store
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center">Loading Profile...</div>;

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="relative mb-12">
                <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl border border-border/50 backdrop-blur-sm"></div>
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-surface bg-surfaceHighlight overflow-hidden shadow-2xl">
                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                            <User className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="mb-2">
                        <h1 className="text-3xl font-bold">{user.name || user.username}</h1>
                        <p className="text-primary font-medium flex items-center gap-2">
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
                    <Card className="border-primary/20 bg-surface/50 backdrop-blur-md">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary" />
                            Career Stats
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-surfaceHighlight/50 rounded-lg">
                                <span className="text-text-muted">Repositories</span>
                                <span className="font-mono font-bold text-lg">{user.stats?.totalRepos || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-surfaceHighlight/50 rounded-lg">
                                <span className="text-text-muted">Commits</span>
                                <span className="font-mono font-bold text-lg">{user.stats?.totalCommits || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-surfaceHighlight/50 rounded-lg">
                                <span className="text-text-muted">Streak</span>
                                <span className="font-mono font-bold text-lg text-primary">{user.stats?.currentStreak || 0} days</span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-primary" />
                            Connect
                        </h3>
                        {isEditing ? (
                            <div className="space-y-3">
                                <SocialInput icon={Github} name="github" value={formData.github} onChange={handleChange} placeholder="GitHub URL" />
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
                    <Card className="min-h-[200px]">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            About Me
                        </h3>
                        {isEditing ? (
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full h-32 bg-surfaceHighlight border border-border rounded-lg p-3 text-text focus:outline-none focus:border-primary transition-colors resize-none"
                                placeholder="Tell us about your coding journey..."
                            />
                        ) : (
                            <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
                                {user.bio || "No bio added yet. Click 'Edit Profile' to introduce yourself!"}
                            </p>
                        )}
                    </Card>

                    <Card>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Code className="w-5 h-5 text-primary" />
                            Skills & Stack
                        </h3>
                        {isEditing ? (
                            <div>
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-text mb-2 focus:outline-none focus:border-primary"
                                    placeholder="React, Node.js, Python (comma separated)"
                                />
                                <p className="text-xs text-text-muted">Separate skills with commas</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {user.skills && user.skills.length > 0 ? (
                                    user.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="px-3 py-1 text-sm bg-surfaceHighlight hover:bg-surfaceHighlight/80 transition-colors cursor-default">
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-text-muted italic">No skills listed.</p>
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
// eslint-disable-next-line no-unused-vars
const SocialInput = ({ icon: Icon, name, value, onChange, placeholder }) => (
    <div className="flex items-center gap-2 bg-surfaceHighlight p-2 rounded border border-border focus-within:border-primary transition-colors">
        <Icon className="w-4 h-4 text-text-muted" />
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="bg-transparent border-none focus:outline-none text-sm w-full text-text"
            placeholder={placeholder}
        />
    </div>
);

// eslint-disable-next-line no-unused-vars
const SocialLink = ({ icon: Icon, label, href }) => {
    if (!href) return null;
    return (
        <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surfaceHighlight transition-all group border border-transparent hover:border-primary/20">
            <Icon className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">{label}</span>
            <LinkIcon className="w-3 h-3 text-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
    );
};

export default Profile;
