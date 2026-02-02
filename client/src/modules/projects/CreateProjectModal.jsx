import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { X, Plus, Trash } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Idea',
        techStack: '',
        githubLink: '',
        liveLink: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert comma-separated string to array
        const processedData = {
            ...formData,
            techStack: formData.techStack.split(',').map(t => t.trim()).filter(Boolean)
        };
        onSubmit(processedData);
        setFormData({ title: '', description: '', status: 'Idea', techStack: '', githubLink: '', liveLink: '' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-lg border-primary bg-surface shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6">Create New Project</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Project Title</label>
                        <Input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. AI SaaS Platform"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-muted mb-1">Description</label>
                        <textarea
                            className="w-full p-3 rounded-lg bg-surfaceHighlight border border-border text-text focus:outline-none focus:border-primary transition-colors min-h-[100px]"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What are you building?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Status</label>
                            <select
                                className="w-full p-3 rounded-lg bg-surfaceHighlight border border-border text-text focus:outline-none focus:border-primary"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Idea">Idea</option>
                                <option value="Planning">Planning</option>
                                <option value="Building">Building</option>
                                <option value="Completed">Completed</option>
                                <option value="Paused">Paused</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Tech Stack</label>
                            <Input
                                value={formData.techStack}
                                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                placeholder="React, Node, MongoDB (comma separated)"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-text-muted mb-1">GitHub Link</label>
                            <Input
                                value={formData.githubLink}
                                onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                                placeholder="https://github.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Live Demo</label>
                            <Input
                                value={formData.liveLink}
                                onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary">Create Project</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateProjectModal;
