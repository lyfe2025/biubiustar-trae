import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import {
  Home,
  Trending,
  Activities,
  Contact,
  About,
  Login,
  Register,
  Profile,
  NotFound
} from '@/pages';
import CreatePost from '@/pages/CreatePost';
import PostDetail from '@/pages/PostDetail';
import UserProfile from '@/pages/UserProfile';
import Settings from '@/pages/Settings';
import Search from '@/pages/Search';
import Notifications from '@/pages/Notifications';
import Admin from '@/pages/Admin';

export default function App() {
  const { i18n } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <AuthProvider>
        <Router>
          <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hot" element={<Trending />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/user/:username" element={<UserProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Layout>
        </Router>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}
