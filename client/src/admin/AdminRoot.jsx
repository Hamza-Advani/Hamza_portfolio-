import { Outlet } from 'react-router';
import { AuthProvider } from '../context/AuthContext.jsx';

// Firebase Auth is only loaded on /admin routes, keeping it out of the public bundle.
export default function AdminRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
