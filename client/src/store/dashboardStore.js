import { create } from 'zustand';

const useDashboardStore = create((set) => ({
    user: {
        name: 'Developer',
        role: 'Pro User',
        streak: 12,
        xp: 4500,
        level: 5,
    },
    goals: [
        { id: 1, title: 'Solve 2 DSA Mediums', completed: false, type: 'leetcode' },
        { id: 2, title: 'Commit to side-project', completed: true, type: 'github' }
    ],
    stats: {
        totalCommits: 843,
        leetcodeSolved: 142,
        projectsCompleted: 7,
        hoursCoded: 120
    },
    activity: [
        { date: '2026-01-20', count: 5 },
        { date: '2026-01-21', count: 8 },
        { date: '2026-01-22', count: 2 },
        { date: '2026-01-23', count: 12 },
        { date: '2026-01-24', count: 7 },
    ],

    toggleGoal: (id) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    })),

    fetchDashboardData: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('http://localhost:5000/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const userData = await res.json();
                set((state) => ({
                    user: { ...state.user, ...userData }
                }));
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    },

    updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
}));

export default useDashboardStore;
