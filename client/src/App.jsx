import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Layout from './components/Layout';
import Dashboard from './modules/dashboard/Dashboard';
import GithubStats from './modules/github/GithubStats';
import LearningTracker from './modules/learning/LearningTracker';
import ProjectManager from './modules/projects/ProjectManager';
import LeetCodeTracker from './modules/leetcode/LeetCodeTracker';
import DailyGoals from './modules/goals/DailyGoals';
import ResumeBuilder from './modules/resume/ResumeBuilder';
import AIChat from './modules/ai/AIChat';
import PersonalizedRoadmap from './modules/ai/PersonalizedRoadmap';
import Profile from './modules/profile/Profile';
import DeveloperInsights from './modules/insights/DeveloperInsights';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="*"
            element={
              <>
                <SignedIn>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/github" element={<GithubStats />} />
                      <Route path="/learning" element={<LearningTracker />} />
                      <Route path="/projects" element={<ProjectManager />} />

                      {/* Phase 2 Routes */}
                      <Route path="/leetcode" element={<LeetCodeTracker />} />
                      <Route path="/goals" element={<DailyGoals />} />
                      <Route path="/resume" element={<ResumeBuilder />} />
                      <Route path="/ai-mentor" element={<AIChat />} />
                      <Route path="/roadmap" element={<PersonalizedRoadmap />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/insights" element={<DeveloperInsights />} />
                    </Routes>
                  </Layout>
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
