import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { GitBranch, Github, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const Cartographer = () => {
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState('');
    const [isLoadingRepos, setIsLoadingRepos] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        fetchRepos();
    }, []);

    const fetchRepos = async () => {
        setIsLoadingRepos(true);
        setError('');
        try {
            const res = await api.get('/architecture/repos');
            setRepos(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch repositories.');
        } finally {
            setIsLoadingRepos(false);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedRepo) {
            setError('Please select a repository to map.');
            return;
        }

        setIsAnalyzing(true);
        setError('');
        setNodes([]);
        setEdges([]);

        const repoData = repos.find(r => r.full_name === selectedRepo);
        if (!repoData) return;

        try {
            const res = await api.post('/architecture/analyze', {
                owner: repoData.owner,
                repo: repoData.name,
                branch: repoData.default_branch || 'main'
            });

            // Format nodes with custom styling based on their type
            const formattedNodes = res.data.nodes.map(node => {
                let bgColors = 'bg-surface border-border';
                let icon = '📁';

                // Simple heuristic styling based on the AI's type assignment
                const type = (node.data?.type || '').toLowerCase();
                if (type.includes('frontend') || type.includes('ui') || type.includes('client')) {
                    bgColors = 'bg-indigo-900/40 border-indigo-500/50 text-indigo-200';
                    icon = '🖥️';
                } else if (type.includes('backend') || type.includes('api') || type.includes('server')) {
                    bgColors = 'bg-emerald-900/40 border-emerald-500/50 text-emerald-200';
                    icon = '⚙️';
                } else if (type.includes('database') || type.includes('model') || type.includes('schema')) {
                    bgColors = 'bg-amber-900/40 border-amber-500/50 text-amber-200';
                    icon = '🗄️';
                } else if (type.includes('config') || type.includes('env')) {
                    bgColors = 'bg-slate-800/60 border-slate-500/50 text-slate-300';
                    icon = '🔧';
                }

                return {
                    ...node,
                    className: `rounded-xl p-4 min-w-[150px] shadow-lg border-2 backdrop-blur-md transition-all hover:shadow-primary/20 ${bgColors}`,
                    data: {
                        label: (
                            <div className="flex flex-col items-center justify-center text-center gap-1">
                                <span className="text-xl">{icon}</span>
                                <span className="font-bold text-sm tracking-wide">{node.data?.label || node.id}</span>
                                {node.data?.type && (
                                    <span className="text-[10px] uppercase font-mono opacity-60 tracking-wider">
                                        {node.data.type}
                                    </span>
                                )}
                            </div>
                        )
                    }
                };
            });

            // Format edges with animated styling
            const formattedEdges = res.data.edges.map(edge => ({
                ...edge,
                animated: true,
                style: { stroke: '#10b981', strokeWidth: 2, opacity: 0.6 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#10b981',
                },
            }));

            setNodes(formattedNodes);
            setEdges(formattedEdges);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Analysis failed. The repository might be too large or empty.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Repository Cartographer</h1>
                    <p className="text-textSecondary mt-1">AI-powered architectural visualization of your codebases.</p>
                </div>
            </div>

            {error && (
                <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-xl flex items-center gap-3 shrink-0">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <Card className="p-4 flex flex-col sm:flex-row items-end gap-4 shrink-0 border-border/50 bg-surfaceHighlight/50 backdrop-blur-sm">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-textSecondary mb-2 flex items-center gap-2">
                        <Github className="w-4 h-4" /> Select Repository to Map
                    </label>
                    <select
                        className="w-full p-3 rounded-xl bg-background border border-border text-text focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
                        value={selectedRepo}
                        onChange={(e) => setSelectedRepo(e.target.value)}
                        disabled={isLoadingRepos || isAnalyzing}
                    >
                        <option value="" disabled>
                            {isLoadingRepos ? 'Loading Repositories...' : 'Choose a repository...'}
                        </option>
                        {repos.map(repo => (
                            <option key={repo.id} value={repo.full_name}>{repo.name}</option>
                        ))}
                    </select>
                </div>

                <Button
                    variant="primary"
                    className="w-full sm:w-auto px-8 py-3 whitespace-nowrap"
                    onClick={handleAnalyze}
                    disabled={!selectedRepo || isAnalyzing}
                >
                    {isAnalyzing ? (
                        <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Mapping Architecture...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Map
                        </>
                    )}
                </Button>
            </Card>

            <Card className="flex-1 !p-0 overflow-hidden relative border-border/50 shadow-2xl bg-background">
                {nodes.length > 0 ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                        className="bg-transparent"
                        minZoom={0.2}
                        maxZoom={4}
                    >
                        <Background color="#334155" gap={24} size={2} className="opacity-20" />
                        <Controls className="fill-text-muted bg-surface border border-border rounded-lg shadow-lg" showInteractive={false} />
                        <MiniMap
                            className="bg-surface border border-border rounded-lg shadow-lg overflow-hidden"
                            nodeColor={(n) => {
                                if (n.className?.includes('indigo')) return '#818cf8';
                                if (n.className?.includes('emerald')) return '#34d399';
                                if (n.className?.includes('amber')) return '#fbbf24';
                                return '#94a3b8';
                            }}
                            maskColor="rgba(15, 23, 42, 0.7)"
                        />
                    </ReactFlow>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted/40 p-8 text-center bg-gradient-to-b from-transparent to-surfaceHighlight/20">
                        <GitBranch className="w-24 h-24 mb-6 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">The Canvas is Empty</h3>
                        <p className="max-w-md">Select an open-source or personal repository above and our AI will recursively scan its structure to build an interactive architectural node map.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Cartographer;
