import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { X, BookOpen } from 'lucide-react';

const CreateTopicModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        topic: '',
        category: 'Other',
        progress: 0
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ topic: '', category: 'Other', progress: 0 });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-md border-primary bg-surface shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" /> Add Learning Goal
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Topic Title</label>
                        <Input
                            required
                            value={formData.topic}
                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            placeholder="e.g. Advanced TypeScript"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-muted mb-1">Category</label>
                        <select
                            className="w-full p-3 rounded-lg bg-surfaceHighlight border border-border text-text focus:outline-none focus:border-primary"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="DevOps">DevOps</option>
                            <option value="CS Concepts">CS Concepts</option>
                            <option value="Language">Language</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Initial Progress (%)</label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.progress}
                            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                            placeholder="0"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary">Add Goal</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateTopicModal;
