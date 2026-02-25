import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Github, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const KanbanBoard = ({ feature, onFeatureUpdate }) => {
    const [syncing, setSyncing] = useState(false);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const res = await api.put(`/features/${feature._id}/tasks/${taskId}`, { status: newStatus });
            onFeatureUpdate(res.data);
        } catch (err) {
            console.error("Failed to update task", err);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await api.post(`/features/${feature._id}/sync`);
            if (res.data.syncedCount > 0) {
                alert(`Successfully synced ${res.data.syncedCount} task(s) from GitHub!`);
                onFeatureUpdate(res.data.feature);
            } else {
                alert("No matching GitHub commits found for these tasks. Make sure to include the Task ID in your commit message (e.g. 'Fixes F12-T1').");
            }
        } catch (err) {
            console.error("GitHub sync failed", err);
            alert("Failed to sync with GitHub.");
        } finally {
            setSyncing(false);
        }
    };

    const columns = [
        { id: 'Todo', title: 'To Do', color: 'border-text-muted/30' },
        { id: 'In Progress', title: 'In Progress', color: 'border-primary/50' },
        { id: 'Done', title: 'Done', color: 'border-success/50' }
    ];

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <Badge variant="default">{feature.tasks?.length || 0} Tickets</Badge>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    <Github className="w-4 h-4" />
                    Sync Commits
                </Button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                {columns.map(col => (
                    <div key={col.id} className={`flex flex-col bg-surfaceHighlight/30 rounded-xl border ${col.color} overflow-hidden`}>
                        <div className="p-4 border-b border-border bg-surfaceHighlight/50 font-bold flex justify-between items-center">
                            {col.title}
                            <Badge variant="default" className="text-xs">
                                {feature.tasks?.filter(t => t.status === col.id).length || 0}
                            </Badge>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {feature.tasks?.filter(t => t.status === col.id).map(task => (
                                <Card key={task.taskId} className="p-4 border border-border hover:border-primary/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="text-xs font-mono text-primary border-primary/30">
                                            {task.taskId}
                                        </Badge>
                                        {col.id === 'Done' && <CheckCircle2 className="w-4 h-4 text-success" />}
                                    </div>
                                    <h4 className="font-bold text-sm mb-2">{task.title}</h4>
                                    <p className="text-xs text-text-muted line-clamp-3 mb-4">{task.description}</p>

                                    <div className="flex justify-start gap-2 pt-2 border-t border-border mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        {col.id !== 'Todo' && (
                                            <button
                                                onClick={() => handleStatusChange(task.taskId, 'Todo')}
                                                className="text-xs text-text-muted hover:text-white transition-colors"
                                            >
                                                To Do
                                            </button>
                                        )}
                                        {col.id !== 'In Progress' && (
                                            <button
                                                onClick={() => handleStatusChange(task.taskId, 'In Progress')}
                                                className="text-xs text-text-muted hover:text-primary transition-colors"
                                            >
                                                In Progress
                                            </button>
                                        )}
                                        {col.id !== 'Done' && (
                                            <button
                                                onClick={() => handleStatusChange(task.taskId, 'Done')}
                                                className="text-xs text-text-muted hover:text-success transition-colors"
                                            >
                                                Done
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;
