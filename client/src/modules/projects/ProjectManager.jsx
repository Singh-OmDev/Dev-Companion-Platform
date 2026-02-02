import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FolderGit2, Github, ExternalLink, Calendar, Plus, Sparkles, X } from 'lucide-react';
import axios from 'axios';

const ReviewModal = ({ isOpen, onClose, reviewData, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto border-primary bg-surface shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    AI Code Audit
                </h2>

                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <Sparkles className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-text-muted animate-pulse">Analyzing architecture, security, and performance...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-surfaceHighlight rounded-lg border border-border">
                            <div>
                                <p className="text-sm text-text-muted">Health Score</p>
                                <p className="text-3xl font-bold font-mono text-primary">{reviewData?.score}/100</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-text-muted">Status</p>
                                <Badge variant={reviewData?.score > 80 ? 'success' : 'warning'}>
                                    {reviewData?.score > 80 ? 'Production Ready' : 'Needs Work'}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold mb-2">Recommendations</h3>
                            <ul className="space-y-3">
                                {reviewData?.feedback?.map((point, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-gray-300 bg-black/20 p-3 rounded border border-white/5">
                                        <span className="text-primary mt-1">•</span>
                                        <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="secondary" onClick={onClose}>Close</Button>
                            <Button variant="primary">Apply Fixes</Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

const ProjectCard = ({ project, onReview }) => {
    const statusColors = {
        'Idea': 'default',
        'Planning': 'warning',
        'Building': 'primary',
        'Completed': 'success',
        'Paused': 'danger'
    };

    return (
        <Card className="hover:border-primary/50 transition-all flex flex-col h-full group relative">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-surfaceHighlight flex items-center justify-center text-primary">
                    <FolderGit2 className="w-5 h-5" />
                </div>
                <Badge variant={statusColors[project.status]}>{project.status}</Badge>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
            <p className="text-text-muted text-sm mb-6 flex-1 line-clamp-3">{project.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack.map(tech => (
                    <span key={tech} className="text-xs font-mono bg-surfaceHighlight px-2 py-1 rounded text-text-muted border border-border">
                        {tech}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <div className="flex gap-2">
                    {project.githubLink && (
                        <a href={project.githubLink} className="p-2 rounded-full hover:bg-surfaceHighlight text-text-muted hover:text-white transition-colors">
                            <Github className="w-4 h-4" />
                        </a>
                    )}
                    {project.liveLink && (
                        <a href={project.liveLink} className="p-2 rounded-full hover:bg-surfaceHighlight text-text-muted hover:text-white transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>
                <Button size="sm" variant="ghost" className="text-xs group/btn" onClick={() => onReview(project)}>
                    <Sparkles className="w-3 h-3 mr-1 group-hover/btn:text-primary transition-colors" /> AI Review
                </Button>
            </div>
        </Card>
    );
};

const ProjectManager = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewData, setReviewData] = useState(null);

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchProjects = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/projects', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProjects(res.data);
        } catch {
            console.error("Failed to fetch projects");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchProjects();
    }, []);

    const handleReview = async (project) => {
        setIsModalOpen(true);
        setReviewLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/ai/project-review', { project });
            setReviewData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            const res = await axios.post('http://localhost:5000/api/projects', projectData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProjects([res.data, ...projects]);
            setIsCreateModalOpen(false);
        } catch (err) {
            console.error("Failed to create project", err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Project Manager</h1>
                    <p className="text-text-muted mt-1">Ship side-projects like a pro.</p>
                </div>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> New Project
                </Button>
            </div>

            {loading ? (
                <div className="p-10 text-center animate-pulse">Loading Projects...</div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-surfaceHighlight/50 rounded-xl border-2 border-dashed border-border">
                    <p className="text-text-muted mb-4">No projects yet. Start building something!</p>
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>Create Your First Project</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(p => (
                        <ProjectCard key={p._id} project={p} onReview={handleReview} />
                    ))}
                </div>
            )}

            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                loading={reviewLoading}
                reviewData={reviewData}
            />

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateProject}
            />
        </div>
    );
};

export default ProjectManager;

