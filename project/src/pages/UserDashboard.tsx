import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, MapPin } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PowerSystem {
  transformer: string;
  phase: string;
  meterReading: string;
  rectifier: string;
  loadCurrent: string;
  router: string;
}

interface BatteryDetails {
  type: string;
  capacity: string;
}

interface SiteDetails {
  id: string;
  siteName: string;
  localArea: string;
  district: string;
  latitude: string;
  longitude: string;
  transmissionMode: string;
  powerSystem: PowerSystem;
  battery: BatteryDetails;
  imageUrl?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
}

export default function UserDashboard() {
  const { user, signOut } = useAuth();
  const [siteDetails, setSiteDetails] = useState<SiteDetails[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'sites'));
        const sites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SiteDetails[];
        setSiteDetails(sites);
      } catch (error) {
        setError('Failed to fetch site details');
        console.error('Failed to fetch site details:', error);
      }
    };

    const fetchTasks = async () => {
      if (user) {
        try {
          const response = await fetch('/tasks', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          const data = await response.json();
          if (data.success) {
            setTasks(data.data);
          } else {
            setError(data.error);
          }
        } catch (error) {
          setError('Failed to fetch tasks');
          console.error('Failed to fetch tasks:', error);
        }
      }
    };

    fetchSites();
    fetchTasks();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      setError('Failed to sign out');
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {siteDetails.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {siteDetails.map(site => (
              <div key={site.id} className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-blue-600" />
                  <h2 className="text-xl font-semibold">{site.siteName}</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Location</label>
                    <p className="mt-1 text-gray-900">{`${site.localArea}, ${site.district}`}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Coordinates</label>
                    <p className="mt-1 text-gray-900">{`${site.latitude}, ${site.longitude}`}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Transmission Mode</label>
                    <p className="mt-1 text-gray-900">{site.transmissionMode}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading site details...</p>
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-2xl font-bold">Your Tasks</h2>
          {tasks.length > 0 ? (
            <ul className="mt-4">
              {tasks.map(task => (
                <li key={task.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-gray-600">Status: {task.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tasks found.</p>
          )}
        </section>
      </main>
    </div>
  );
}
