import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { GitBranch, Github, Sparkles, AlertCircle, RefreshCw, FileText, X, Copy, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import { useUser } from '@clerk/clerk-react';
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
        <div className={`rounded-2xl p-6 w-64 shadow-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-gradient-to-br ${data.bgColors}`}>
            <Handle type="target" position={targetPosition} className="w-4 h-4 !bg-primary border-4 !border-surface shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-transform hover:scale-125" />

            <div className="flex flex-col items-center justify-center text-center gap-3 text-white">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-inner">
                    <span className="text-5xl block drop-shadow-lg">{data.icon}</span>
                </div>

                <div className="space-y-1">
                    <span className="font-extrabold text-xl tracking-wide text-white drop-shadow-md break-words block">{data.label}</span>
                    {data.type && (
                        <span className="inline-block px-3 py-1 rounded-full bg-black/30 border border-white/10 text-[10px] font-bold uppercase font-mono tracking-widest text-white/90 shadow-sm">
                            {data.type}
                        </span>
                    )}
                </div>
            </div>

            <Handle type="source" position={sourcePosition} className="w-4 h-4 !bg-primary border-4 !border-surface shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-transform hover:scale-125" />
        </div>
    );
};

const nodeTypes = { architecture: ArchitectureNode };

const Cartographer = () => {
    const { user: clerkUser } = useUser();
    const isGithubConnected = clerkUser?.externalAccounts?.some(acc => acc.provider === 'oauth_github');

    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState('');
    const [isLoadingRepos, setIsLoadingRepos] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // States for AI Documentation
    const [selectedNodeData, setSelectedNodeData] = useState(null);
    const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
    const [generatedDocs, setGeneratedDocs] = useState(null);
    const [showDocsPanel, setShowDocsPanel] = useState(false);
    const [copied, setCopied] = useState(false);

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
        setSelectedNodeData(null);
        setShowDocsPanel(false);
        setGeneratedDocs(null);

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
                // Heuristics to classify modules
                let type = 'service';
                let bgColors = 'from-slate-800 to-slate-900 border-slate-700 hover:border-slate-500';
                let icon = '📁';

                const lowerLabel = (node.data?.label || node.id).toLowerCase();
                const lowerPath = (node.data?.path || '').toLowerCase();
                const repoName = repoData.name.toLowerCase();

                if (lowerPath.includes('client') || lowerPath.includes('frontend') || lowerPath.includes('ui') || lowerPath.includes('components')) {
                    type = 'frontend';
                    bgColors = 'from-indigo-600 to-indigo-900 border-indigo-400/50 hover:border-indigo-300 shadow-[0_0_15px_rgba(79,70,229,0.2)]';
                    icon = '🖥️';
                } else if (lowerPath.includes('server') || lowerPath.includes('backend') || lowerPath.includes('api') || lowerPath.includes('routes') || lowerPath.includes('controllers')) {
                    type = 'backend';
                    bgColors = 'from-emerald-600 to-emerald-900 border-emerald-400/50 hover:border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
                    icon = '⚙️';
                } else if (lowerLabel.includes('db') || lowerLabel.includes('database') || lowerLabel.includes('model') || lowerLabel.includes('schema') || lowerLabel.includes('prisma')) {
                    type = 'database';
                    bgColors = 'from-amber-600 to-amber-900 border-amber-400/50 hover:border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
                    icon = '🗄️';
                } else if (lowerLabel.includes('config') || lowerLabel.includes('env') || lowerLabel.includes('setup')) {
                    type = 'config';
                    bgColors = 'from-slate-700 to-slate-800 border-slate-500 hover:border-slate-400';
                    icon = '🔧';
                } else if (lowerLabel === 'root' || lowerLabel === repoName) {
                    type = 'root';
                    bgColors = 'from-blue-600 to-blue-950 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]';
                    icon = '🚀';
                }

                return {
                    ...node,
                    type: 'architecture',
                    data: {
                        label: node.data?.label || node.id,
                        type,
                        bgColors,
                        icon
                    }
                };
            });

            // Format edges with smooth curves, animated flow, and glowing shadow
            const formattedEdges = res.data.edges.map(edge => ({
                ...edge,
                type: 'smoothstep', // Gives it a PCB-like rounded right-angle look
                animated: true,
                style: {
                    stroke: '#10b981',
                    strokeWidth: 3,
                    opacity: 0.8,
                    filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))'
                },
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
                'TB' // Top to Bottom
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

    const handleNodeClick = async (event, node) => {
        const repoData = repos.find(r => r.full_name === selectedRepo);
        if (!repoData) return;

        setSelectedNodeData({
            id: node.id,
            label: node.data.label,
            type: node.data.type
        });
        setShowDocsPanel(true);
        setIsGeneratingDocs(true);
        setGeneratedDocs(null);

        try {
            const res = await api.post('/ai/generate-docs', {
                owner: repoData.owner,
                repo: repoData.name,
                branch: repoData.default_branch || 'main',
                path: node.id // Assuming node.id is the full path
            });
            setGeneratedDocs(res.data.markdown);
        } catch (err) {
            console.error("Failed to generate docs", err);
            setGeneratedDocs("⚠️ Failed to generate documentation. " + (err.response?.data?.msg || err.message));
        } finally {
            setIsGeneratingDocs(false);
        }
    };

    const handleCopyDocs = () => {
        if (generatedDocs) {
            navigator.clipboard.writeText(generatedDocs);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col pb-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Repository Cartographer</h1>
                    <p className="text-textSecondary mt-1">Automated architectural visualization of your codebases.</p>
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
                    <div className="text-sm font-medium text-textSecondary mb-2 flex items-center justify-between">
                        <label className="flex items-center gap-2">
                            <Github className="w-4 h-4" /> Select Repository to Map
                        </label>
                        {isGithubConnected ? (
                            <Badge className="bg-[#D4F23F]/10 text-[#D4F23F] border-[#D4F23F]/30 uppercase text-[10px] font-black tracking-wider shadow-[0_0_10px_rgba(212,242,63,0.2)]">
                                Private Repos Unlocked
                            </Badge>
                        ) : (
                            <Badge className="bg-white/5 text-white/50 border-white/10 uppercase text-[10px] font-bold tracking-wider">
                                Public Repos Only
                            </Badge>
                        )}
                    </div>
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

            <Card className="flex-1 !p-0 overflow-hidden relative border-border/50 shadow-2xl bg-background min-h-[600px]">
                {nodes.length > 0 ? (
                    <div className="w-full h-full min-h-[600px]">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onNodeClick={handleNodeClick}
                            fitView
                            fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
                            className="bg-transparent"
                            minZoom={0.05}
                            panOnScroll={true}
                            zoomOnScroll={false}
                            panOnDrag={true}
                            selectionOnDrag={false}
                        >
                            <Background color="#334155" gap={32} size={2} className="opacity-20" />
                            <Controls
                                showInteractive={false}
                                fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
                                className="!bg-slate-900 border-none !shadow-2xl overflow-hidden rounded-md [&>button]:!bg-slate-800 [&>button]:!border-b [&>button]:!border-slate-700/50 hover:[&>button]:!bg-slate-700 [&>button>svg]:!fill-slate-300 [&>button>svg]:!max-w-[16px] [&>button>svg]:!max-h-[16px] transition-colors"
                            />
                        </ReactFlow>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted/40 p-8 text-center bg-gradient-to-b from-transparent to-surfaceHighlight/20">
                        <GitBranch className="w-24 h-24 mb-6 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">The Canvas is Empty</h3>
                        <p className="max-w-md">Select an open-source or personal repository above and the system will recursively scan its structure to build an interactive architectural node map.</p>
                    </div>
                )}
            </Card>

            {/* AI Documentation Side Panel */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-surfaceHighlight/95 backdrop-blur-xl border-l border-border/50 shadow-2xl transition-transform duration-300 ease-in-out z-50 flex flex-col ${showDocsPanel ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/50 bg-surface/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">AI Module Insight</h2>
                            <p className="text-sm text-textSecondary font-mono">{selectedNodeData?.label}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDocsPanel(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-textSecondary hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
                    {isGeneratingDocs ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                            <Sparkles className="w-12 h-12 text-primary/50 mb-2" />
                            <h3 className="text-xl font-semibold text-white">Generating Documentation...</h3>
                            <p className="text-sm text-textSecondary max-w-[250px]">
                                Reading files in <span className="text-primary">{selectedNodeData?.label}</span> to understand their purpose and architecture.
                            </p>
                            <div className="w-48 h-1 bg-surfaceHighlight rounded-full overflow-hidden mt-6">
                                <div className="h-full bg-primary animate-[translate-x_1.5s_infinite]"></div>
                            </div>
                        </div>
                    ) : generatedDocs ? (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="prose prose-invert prose-emerald max-w-none">
                                {/* Simple text render to avoid adding more complex markdown library dependencies if not available. */}
                                <pre className="font-sans text-sm text-text bg-transparent whitespace-pre-wrap">{generatedDocs}</pre>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer Action */}
                {!isGeneratingDocs && generatedDocs && (
                    <div className="p-6 border-t border-border/50 bg-surface/50">
                        <Button
                            variant={copied ? "primary" : "secondary"}
                            className="w-full flex items-center justify-center gap-2"
                            onClick={handleCopyDocs}
                        >
                            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied to Clipboard!' : 'Copy Markdown'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Backdrop for mobile */}
            {showDocsPanel && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 sm:hidden block backdrop-blur-sm"
                    onClick={() => setShowDocsPanel(false)}
                />
            )}
        </div>
    );
};

export default Cartographer;
