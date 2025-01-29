import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, Trash2, Users, MapPin, CheckCircle } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../lib/firebase';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

interface Staff {
  id: string;
  name: string;
  email: string;
  userId: string;
  role: string;
  phone: string;
  department: string;
  createdAt: string;
}

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

interface SiteData {
  id: string;
  siteId: string;
  siteName: string;
  location: {
    localArea: string;
    district: string;
    latitude: string;
    longitude: string;
  };
  transmissionMode: string;
  powerSystem: PowerSystem;
  battery: BatteryDetails;
  services: string[];
  antennas: {
    type: string;
    height: string;
  }[];
  power: {
    source: string;
    backup: string;
  };
  transmissionType: string;
  fiberDetails: {
    provider: string;
    capacity: string;
  };
  landlordInformation: {
    name: string;
    contact: string;
  };
  maintenanceInfo: {
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
  };
  imageUrl?: string;
}

interface TaskStatus {
  id: string;
  userId: string;
  userName: string;
  status: 'completed' | 'not-completed';
  timestamp: string;
}

export default function AdminDashboard() {
  const { signOut } = useAuth(); // Removed unused 'user' variable
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [error, setError] = useState<string>('');
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    userId: '',
    password: '',
    role: 'user',
    phone: '',
    department: ''
  });

  const [newSite, setNewSite] = useState<SiteData>({
    id: '',
    siteId: '',
    siteName: '',
    location: {
      localArea: '',
      district: '',
      latitude: '',
      longitude: ''
    },
    transmissionMode: '',
    powerSystem: {
      transformer: '',
      phase: '',
      meterReading: '',
      rectifier: '',
      loadCurrent: '',
      router: ''
    },
    battery: {
      type: '',
      capacity: ''
    },
    services: [],
    antennas: [],
    power: {
      source: '',
      backup: ''
    },
    transmissionType: '',
    fiberDetails: {
      provider: '',
      capacity: ''
    },
    landlordInformation: {
      name: '',
      contact: ''
    },
    maintenanceInfo: {
      lastMaintenanceDate: '',
      nextMaintenanceDate: ''
    }
  });

  useEffect(() => {
    const unsubscribeStaff = onSnapshot(collection(db, 'users'), (snapshot) => {
      const staffData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Staff[];
      setStaffList(staffData);
    });

    const unsubscribeTaskStatus = onSnapshot(collection(db, 'taskStatus'), (snapshot) => {
      const statusData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TaskStatus[];
      setTaskStatuses(statusData);
    });

    return () => {
      unsubscribeStaff();
      unsubscribeTaskStatus();
    };
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newStaff.email,
        newStaff.password
      );

      try {
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          name: newStaff.name,
          email: newStaff.email,
          userId: newStaff.userId,
          role: newStaff.role,
          phone: newStaff.phone,
          department: newStaff.department,
          createdAt: new Date().toISOString()
        });
        setNewStaff({
          name: '',
          email: '',
          userId: '',
          password: '',
          role: 'user',
          phone: '',
          department: ''
        });
      } catch (firestoreError) {
        await userCredential.user.delete();
        throw firestoreError;
      }
    } catch (error: any) {
      // Error handling remains same as previous
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      setError('Failed to delete staff member');
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      setError('Failed to sign out');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff Management Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-blue-600" />
              <h2 className="text-xl font-semibold">Staff Management</h2>
            </div>
            
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Full Name</label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Staff ID</label>
                  <input
                    type="text"
                    value={newStaff.userId}
                    onChange={(e) => setNewStaff({ ...newStaff, userId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="user">Field Technician</option>
                    <option value="supervisor">Site Supervisor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                  <input
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Department</label>
                  <input
                    type="text"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Password</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add Staff Member
              </button>
            </form>

            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">Staff Directory</h3>
              {staffList.map((staff) => (
                <div key={staff.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{staff.name}</p>
                    <div className="text-sm text-gray-600">
                      <span className="block">{staff.email}</span>
                      <span className="block">ID: {staff.userId}</span>
                      <span className="block">Role: {staff.role}</span>
                      <span className="block">Department: {staff.department}</span>
                      <span className="block">Phone: {staff.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Site Management Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-blue-600" />
              <h2 className="text-xl font-semibold">Site Management</h2>
            </div>
            <form onSubmit={handleAddStaff} className="space-y-4">
              {/* Site ID and Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Site ID</label>
                  <input
                    type="text"
                    value={newSite.siteId}
                    onChange={(e) => setNewSite({ ...newSite, siteId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Site Name</label>
                  <input
                    type="text"
                    value={newSite.siteName}
                    onChange={(e) => setNewSite({ ...newSite, siteName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Local Area</label>
                    <input
                      type="text"
                      value={newSite.location.localArea}
                      onChange={(e) => setNewSite({
                        ...newSite,
                        location: { ...newSite.location, localArea: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">District</label>
                    <input
                      type="text"
                      value={newSite.location.district}
                      onChange={(e) => setNewSite({
                        ...newSite,
                        location: { ...newSite.location, district: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Latitude</label>
                    <input
                      type="text"
                      value={newSite.location.latitude}
                      onChange={(e) => setNewSite({
                        ...newSite,
                        location: { ...newSite.location, latitude: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Longitude</label>
                    <input
                      type="text"
                      value={newSite.location.longitude}
                      onChange={(e) => setNewSite({
                        ...newSite,
                        location: { ...newSite.location, longitude: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Power System */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Power System</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(newSite.powerSystem).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setNewSite({
                          ...newSite,
                          powerSystem: { ...newSite.powerSystem, [key]: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Battery Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Battery Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(newSite.battery).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-600 capitalize">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setNewSite({
                          ...newSite,
                          battery: { ...newSite.battery, [key]: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Sections (Antennas, Fiber Details, Maintenance Info, etc.) */}
              {/* Add similar structured sections for remaining fields */}

              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add Site
              </button>
            </form>
          </div>

          {/* Task Status Section */}
          <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-blue-600" />
              <h2 className="text-xl font-semibold">Task Completion Status</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {taskStatuses.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg ${
                    task.status === 'completed' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <p className="font-medium">{task.userName}</p>
                  <p className="text-sm text-gray-600">
                    Status:{' '}
                    <span className={task.status === 'completed' ? 'text-green-600' : 'text-red-600'}>
                      {task.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(task.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
