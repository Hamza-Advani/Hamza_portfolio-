import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { MotionConfig } from 'framer-motion';
import { SiteProvider } from './context/SiteContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Layout, { RouteFallback } from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';

// Public pages (code-split)
const About = lazy(() => import('./pages/About.jsx'));
const Education = lazy(() => import('./pages/Education.jsx'));
const Skills = lazy(() => import('./pages/Skills.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'));
const Certificates = lazy(() => import('./pages/Certificates.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogDetail = lazy(() => import('./pages/BlogDetail.jsx'));
const Journey = lazy(() => import('./pages/Journey.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const CV = lazy(() => import('./pages/CV.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Admin (separate chunks, never loaded by regular visitors)
const AdminRoot = lazy(() => import('./admin/AdminRoot.jsx'));
const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'));
const Login = lazy(() => import('./admin/Login.jsx'));
const Dashboard = lazy(() => import('./admin/Dashboard.jsx'));
const ProfileEditor = lazy(() => import('./admin/SingletonEditors.jsx').then((m) => ({ default: m.ProfileEditor })));
const SettingsEditor = lazy(() => import('./admin/SingletonEditors.jsx').then((m) => ({ default: m.SettingsEditor })));
const VideoEditor = lazy(() => import('./admin/SingletonEditors.jsx').then((m) => ({ default: m.VideoEditor })));
const ProjectsAdmin = lazy(() => import('./admin/collections.jsx').then((m) => ({ default: m.ProjectsAdmin })));
const SkillsAdmin = lazy(() => import('./admin/collections.jsx').then((m) => ({ default: m.SkillsAdmin })));
const EducationAdmin = lazy(() => import('./admin/collections.jsx').then((m) => ({ default: m.EducationAdmin })));
const CertificatesAdmin = lazy(() => import('./admin/collections.jsx').then((m) => ({ default: m.CertificatesAdmin })));
const PostsList = lazy(() => import('./admin/Posts.jsx').then((m) => ({ default: m.PostsList })));
const PostEditor = lazy(() => import('./admin/Posts.jsx').then((m) => ({ default: m.PostEditor })));
const RoadmapEditor = lazy(() => import('./admin/RoadmapEditor.jsx'));
const Messages = lazy(() => import('./admin/Messages.jsx'));
const AccountSettings = lazy(() => import('./admin/AccountSettings.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <SiteProvider>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="education" element={<Education />} />
                    <Route path="skills" element={<Skills />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:slug" element={<ProjectDetail />} />
                    <Route path="certificates" element={<Certificates />} />
                    <Route path="blog" element={<Blog />} />
                    <Route path="blog/:slug" element={<BlogDetail />} />
                    <Route path="journey" element={<Journey />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="cv" element={<CV />} />
                  <Route element={<AdminRoot />}>
                  <Route path="admin/login" element={<Login />} />
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="profile" element={<ProfileEditor />} />
                    <Route path="projects" element={<ProjectsAdmin />} />
                    <Route path="posts" element={<PostsList />} />
                    <Route path="posts/:id" element={<PostEditor />} />
                    <Route path="skills" element={<SkillsAdmin />} />
                    <Route path="education" element={<EducationAdmin />} />
                    <Route path="certificates" element={<CertificatesAdmin />} />
                    <Route path="roadmap" element={<RoadmapEditor />} />
                    <Route path="video" element={<VideoEditor />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="settings" element={<SettingsEditor />} />
                    <Route path="account" element={<AccountSettings />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  </Route>
                </Routes>
              </Suspense>
          </SiteProvider>
        </MotionConfig>
      </ThemeProvider>
    </BrowserRouter>
  );
}
