import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';
import { auth } from '../lib/firebase';
import React from 'react';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Check if user is admin
      const user = auth.currentUser;
      React.startTransition(() => {
        if (user?.email === import.meta.env.VITE_ADMIN_EMAIL) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      });
    } catch (error) {
      setError('Failed to sign in with Google');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Telecom Dashboard Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
