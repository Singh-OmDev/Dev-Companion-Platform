import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Github, BookOpen, FolderKanban, Code2, Target, FileText, Bot, Activity, Sun, Moon, Mic, GitPullRequest, Compass, KanbanSquare, Coffee } from 'lucide-react';
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
                "flex items-center gap-3 px-4 py-3 border-l-2 transition-all duration-200 group",
                isActive
                    ? "border-[#D4F23F] bg-[#D4F23F]/5 text-[#D4F23F]"
                    : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
            )
        }
    >
        <Icon className={clsx("w-5 h-5", ({ isActive }) => isActive ? "text-[#D4F23F]" : "text-white/50 group-hover:text-white")} />
        <span className="font-mono text-sm tracking-wide uppercase">{label}</span>
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
        <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-8 bg-[#020202] z-50 h-screen sticky top-0">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-6 h-6 bg-[#D4F23F] group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-black tracking-tighter uppercase">DEV<span className="text-[#D4F23F]">OS</span></span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-surfaceHighlight text-text-muted hover:text-primary transition-colors"
                        title={theme === 'cyber' ? "Switch to Light Mode" : "Switch to Cyber Mode"}
                    >
                        {theme === 'cyber' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="flex flex-col gap-1 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2 px-4 mt-4">Core</div>
                    <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/github" icon={Github} label="GitHub Stats" />
                    <SidebarItem to="/learning" icon={BookOpen} label="Learning" />
                    <SidebarItem to="/projects" icon={FolderKanban} label="Projects" />
                    <SidebarItem to="/features" icon={KanbanSquare} label="Feature Scoping" />

                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2 px-4 mt-6">Power</div>
                    <SidebarItem to="/leetcode" icon={Code2} label="LeetCode" />
                    <SidebarItem to="/goals" icon={Target} label="Daily Goals" />
                    <SidebarItem to="/standup" icon={Coffee} label="Daily Standup" />
                    <SidebarItem to="/insights" icon={Activity} label="Insights" />

                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2 px-4 mt-4">Advanced Systems</div>
                    <SidebarItem to="/pr-assistant" icon={GitPullRequest} label="Smart PR" />
                    <SidebarItem to="/cartographer" icon={Compass} label="Architecture Map" />
                    <SidebarItem to="/ai-mentor" icon={Bot} label="Technical Mentor" />
                    <SidebarItem to="/interview" icon={Mic} label="Mock Interview" />
                </nav>

                <div className="p-4 bg-[#0a0a0a] border border-white/10">
                    <div className="flex items-center gap-3">
                        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "rounded-none" } }} />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold font-mono tracking-tight uppercase">{user?.name || "User"}</span>
                            <span className="text-[10px] text-[#D4F23F] font-mono uppercase">Pro Plan</span>
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
