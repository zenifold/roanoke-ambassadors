import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEventsByUser, getTasksByUser, type Event, type Task } from '../../lib/firestore';

export default function Overview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const [userEvents, userTasks] = await Promise.all([
          getEventsByUser(user.uid),
          getTasksByUser(user.uid)
        ]);

        setEvents(userEvents);
        setTasks(userTasks);
      } catch (error) {
        console.error('Error loading overview data:', error);
        setError('Failed to load overview data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Events Section */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
            <Link
              to="/dashboard/events"
              className="text-sm font-medium text-black hover:text-gray-700"
            >
              View all →
            </Link>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-gray-500">No events yet</p>
          ) : (
            <ul className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <li key={event.id}>
                  <Link
                    to={`/dashboard/events/${event.id}`}
                    className="block hover:bg-gray-50 p-2 -mx-2 rounded-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${event.status === 'draft' && 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20'}
                          ${event.status === 'pending_review' && 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10'}
                          ${event.status === 'approved' && 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'}
                          ${event.status === 'rejected' && 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10'}
                        `}
                      >
                        {event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tasks Section */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <Link
              to="/dashboard/tasks"
              className="text-sm font-medium text-black hover:text-gray-700"
            >
              View all →
            </Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks yet</p>
          ) : (
            <ul className="space-y-4">
              {tasks.slice(0, 3).map((task) => (
                <li key={task.id}>
                  <Link
                    to={`/dashboard/tasks/${task.id}`}
                    className="block hover:bg-gray-50 p-2 -mx-2 rounded-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${task.status === 'todo' && 'bg-gray-100 text-gray-700'}
                          ${task.status === 'in_progress' && 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10'}
                          ${task.status === 'completed' && 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'}
                        `}
                      >
                        {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 