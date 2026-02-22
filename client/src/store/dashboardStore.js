import { create } from 'zustand';
import api from '../services/api';

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
            // Fetch profile data (contains stats), today's goals, and active projects
            const [profileRes, goalsRes, projectsRes] = await Promise.all([
                api.get('/profile'),
                api.get('/goals'),
                api.get('/projects')
            ]);

            const profile = profileRes.data;
            const fetchedGoals = goalsRes.data;
            const fetchedProjects = projectsRes.data;

            // Optional: Fetch github activity if user has linked it
            let fetchedActivity = [];
            if (profile.socials?.github) {
                try {
                    const activityRes = await api.get(`/github/stats/${profile.socials.github}`);
                    if (activityRes.data?.contributions) {
                        // mapping to { date, count } matching frontend mock schema approx
                        fetchedActivity = activityRes.data.contributions.map(c => ({
                            date: c.day,
                            count: c.commits || 0
                        }));
                    }
                } catch (err) {
                    console.log("Failed to fetch github activity for dashboard graph", err);
                }
            }

            set((state) => ({
                user: {
                    ...state.user,
                    name: profile.name || profile.username || 'Developer',
                    streak: profile.stats?.currentStreak || 0
                },
                stats: {
                    totalCommits: profile.stats?.totalCommits || 0,
                    leetcodeSolved: profile.stats?.leetcodeSolved?.total || 0,
                    projectsCompleted: fetchedProjects.length || 0,
                    hoursCoded: 0 // Mocked for now
                },
                goals: fetchedGoals.map(g => ({
                    id: g._id,
                    title: g.title,
                    completed: g.isCompleted,
                    type: g.type
                })),
                activity: fetchedActivity.length > 0 ? fetchedActivity : state.activity // keep mock if failed
            }));

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    },

    updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
}));

export default useDashboardStore;
