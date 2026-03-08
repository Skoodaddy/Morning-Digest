import React, { useState, useEffect } from 'react';
import { Todo } from '../types';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo, LogIn, RefreshCw } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('google_tasks_token');
    if (savedToken) {
      setAccessToken(savedToken);
    }
  }, []);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/tasks',
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      localStorage.setItem('google_tasks_token', tokenResponse.access_token);
    },
    onError: () => console.error('Login Failed'),
  });

  const fetchTasks = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.status === 401) {
        setAccessToken(null);
        localStorage.removeItem('google_tasks_token');
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (data.items) {
        setTodos(data.items.map((item: any) => ({
          id: item.id,
          text: item.title,
          completed: item.status === 'completed'
        })));
      } else {
        setTodos([]);
      }
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (accessToken) {
      fetchTasks();
    }
  }, [accessToken]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !accessToken) return;
    
    const title = newTodo.trim();
    setNewTodo('');
    
    // Optimistic update
    const tempId = Date.now().toString();
    setTodos([...todos, { id: tempId, text: title, completed: false }]);

    try {
      const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      const data = await response.json();
      setTodos(current => current.map(t => t.id === tempId ? { id: data.id, text: data.title, completed: false } : t));
    } catch (e) {
      console.error('Failed to add task', e);
      fetchTasks(); // Revert on failure
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    if (!accessToken) return;
    
    const newStatus = !currentStatus;
    setTodos(todos.map(t => t.id === id ? { ...t, completed: newStatus } : t));

    try {
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${id}`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus ? 'completed' : 'needsAction' })
      });
    } catch (e) {
      console.error('Failed to update task', e);
      fetchTasks(); // Revert on failure
    }
  };

  const deleteTodo = async (id: string) => {
    if (!accessToken) return;
    
    setTodos(todos.filter(t => t.id !== id));

    try {
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } catch (e) {
      console.error('Failed to delete task', e);
      fetchTasks(); // Revert on failure
    }
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 shadow-lg border border-white/5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ListTodo className="w-6 h-6 text-indigo-400 mr-3" />
          <h2 className="text-xl font-medium text-white">Google Tasks</h2>
        </div>
        {!accessToken ? (
          <button onClick={() => login()} className="flex items-center text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors">
            <LogIn className="w-4 h-4 mr-2" /> Connect
          </button>
        ) : (
          <button onClick={fetchTasks} disabled={loading} className="text-zinc-400 hover:text-white transition-colors">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {!accessToken ? (
        <div className="text-center py-6 text-zinc-500 text-sm">
          Connect your Google account to sync your tasks.
        </div>
      ) : (
        <>
          <form onSubmit={addTodo} className="flex mb-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-grow bg-zinc-800 border border-white/10 rounded-l-xl px-4 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!newTodo.trim()}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-r-xl transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {todos.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">No tasks yet. Add one above!</p>
            ) : (
              todos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    todo.completed ? 'bg-zinc-800/30 border-transparent' : 'bg-zinc-800/80 border-white/5'
                  }`}
                >
                  <button 
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className="flex items-center flex-grow text-left"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-500 mr-3 flex-shrink-0" />
                    )}
                    <span className={`text-sm transition-all ${todo.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                      {todo.text}
                    </span>
                  </button>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-zinc-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-zinc-700/50 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default TodoList;
