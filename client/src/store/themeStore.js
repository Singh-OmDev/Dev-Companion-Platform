import { create } from 'zustand';

const useThemeStore = create((set) => ({
    theme: localStorage.getItem('theme') || 'cyber', // 'cyber' or 'light'

    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'cyber' ? 'light' : 'cyber';
        localStorage.setItem('theme', newTheme);
        document.documentElement.className = newTheme; // Apply to html tag
        return { theme: newTheme };
    }),

    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        document.documentElement.className = theme;
        set({ theme });
    }
}));

export default useThemeStore;
