import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    LayoutDashboard,
    Github,
    BookOpen,
    FolderKanban,
    Code2,
    Target,
    Activity,
    Bot,
    Mic,
    GitPullRequest,
    Compass,
    KanbanSquare,
    Coffee,
    Sun,
    Moon
} from 'lucide-react';
import useThemeStore from '../store/themeStore';
import { useAuth } from '@clerk/clerk-react';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useThemeStore();
    const { signOut } = useAuth();

    const actions = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, type: 'route', path: '/dashboard' },
        { id: 'github', label: 'GitHub Stats', icon: Github, type: 'route', path: '/github' },
        { id: 'learning', label: 'Learning Modules', icon: BookOpen, type: 'route', path: '/learning' },
        { id: 'projects', label: 'Projects & Workspaces', icon: FolderKanban, type: 'route', path: '/projects' },
        { id: 'features', label: 'Feature Scoping', icon: KanbanSquare, type: 'route', path: '/features' },
        { id: 'leetcode', label: 'LeetCode Tracker', icon: Code2, type: 'route', path: '/leetcode' },
        { id: 'goals', label: 'Daily Goals', icon: Target, type: 'route', path: '/goals' },
        { id: 'standup', label: 'Daily Standup', icon: Coffee, type: 'route', path: '/standup' },
        { id: 'insights', label: 'Insights & Analytics', icon: Activity, type: 'route', path: '/insights' },
        { id: 'pr-assistant', label: 'Smart PR Assistant', icon: GitPullRequest, type: 'route', path: '/pr-assistant' },
        { id: 'cartographer', label: 'Architecture Map', icon: Compass, type: 'route', path: '/cartographer' },
        { id: 'ai-mentor', label: 'Technical Mentor', icon: Bot, type: 'route', path: '/ai-mentor' },
        { id: 'logout', label: 'Sign Out', icon: undefined, type: 'action', action: () => signOut() }
    ];

    const filteredActions = query === ''
        ? actions
        : actions.filter(action => action.label.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 50);
        } else {
            setQuery('');
        }
    }, [isOpen]);

    const executeAction = (action) => {
        if (action.type === 'route') {
            navigate(action.path);
        } else if (action.type === 'action') {
            action.action();
        }
        setIsOpen(false);
    };

    const handleInputKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredActions[selectedIndex]) {
                executeAction(filteredActions[selectedIndex]);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative z-10 w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans"
                    >
                        {/* Header / Input */}
                        <div className="flex items-center px-4 py-4 border-b border-white/10 gap-3">
                            <Search className="w-5 h-5 text-white/50" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-white/30"
                                placeholder="Type a command or search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                            />
                            <div className="px-2 py-1 text-xs font-mono text-white/50 bg-white/5 rounded">ESC</div>
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                            {filteredActions.length === 0 ? (
                                <div className="px-4 py-8 text-center text-white/40 text-sm">
                                    No commands found for "{query}"
                                </div>
                            ) : (
                                filteredActions.map((action, index) => {
                                    const isSelected = selectedIndex === index;
                                    const Icon = action.icon;
                                    return (
                                        <div
                                            key={action.id}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-[#D4F23F] text-black' : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}
                                            onClick={() => executeAction(action)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                        >
                                            {Icon && <Icon className={`w-5 h-5 ${isSelected ? 'text-black' : 'text-white/50'}`} />}
                                            <span className="font-medium">{action.label}</span>
                                            {action.type === 'route' && (
                                                <span className={`ml-auto text-xs font-mono ${isSelected ? 'text-black/60' : 'text-white/30'}`}>
                                                    GOTO
                                                </span>
                                            )}
                                            {action.type === 'action' && (
                                                <span className={`ml-auto text-xs font-mono ${isSelected ? 'text-black/60' : 'text-white/30'}`}>
                                                    ACTION
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">↑</kbd>
                                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">↓</kbd>
                                    <span>to navigate</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono">↵</kbd>
                                    <span>to select</span>
                                </span>
                            </div>
                            <div>DEV OS Kernel v2.4.0</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
