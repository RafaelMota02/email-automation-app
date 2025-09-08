import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import AuthProvider from './context/AuthProvider';
import SocketContext from './context/SocketContext';
import useAuth from './context/useAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Databases from './pages/Databases';
import EditDatabase from './pages/EditDatabase';
import CampaignDetails from './pages/CampaignDetails';
import Settings from './pages/Settings';
import RequireAuth from './components/RequireAuth';
import { WS_BASE_URL } from './config'; // Import the WebSocket URL

// Create socket connection
const socket = io(WS_BASE_URL, {
  autoConnect: false,
  path: "/socket.io",
  transports: ["websocket", "polling"]
});

export default function App() {
  return (
    <Router>
      <SocketContext.Provider value={socket}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginWrapper />} />
              <Route path="/signup" element={<SignupWrapper />} />
              <Route path="/dashboard" element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } />
              <Route path="/databases" element={
                <RequireAuth>
                  <Databases />
                </RequireAuth>
              } />
              <Route path="/databases/:id" element={
                <RequireAuth>
                  <EditDatabase />
                </RequireAuth>
              } />
              <Route path="/campaigns/:id" element={
                <RequireAuth>
                  <CampaignDetails />
                </RequireAuth>
              } />
              <Route path="/settings" element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              } />
            </Routes>
          </main>
        </AuthProvider>
      </SocketContext.Provider>
    </Router>
  );
}

function LoginWrapper() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Login />;
}

function SignupWrapper() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Signup />;
}
