import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createUserProfile, getUserProfile, type UserProfile } from '../../lib/firestore';

export default function Debug() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading profile:', error);
          setError('Failed to load user profile');
        } finally {
          setLoading(false);
        }
      }
    }

    loadProfile();
  }, [user]);

  const fixPermissions = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const profile = await createUserProfile(user.uid, user.email!, 'program_manager');
      setUserProfile(profile);
      setSuccess(true);
    } catch (error) {
      console.error('Error fixing permissions:', error);
      setError('Failed to fix permissions');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Not Logged In</h1>
          <p className="mt-2 text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">User Debug Info</h1>
            <p className="mt-2 text-gray-600">
              Current user: {user.email}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-4">
              <div className="text-sm text-green-700">
                Successfully updated permissions!
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-sm font-medium text-gray-900">Firebase User:</h2>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {JSON.stringify({ uid: user.uid, email: user.email }, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-sm font-medium text-gray-900">User Profile:</h2>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </div>

            <button
              onClick={fixPermissions}
              disabled={loading}
              className="w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50"
            >
              {loading ? 'Fixing Permissions...' : 'Fix Permissions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 