import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Users, 
  MapPin, 
  Camera, 
  Music, 
  Utensils,
  Heart,
  Gift,
  Palette,
  Car,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';
import api from '../services/api';

interface Task {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  notes?: string;
}

interface Budget {
  category: string;
  allocated: number;
  spent: number;
  icon: React.ComponentType<any>;
  color: string;
}

const WeddingPlanning: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [weddingDate] = useState('2024-12-15');
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Book wedding venue',
      category: 'Venue',
      dueDate: '2024-03-01',
      completed: true,
      priority: 'high',
      assignedTo: 'Both'
    },
    {
      id: '2',
      title: 'Finalize guest list',
      category: 'Planning',
      dueDate: '2024-03-15',
      completed: false,
      priority: 'high',
      assignedTo: 'Both'
    },
    {
      id: '3',
      title: 'Book photographer',
      category: 'Photography',
      dueDate: '2024-04-01',
      completed: false,
      priority: 'medium',
      assignedTo: 'Priya'
    },
    {
      id: '4',
      title: 'Choose wedding outfits',
      category: 'Attire',
      dueDate: '2024-05-01',
      completed: false,
      priority: 'medium',
      assignedTo: 'Both'
    },
    {
      id: '5',
      title: 'Send invitations',
      category: 'Invitations',
      dueDate: '2024-06-01',
      completed: false,
      priority: 'high',
      assignedTo: 'Arjun'
    }
  ]);

  const [budget] = useState<Budget[]>([
    { category: 'Venue', allocated: 500000, spent: 450000, icon: MapPin, color: 'bg-blue-500' },
    { category: 'Catering', allocated: 300000, spent: 0, icon: Utensils, color: 'bg-green-500' },
    { category: 'Photography', allocated: 150000, spent: 0, icon: Camera, color: 'bg-purple-500' },
    { category: 'Decoration', allocated: 200000, spent: 25000, icon: Palette, color: 'bg-pink-500' },
    { category: 'Music', allocated: 100000, spent: 0, icon: Music, color: 'bg-yellow-500' },
    { category: 'Transportation', allocated: 75000, spent: 0, icon: Car, color: 'bg-indigo-500' },
    { category: 'Attire', allocated: 150000, spent: 0, icon: Heart, color: 'bg-red-500' },
    { category: 'Miscellaneous', allocated: 100000, spent: 15000, icon: Gift, color: 'bg-gray-500' }
  ]);

  const totalBudget = budget.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budget.reduce((sum, item) => sum + item.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  const daysUntilWedding = Math.ceil((new Date(weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  const [showAddTask, setShowAddTask] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: '',
    notes: ''
  });

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.category || !newTask.dueDate) return;
    setSubmitting(true);
    try {
      let savedTask = null;
      try {
        const payload = {
          ...newTask,
          completed: false
        };
        const res = await api.post('/tasks', payload);
        savedTask = res.data;
      } catch {
        // fallback: just use local state
        savedTask = { ...newTask, id: Date.now().toString(), completed: false };
      }
      setTasks([...tasks, { ...savedTask, id: savedTask._id || savedTask.id || Date.now().toString() }]);
      setShowAddTask(false);
      setNewTask({ title: '', category: '', dueDate: '', priority: 'medium', assignedTo: '', notes: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wedding Planning</h1>
          <p className="text-gray-600">Plan your perfect wedding together</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-saffron">{daysUntilWedding}</div>
          <div className="text-sm text-gray-600">days to go</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'budget', label: 'Budget' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'vendors', label: 'Vendors' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-saffron shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-saffron rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{daysUntilWedding}</div>
              <div className="text-sm text-gray-600">Days Until Wedding</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{completedTasks}/{totalTasks}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">150</div>
              <div className="text-sm text-gray-600">Expected Guests</div>
            </div>
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">₹{(remainingBudget / 100000).toFixed(1)}L</div>
              <div className="text-sm text-gray-600">Budget Remaining</div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <span className="text-sm font-medium">{Math.round((completedTasks / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-saffron h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                  ></div>
                </div>
                <div className="space-y-2">
                  {['Venue', 'Catering', 'Photography', 'Decoration'].map((category, index) => {
                    const categoryTasks = tasks.filter(task => task.category === category);
                    const completedCategoryTasks = categoryTasks.filter(task => task.completed);
                    const progress = categoryTasks.length > 0 ? (completedCategoryTasks.length / categoryTasks.length) * 100 : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{category}</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Budget</span>
                  <span className="text-sm font-medium">₹{(totalBudget / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Spent</span>
                  <span className="text-sm font-medium text-red-600">₹{(totalSpent / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="text-sm font-medium text-green-600">₹{(remainingBudget / 100000).toFixed(1)}L</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
            <div className="space-y-3">
              {tasks.filter(task => !task.completed).slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-5 h-5 border-2 border-gray-300 rounded hover:border-saffron transition-colors"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-gray-500">{task.assignedTo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-end mb-4">
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowAddTask(true)}>
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
          {showAddTask && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input type="text" className="input-field" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <input type="text" className="input-field" value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                    <input type="date" className="input-field" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select className="input-field" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                    <input type="text" className="input-field" value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea className="input-field" value={newTask.notes} onChange={e => setNewTask({ ...newTask, notes: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary flex-1" onClick={handleAddTask} disabled={submitting}>{submitting ? 'Adding...' : 'Add Task'}</button>
                    <button className="btn-outline flex-1" onClick={() => setShowAddTask(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task List</h3>
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 border-2 rounded transition-colors ${
                          task.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-saffron'
                        }`}
                      >
                        {task.completed && <CheckCircle className="w-4 h-4" />}
                      </button>
                      <div>
                        <h3 className={`font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>Category: {task.category}</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          <span>Assigned to: {task.assignedTo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">₹{(totalBudget / 100000).toFixed(1)}L</div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-2xl font-bold text-red-600">₹{(totalSpent / 100000).toFixed(1)}L</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-2xl font-bold text-green-600">₹{(remainingBudget / 100000).toFixed(1)}L</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budget.map((item, index) => {
              const Icon = item.icon;
              const percentage = item.allocated > 0 ? (item.spent / item.allocated) * 100 : 0;
              
              return (
                <div key={index} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{item.category}</h3>
                    </div>
                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}% used</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Allocated</span>
                      <span className="font-medium">₹{(item.allocated / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-medium text-red-600">₹{(item.spent / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-medium text-green-600">₹{((item.allocated - item.spent) / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Wedding Timeline</h2>
          
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-8">
              {[
                { month: 'March 2024', tasks: ['Book venue', 'Finalize guest list', 'Choose wedding theme'] },
                { month: 'April 2024', tasks: ['Book photographer', 'Select catering service', 'Order invitations'] },
                { month: 'May 2024', tasks: ['Choose wedding outfits', 'Book music/DJ', 'Plan decoration'] },
                { month: 'June 2024', tasks: ['Send invitations', 'Book transportation', 'Finalize menu'] },
                { month: 'July 2024', tasks: ['Final fittings', 'Confirm all vendors', 'Plan rehearsal'] },
                { month: 'December 2024', tasks: ['Wedding day!', 'Honeymoon', 'Thank you cards'] }
              ].map((period, index) => (
                <div key={index} className="relative flex items-start gap-6">
                  <div className="w-16 h-16 bg-saffron rounded-full flex items-center justify-center relative z-10">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1 card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{period.month}</h3>
                    <ul className="space-y-2">
                      {period.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Wedding Vendors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                category: 'Venue',
                vendor: 'Royal Palace Banquets',
                contact: '+91 98765 43210',
                status: 'Confirmed',
                amount: '₹4,50,000'
              },
              {
                category: 'Photography',
                vendor: 'Moments Photography',
                contact: '+91 87654 32109',
                status: 'Pending',
                amount: '₹1,50,000'
              },
              {
                category: 'Catering',
                vendor: 'Spice Garden',
                contact: '+91 76543 21098',
                status: 'Quoted',
                amount: '₹3,00,000'
              },
              {
                category: 'Decoration',
                vendor: 'Elegant Decorators',
                contact: '+91 65432 10987',
                status: 'Confirmed',
                amount: '₹2,00,000'
              }
            ].map((vendor, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{vendor.vendor}</h3>
                    <p className="text-gray-600">{vendor.category}</p>
                    <p className="text-sm text-gray-500">{vendor.contact}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vendor.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    vendor.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-saffron">{vendor.amount}</span>
                  <div className="flex gap-2">
                    <button className="btn-outline text-sm">Contact</button>
                    <button className="btn-primary text-sm">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeddingPlanning;