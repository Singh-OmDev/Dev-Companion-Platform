import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { GitBranch, Github, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 250 });

    nodes.forEach((node) => {
        // approximate dimensions of our larger custom styled nodes
        dagreGraph.setNode(node.id, { width: 256, height: 140 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        // Shift coordinates to center the node
        node.position = {
            x: nodeWithPosition.x - 256 / 2,
            y: nodeWithPosition.y - 140 / 2,
        };

        return node;
    });

    return { nodes, edges };
};

const ArchitectureNode = ({ data, targetPosition = Position.Top, sourcePosition = Position.Bottom }) => {
    return (
        <div className={`rounded-2xl p-6 w-64 shadow-xl border-2 backdrop-blur-md transition-transform hover:scale-105 hover:shadow-primary/30 ${data.bgColors}`}>
            <Handle type="target" position={targetPosition} className="w-3 h-3 !bg-emerald-500 border-none" />
            <div className="flex flex-col items-center justify-center text-center gap-2 text-white">
                <span className="text-4xl mb-2">{data.icon}</span>
                <span className="font-bold text-lg tracking-wide text-white break-words">{data.label}</span>
                {data.type && (
                    <span className="text-xs uppercase font-mono opacity-80 tracking-widest text-white/90">
                        {data.type}
                    </span>
                )}
            </div>
            <Handle type="source" position={sourcePosition} className="w-3 h-3 !bg-emerald-500 border-none" />
        </div>
    );
};

const nodeTypes = { architecture: ArchitectureNode };

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
                let bgColors = 'bg-slate-800 border-slate-600';
                let icon = '📁';

                // Simple heuristic styling based on the AI's type assignment
                const type = (node.data?.type || '').toLowerCase();
                if (type.includes('frontend') || type.includes('ui') || type.includes('client')) {
                    bgColors = 'bg-indigo-900 border-indigo-500';
                    icon = '🖥️';
                } else if (type.includes('backend') || type.includes('api') || type.includes('server')) {
                    bgColors = 'bg-emerald-900 border-emerald-500';
                    icon = '⚙️';
                } else if (type.includes('database') || type.includes('model') || type.includes('schema')) {
                    bgColors = 'bg-amber-900 border-amber-500';
                    icon = '🗄️';
                } else if (type.includes('config') || type.includes('env')) {
                    bgColors = 'bg-slate-800 border-slate-500';
                    icon = '🔧';
                }

                return {
                    ...node,
                    type: 'architecture',
                    data: {
                        label: node.data?.label || node.id,
                        type: node.data?.type || '',
                        bgColors,
                        icon
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

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                formattedNodes,
                formattedEdges,
                'LR' // Left to Right
            );

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Analysis failed. The repository might be too large or empty.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col pb-4">
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

            <Card className="flex-1 !p-0 overflow-hidden relative border-border/50 shadow-2xl bg-background min-h-[500px]">
                {nodes.length > 0 ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                        className="bg-transparent"
                        minZoom={0.05}
                        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                    >
                        <Background color="#334155" gap={32} size={2} className="opacity-20" />
                        <Controls showInteractive={false} className="opacity-100 bg-white/10 backdrop-blur-md rounded-lg scale-150 origin-bottom-left m-4 shadow-xl border border-white/20" />
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
