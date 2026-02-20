import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { BookOpen, Video, FileText, Plus, MoreHorizontal } from 'lucide-react';
import CreateTopicModal from './CreateTopicModal';
import api from '../../services/api';

const TopicCard = ({ topic }) => (
    <Card className="hover:border-primary/50 transition-all group relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
            <div>
                <Badge variant="success" className="mb-2 uppercase tracking-widest text-[10px]">{topic.category}</Badge>
                <h3 className="text-xl font-bold">{topic.title}</h3>
            </div>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4" /></Button>
        </div>

        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">Progress</span>
                <span className="font-mono text-primary">{topic.progress}%</span>
            </div>
            <div className="w-full h-2 bg-surfaceHighlight rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${topic.progress}%` }}
                />
            </div>
        </div>

        <div className="space-y-2">
            {topic.resources?.map((res, i) => (
                <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors p-2 rounded hover:bg-surfaceHighlight">
                    {res.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    <span className="truncate">{res.title}</span>
                </a>
            ))}
        </div>
    </Card>
);

// ... (TopicCard stays same, but remove it from here if reused, assume keeping for now)

const LearningTracker = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTopics = async () => {
        try {
            const res = await api.get('/learning');
            setTopics(res.data);
        } catch {
            console.error("Failed to fetch learning topics");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async (data) => {
        try {
            const res = await api.post('/learning', data);
            setTopics([...topics, res.data]);
            setIsModalOpen(false);
        } catch {
            console.error("Failed to create topic");
        }
    };

    React.useEffect(() => {
        fetchTopics();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Learning Tracker</h1>
                    <p className="text-text-muted mt-1">Master your stack, one topic at a time.</p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Topic
                </Button>
            </div>

            {loading ? (
                <div className="p-10 text-center animate-pulse">Loading Learning Goals...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map(topic => (
                        <TopicCard key={topic._id} topic={topic} />
                    ))}

                    {/* Add New Placeholder - Clicking this also opens modal */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-text-muted hover:text-primary hover:border-primary/50 transition-all min-h-[300px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-surfaceHighlight flex items-center justify-center mb-4">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-medium">Add New Goal</span>
                    </button>
                </div>
            )}

            <CreateTopicModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTopic}
            />
        </div>
    );
};

export default LearningTracker;
