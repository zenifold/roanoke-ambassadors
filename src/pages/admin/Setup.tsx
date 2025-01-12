import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { setUserRole, createUserProfile } from '../../lib/firestore';

export default function Setup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const setupAdmin = async () => {
    if (!user || user.email !== 'maxkmurphy@gmail.com') {
      setError('Unauthorized access');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // First ensure the user profile exists
      await createUserProfile(user.uid, user.email, 'program_manager');
      
      // Then set the role to program manager
      await setUserRole(user.uid, 'program_manager');
      
      setSuccess(true);
    } catch (error) {
      console.error('Error setting up admin:', error);
      setError('Failed to set up admin user');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.email !== 'maxkmurphy@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Unauthorized Access</h1>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Setup</h1>
          <p className="mt-2 text-gray-600">
            Set up program manager privileges for {user.email}
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
              Successfully set up program manager privileges!
            </div>
          </div>
        )}

        <button
          onClick={setupAdmin}
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Set Up Admin Access'}
        </button>
      </div>
    </div>
  );
} 