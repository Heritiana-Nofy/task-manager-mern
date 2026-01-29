import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'à faire' | 'en cours' | 'terminé';
  user: { name: string };
  assignedTo?: { _id: string, name: string };
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'à faire',
    assignedTo: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', status: 'à faire', assignedTo: '' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
    if (window.confirm('Supprimer cette tâche ?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      assignedTo: task.assignedTo?._id || ''
    });
    setShowModal(true);
  };

  const filteredTasks = filter === 'tous' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'à faire': return <span className="badge badge-todo">À faire</span>;
      case 'en cours': return <span className="badge badge-progress">En cours</span>;
      case 'terminé': return <span className="badge badge-done">Terminé</span>;
      default: return null;
    }
  };

  if (loading) return <div className="container">Chargement...</div>;

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h1>Tableau de bord</h1>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => {
          setEditingTask(null);
          setFormData({ title: '', description: '', status: 'à faire', assignedTo: '' });
          setShowModal(true);
        }}>
          <Plus size={18} /> Nouvelle Tâche
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <button className={`btn ${filter === 'tous' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('tous')}>Tous</button>
        <button className={`btn ${filter === 'à faire' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('à faire')}>À faire</button>
        <button className={`btn ${filter === 'en cours' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('en cours')}>En cours</button>
        <button className={`btn ${filter === 'terminé' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('terminé')}>Terminé</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredTasks.map(task => (
          <div key={task._id} className="card flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3>{task.title}</h3>
                {getStatusBadge(task.status)}
              </div>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{task.description}</p>
              <div className="mt-4" style={{ fontSize: '0.8rem' }}>
                <div><strong>Créé par:</strong> {task.user.name}</div>
                {task.assignedTo && <div><strong>Assigné à:</strong> {task.assignedTo.name}</div>}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => openEdit(task)}><Edit2 size={16} /></button>
              <button className="btn btn-danger" onClick={() => deleteTask(task._id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h2>{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <div>
                <label>Titre</label>
                <input className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div>
                <label>Description</label>
                <textarea className="input-field" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div>
                <label>Statut</label>
                <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option value="à faire">À faire</option>
                  <option value="en cours">En cours</option>
                  <option value="terminé">Terminé</option>
                </select>
              </div>
              {user?.role === 'admin' && (
                <div>
                  <label>Assigner à</label>
                  <select className="input-field" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                    <option value="">Non assigné</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
