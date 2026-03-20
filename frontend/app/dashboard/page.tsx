'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '../../lib/api';
interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
}
export default function Dashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!localStorage.getItem('accessToken')) { router.push('/login'); return; }
    if (u) setUser(JSON.parse(u));
  }, []);
  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '6' });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/tasks?${params}`);
      setTasks(data.tasks);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to fetch tasks');
    }
  }, [page, search, statusFilter]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken }).catch(() => {});
    localStorage.clear();
    router.push('/login');
  };
  const openAdd = () => { setEditTask(null); setForm({ title: '', description: '' }); setShowModal(true); };
  const openEdit = (task: Task) => { setEditTask(task); setForm({ title: task.title, description: task.description || '' }); setShowModal(true); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editTask) {
        await api.patch(`/tasks/${editTask.id}`, form);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', form);
        toast.success('Task created!');
      }
      setShowModal(false);
      fetchTasks();
    } catch {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted!');
      fetchTasks();
    } catch {
      toast.error('Delete failed');
    }
  };
  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/tasks/${id}/toggle`);
      fetchTasks();
    } catch {
      toast.error('Toggle failed');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">📋 Task Manager</h1>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition">
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text" placeholder="🔍 Search tasks..."
            className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={openAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
            + Add Task
          </button>
        </div>
        <p className="text-gray-500 mb-4 text-sm">Showing {tasks.length} of {total} tasks</p>
        {tasks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg">No tasks found. Add one!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div key={task.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${task.status === 'completed' ? 'border-green-400' : 'border-indigo-400'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold text-gray-800 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {task.status}
                  </span>
                </div>
                {task.description && <p className="text-gray-500 text-sm mb-3">{task.description}</p>}
                <p className="text-xs text-gray-400 mb-3">{new Date(task.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleToggle(task.id)} className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 py-1.5 rounded-lg transition">
                    {task.status === 'completed' ? '↩ Undo' : '✓ Done'}
                  </button>
                  <button onClick={() => openEdit(task)} className="flex-1 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-1.5 rounded-lg transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-full font-semibold ${p === page ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
           <input
  type="text" placeholder="Task title" required
  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
/>
<textarea
  placeholder="Description (optional)" rows={3}
  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
/>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border py-2.5 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                  {loading ? 'Saving...' : editTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}