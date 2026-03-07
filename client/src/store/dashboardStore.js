import { create } from 'zustand';
import api from '../services/api';

const useDashboardStore = create((set) => ({
    user: {
        name: 'Developer',
        role: 'Pro User',
        streak: 0,
        xp: 0,
        level: 1,
    },
    goals: [],
    stats: {
        totalCommits: 0,
        leetcodeSolved: 0,
        projectsCompleted: 0,
        hoursCoded: 0
    },
    projects: [],
    activity: [],
    languages: [],
    leetcodeRecommendations: [],
    dailyMission: null,
    isGeneratingMission: false,
    isLoading: true, // Start in loading state
    error: null,

    toggleGoal: (id) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    })),

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
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
            let fetchedLanguages = [];
            let fetchedGithubRepos = [];

            if (profile.socials?.github) {
                try {
                    // Try to sync/fetch latest stats from our backend
                    const statsRes = await api.post('/github/sync');
                    if (statsRes.data) {
                        fetchedStats = { ...fetchedStats, ...statsRes.data };
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

                    // Fetch full github stats to get active repos and top languages
                    try {
                        const fullStatsRes = await api.get(`/github/stats/${profile.socials.github}`);
                        if (fullStatsRes.data) {
                            fetchedLanguages = fullStatsRes.data.languages || [];
                            fetchedGithubRepos = fullStatsRes.data.repos || [];
                        }
                    } catch (statErr) {
                        console.log("Failed to fetch full github stats", statErr);
                    }
                } catch (err) {
                    console.log("Failed to fetch github data for dashboard", err);
                }
            }

            if (profile.socials?.leetcode) {
                try {
                    const leetcodeRes = await api.post('/leetcode/sync');
                    if (leetcodeRes.data) {
                        fetchedStats = {
                            ...fetchedStats,
                            leetcodeSolved: leetcodeRes.data
                        };
                    }
                } catch (err) {
                    console.log("Failed to sync leetcode data", err);
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
                    leetcodeSolved: fetchedStats.leetcodeSolved?.total || profile.stats?.leetcodeSolved?.total || 0,
                    projectsCompleted: fetchedProjects.length || 0,
                    hoursCoded: 0 // Mocked for now
                },
                goals: fetchedGoals.map(g => ({
                    id: g._id,
                    title: g.title,
                    completed: g.isCompleted,
                    type: g.type
                })),
                projects: fetchedProjects.length > 0 ? fetchedProjects : (fetchedGithubRepos.slice(0, 3) || []),
                languages: fetchedLanguages || [],
                activity: fetchedActivity.length > 0 ? fetchedActivity : [], // Use empty array if no real activity
                isLoading: false
            }));

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            set({ isLoading: false, error: error.message });
        }
    },

    fetchLeetCodeRecommendations: async (username) => {
        try {
            const response = await api.get(`/leetcode/${username}/recommendations`);
            set({ leetcodeRecommendations: response.data || [] });
        } catch (error) {
            console.error('Failed to fetch LeetCode recommendations:', error);
            set({ leetcodeRecommendations: [] });
        }
    },

    generateDailyMission: async () => {
        set({ isGeneratingMission: true });
        try {
            const response = await api.get('/ai/suggestions');
            // Extract the first suggestion text
            const text = Array.isArray(response.data) && response.data.length > 0
                ? response.data[0].suggestion
                : (response.data?.suggestion || 'Review your recent PRs and tackle a LeetCode problem.');
            set({ dailyMission: text, isGeneratingMission: false });
        } catch (error) {
            console.error('Failed to generate daily mission:', error);
            set({ dailyMission: 'Could not communicate with the AI router.', isGeneratingMission: false });
        }
    },

    updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
}));

export default useDashboardStore;
