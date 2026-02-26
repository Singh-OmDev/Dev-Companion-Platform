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
    projects: [],
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
            // Optional: Fetch github activity if user has linked it
            let fetchedActivity = [];
            let fetchedStats = {};

            if (profile.socials?.github) {
                try {
                    // Try to sync/fetch latest stats from our backend
                    const statsRes = await api.post('/github/sync');
                    if (statsRes.data) {
                        fetchedStats = statsRes.data;
                    }

                    // Fetch real activity events for the graph
                    const activityRes = await api.get(`/github/activity/${profile.socials.github}`);
                    if (activityRes.data && Array.isArray(activityRes.data)) {
                        // Aggregate events by day for the graph
                        const activityMap = {};
                        const today = new Date();

                        // Initialize last 30 days
                        for (let i = 29; i >= 0; i--) {
                            const d = new Date(today);
                            d.setDate(today.getDate() - i);
                            activityMap[d.toISOString().split('T')[0]] = 0;
                        }

                        // Count events
                        activityRes.data.forEach(event => {
                            if (event.created_at) {
                                const dateStr = event.created_at.split('T')[0];
                                if (activityMap[dateStr] !== undefined) {
                                    if (event.type === 'PushEvent') {
                                        activityMap[dateStr] += (event.payload?.size || 1);
                                    } else {
                                        activityMap[dateStr] += 1;
                                    }
                                }
                            }
                        });

                        fetchedActivity = Object.keys(activityMap).sort().map(date => ({
                            date,
                            count: activityMap[date]
                        }));
                    }
                } catch (err) {
                    console.log("Failed to fetch github data for dashboard", err);
                }
            }

            set((state) => ({
                user: {
                    ...state.user,
                    ...profile,
                    name: profile.name || profile.username || 'Developer',
                    streak: fetchedStats.currentStreak || profile.stats?.currentStreak || 0
                },
                stats: {
                    totalCommits: fetchedStats.totalCommits || profile.stats?.totalCommits || 0,
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
                projects: fetchedProjects || [],
                activity: fetchedActivity.length > 0 ? fetchedActivity : state.activity // keep mock if failed
            }));

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    },

    updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
}));

export default useDashboardStore;
