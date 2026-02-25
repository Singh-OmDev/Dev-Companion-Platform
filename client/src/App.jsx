import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Layout from './components/Layout';
import AuthSync from './components/AuthSync';
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
                  <AuthSync>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/github" element={<GithubStats />} />
                        <Route path="/learning" element={<LearningTracker />} />
                        <Route path="/projects" element={<ProjectManager />} />
                        <Route path="/features" element={<FeaturePipeline />} />

                        {/* Phase 2 Routes */}
                        <Route path="/leetcode" element={<LeetCodeTracker />} />
                        <Route path="/goals" element={<DailyGoals />} />
                        <Route path="/pr-assistant" element={<PRAssistant />} />
                        <Route path="/cartographer" element={<Cartographer />} />
                        <Route path="/ai-mentor" element={<AIChat />} />
                        <Route path="/roadmap" element={<PersonalizedRoadmap />} />
                        <Route path="/interview" element={<MockInterview />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/insights" element={<DeveloperInsights />} />
                        <Route path="/standup" element={<StandupGenerator />} />
                      </Routes>
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
