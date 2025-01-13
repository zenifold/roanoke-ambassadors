import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/login';
import SignUp from './pages/signup';
import Landing from './pages/landing';
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import EventsList from './pages/dashboard/events/EventsList';
import CreateEvent from './pages/dashboard/events/CreateEvent';
import TasksList from './pages/dashboard/tasks/TasksList';
import CreateTask from './pages/dashboard/tasks/CreateTask';
import { EventDetails } from './pages/dashboard/events/EventDetails';
import Settings from './pages/dashboard/settings';
import Setup from './pages/admin/Setup';
import Debug from './pages/admin/Debug';
import { Reports } from './pages/dashboard/reports/Reports';
import { Notifications } from './pages/dashboard/Notifications';
import CalendarView from './pages/dashboard/events/Calendar';
import { useState, useEffect } from 'react';
import { getEventById, type Event } from '@/lib/firestore';

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin/setup" element={<Setup />} />
          <Route path="/admin/debug" element={<Debug />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Overview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/events"
            element={
              <ProtectedRoute>
                <EventsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/events/new"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/events/:id"
            element={
              <ProtectedRoute>
                <EventDetailsWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/calendar"
            element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tasks"
            element={
              <ProtectedRoute>
                <TasksList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tasks/new"
            element={
              <ProtectedRoute>
                <CreateTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function EventDetailsWrapper() {
  const [event, setEvent] = useState<Event | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        const eventData = await getEventById(id);
        if (eventData) {
          setEvent(eventData);
        }
      } catch (error) {
        console.error('Error loading event:', error);
      }
    };

    loadEvent();
  }, [id]);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return <EventDetails event={event} />;
}

export default App;
