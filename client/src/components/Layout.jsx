import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Github, BookOpen, FolderKanban, Code2, Target, FileText, Bot, Activity, Sun, Moon, Mic, GitPullRequest, Compass } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import clsx from 'clsx';
import NotificationDropdown from './NotificationDropdown';
import useThemeStore from '../store/themeStore';
import useDashboardStore from '../store/dashboardStore';

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-text-muted hover:text-text hover:bg-white/5"
            )
        }
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm tracking-wide">{label}</span>
    </NavLink>
);

const Layout = ({ children }) => {
    const { theme, toggleTheme } = useThemeStore();
    const { fetchDashboardData, user } = useDashboardStore();

    // Init theme
    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    // Fetch User Data on Mount
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="flex h-screen bg-background text-text overflow-hidden font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border p-6 flex flex-col gap-8 bg-surface/30 backdrop-blur-sm z-50 h-screen sticky top-0">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent animate-pulse" />
                        <span className="text-xl font-bold tracking-tight">DEV<span className="text-primary">OS</span></span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-surfaceHighlight text-text-muted hover:text-primary transition-colors"
                        title={theme === 'cyber' ? "Switch to Light Mode" : "Switch to Cyber Mode"}
                    >
                        {theme === 'cyber' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 px-2 mt-4">Core</div>
                    <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/github" icon={Github} label="GitHub Stats" />
                    <SidebarItem to="/learning" icon={BookOpen} label="Learning" />
                    <SidebarItem to="/projects" icon={FolderKanban} label="Projects" />

                    <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 px-2 mt-6">Power</div>
                    <SidebarItem to="/leetcode" icon={Code2} label="LeetCode" />
                    <SidebarItem to="/goals" icon={Target} label="Daily Goals" />
                    <SidebarItem to="/insights" icon={Activity} label="Insights" />

                    <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 px-2 mt-4">AI Systems</div>
                    <SidebarItem to="/pr-assistant" icon={GitPullRequest} label="Smart PR" />
                    <SidebarItem to="/cartographer" icon={Compass} label="Architecture Map" />
                    <SidebarItem to="/ai-mentor" icon={Bot} label="AI Mentor" />
                    <SidebarItem to="/interview" icon={Mic} label="Mock Interview" />
                </nav>

                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-3">
                        <UserButton afterSignOutUrl="/" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">{user?.name || "User"}</span>
                            <span className="text-xs text-text-muted">Pro Plan</span>
                        </div>
                        <div className="ml-auto">
                            <NotificationDropdown />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
