import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import CodeDashboardPage from './pages/CodeDashboardPage';
import CodeEditorPage from './pages/CodeEditorPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import InvitationPage from './pages/InvitationPage';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    name: 'Editor',
    path: '/editor/:documentId',
    element: <EditorPage />,
    visible: false,
  },
  {
    name: 'Code Dashboard',
    path: '/codes',
    element: <CodeDashboardPage />,
    visible: false,
  },
  {
    name: 'Code Editor',
    path: '/code/:codeDocumentId',
    element: <CodeEditorPage />,
    visible: false,
  },
  {
    name: 'Invitation',
    path: '/invite/:token',
    element: <InvitationPage />,
    visible: false,
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <AdminPage />,
    visible: false,
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <ProfilePage />,
    visible: false,
  },
  {
    name: 'Not Found',
    path: '/404',
    element: <NotFound />,
    visible: false,
  },
];

export default routes;
