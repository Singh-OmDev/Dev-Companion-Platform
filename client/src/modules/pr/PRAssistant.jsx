import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { GitPullRequest, GitBranch, Github, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const PRAssistant = () => {
    const [repos, setRepos] = useState([]);
    const [branches, setBranches] = useState([]);

    const [selectedRepo, setSelectedRepo] = useState('');
    const [baseBranch, setBaseBranch] = useState('');
    const [headBranch, setHeadBranch] = useState('');

    const [isLoadingRepos, setIsLoadingRepos] = useState(true);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRepos();
    }, []);

    const fetchRepos = async () => {
        setIsLoadingRepos(true);
        setError('');
        try {
            const res = await api.get('/pr/repos');
            setRepos(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch repositories.');
        } finally {
            setIsLoadingRepos(false);
        }
    };

    const fetchBranches = async (repoFullName) => {
        if (!repoFullName) {
            setBranches([]);
            return;
        }

        setIsLoadingBranches(true);
        setError('');
        const [owner, name] = repoFullName.split('/');
        try {
            const res = await api.get(`/pr/branches/${owner}/${name}`);
            setBranches(res.data);

            // Auto-select common base branch if available
            let defaultBase = '';
            if (res.data.includes('main')) defaultBase = 'main';
            else if (res.data.includes('master')) defaultBase = 'master';
            else defaultBase = res.data[0] || '';

            setBaseBranch(defaultBase);

            // Auto-select head branch ensuring it's different from base
            if (res.data.length > 1) {
                const differentBranch = res.data.find(b => b !== defaultBase);
                if (differentBranch) setHeadBranch(differentBranch);
            } else {
                setHeadBranch(''); // Force them to create a branch or leave empty
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch branches.');
        } finally {
            setIsLoadingBranches(false);
        }
    };

    const handleRepoChange = (e) => {
        const repoFullName = e.target.value;
        setSelectedRepo(repoFullName);
        setBaseBranch('');
        setHeadBranch('');
        fetchBranches(repoFullName);
    };

    const handleGenerate = async () => {
        if (!selectedRepo || !baseBranch || !headBranch) {
            setError('Please select a repository and both branches.');
            return;
        }

        if (baseBranch === headBranch) {
            setError('Base and Head branches must be different.');
            return;
        }

        setIsGenerating(true);
        setError('');
        setResult('');

        const [owner, name] = selectedRepo.split('/');

        try {
            const res = await api.post('/pr/generate', {
                owner,
                repo: name,
                base: baseBranch,
                head: headBranch
            });
            setResult(res.data.markdown);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Failed to generate PR description. The diff might be empty.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Smart PR Assistant</h1>
                    <p className="text-textSecondary mt-1">Generate perfect pull request descriptions instantly from your code diffs.</p>
                </div>
            </div>

            {error && (
                <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                {/* Configuration Panel */}
                <div className="lg:col-span-4 space-y-6 flex flex-col">
                    <Card className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                            <Github className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold">Configuration</h2>
                        </div>

                        <div className="space-y-5 flex-1">
                            <div>
                                <label className="block text-sm font-medium text-textSecondary mb-1.5">Repository</label>
                                <select
                                    className="w-full p-2.5 rounded-lg bg-surfaceHighlight border border-border text-text focus:outline-none focus:border-primary disabled:opacity-50"
                                    value={selectedRepo}
                                    onChange={handleRepoChange}
                                    disabled={isLoadingRepos || isGenerating}
                                >
                                    <option value="" disabled>
                                        {isLoadingRepos ? 'Loading Repositories...' : 'Select a Repository'}
                                    </option>
                                    {repos.map(repo => (
                                        <option key={repo.id} value={repo.full_name}>{repo.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textSecondary mb-1.5 flex items-center gap-2">
                                    <GitBranch className="w-4 h-4" /> Base Branch
                                </label>
                                <select
                                    className="w-full p-2.5 rounded-lg bg-surfaceHighlight border border-border text-text focus:outline-none focus:border-primary disabled:opacity-50"
                                    value={baseBranch}
                                    onChange={(e) => setBaseBranch(e.target.value)}
                                    disabled={!selectedRepo || isLoadingBranches || isGenerating}
                                >
                                    <option value="" disabled>Select base (e.g., main)</option>
                                    {branches.map(b => (
                                        <option key={`base-${b}`} value={b} disabled={b === headBranch}>
                                            {b} {b === headBranch ? '(Used as Head)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-textSecondary mt-1">The branch you want to merge into.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textSecondary mb-1.5 flex items-center gap-2">
                                    <GitPullRequest className="w-4 h-4" /> Head Branch
                                </label>
                                <select
                                    className="w-full p-2.5 rounded-lg bg-surfaceHighlight border border-border text-text focus:outline-none focus:border-primary disabled:opacity-50"
                                    value={headBranch}
                                    onChange={(e) => setHeadBranch(e.target.value)}
                                    disabled={!selectedRepo || isLoadingBranches || isGenerating}
                                >
                                    <option value="" disabled>Select head (e.g., feature-xyz)</option>
                                    {branches.map(b => (
                                        <option key={`head-${b}`} value={b} disabled={b === baseBranch}>
                                            {b} {b === baseBranch ? '(Used as Base)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-textSecondary mt-1">The branch containing your changes.</p>

                                {branches.length === 1 && (
                                    <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        This repository only has 1 branch. You need at least 2 branches to make a PR.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-border">
                            <Button
                                variant="primary"
                                className="w-full py-3"
                                onClick={handleGenerate}
                                disabled={!selectedRepo || !baseBranch || !headBranch || isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                                        Analyzing Diff...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generate PR Description
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Result Panel */}
                <div className="lg:col-span-8 flex flex-col h-[600px] lg:h-auto">
                    <Card className="flex-1 flex flex-col !p-0 overflow-hidden border-border/50">
                        <div className="bg-surfaceHighlight p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-textPrimary">Generated Output (Markdown)</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                disabled={!result}
                                className={copied ? "text-success hover:text-success" : ""}
                            >
                                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                        </div>

                        <div className="flex-1 bg-surface/50 p-6 overflow-y-auto font-mono text-sm leading-relaxed custom-scrollbar whitespace-pre-wrap text-textSecondary">
                            {result ? (
                                result
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-text-muted/50">
                                    <GitPullRequest className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Select your branches and click Generate to see the magic.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PRAssistant;
