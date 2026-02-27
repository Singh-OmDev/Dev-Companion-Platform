import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import AuthSync from './components/AuthSync';
import CommandPalette from './components/CommandPalette';
import PageWrapper from './components/PageWrapper';
import Dashboard from './modules/dashboard/Dashboard';
import GithubStats from './modules/github/GithubStats';
import LearningTracker from './modules/learning/LearningTracker';
import ProjectManager from './modules/projects/ProjectManager';
import LeetCodeTracker from './modules/leetcode/LeetCodeTracker';
import DailyGoals from './modules/goals/DailyGoals';
import PRAssistant from './modules/pr/PRAssistant';
import Cartographer from './modules/architecture/Cartographer';
import AIChat from './modules/ai/AIChat';
import PersonalizedRoadmap from './modules/ai/PersonalizedRoadmap';
import Profile from './modules/profile/Profile';
import FeaturePipeline from './modules/features/FeaturePipeline';
import DeveloperInsights from './modules/insights/DeveloperInsights';
import MockInterview from './modules/interview/MockInterview';
import StandupGenerator from './modules/standup/StandupGenerator';
import LandingPage from './pages/LandingPage';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const AnimatedMainRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/github" element={<PageWrapper><GithubStats /></PageWrapper>} />
        <Route path="/learning" element={<PageWrapper><LearningTracker /></PageWrapper>} />
        <Route path="/projects" element={<PageWrapper><ProjectManager /></PageWrapper>} />
        <Route path="/features" element={<PageWrapper><FeaturePipeline /></PageWrapper>} />

        {/* Phase 2 Routes */}
        <Route path="/leetcode" element={<PageWrapper><LeetCodeTracker /></PageWrapper>} />
        <Route path="/goals" element={<PageWrapper><DailyGoals /></PageWrapper>} />
        <Route path="/pr-assistant" element={<PageWrapper><PRAssistant /></PageWrapper>} />
        <Route path="/cartographer" element={<PageWrapper><Cartographer /></PageWrapper>} />
        <Route path="/ai-mentor" element={<PageWrapper><AIChat /></PageWrapper>} />
        <Route path="/roadmap" element={<PageWrapper><PersonalizedRoadmap /></PageWrapper>} />
        <Route path="/interview" element={<PageWrapper><MockInterview /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/insights" element={<PageWrapper><DeveloperInsights /></PageWrapper>} />
        <Route path="/standup" element={<PageWrapper><StandupGenerator /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <CommandPalette />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
                <SignedOut>
                  <LandingPage />
                </SignedOut>
              </>
            }
          />
          <Route
            path="*"
            element={
              <>
                <SignedIn>
                  <AuthSync>
                    <Layout>
                      <AnimatedMainRoutes />
                    </Layout>
                  </AuthSync>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </Router>
    </ClerkProvider>
  );
}

export default App;
