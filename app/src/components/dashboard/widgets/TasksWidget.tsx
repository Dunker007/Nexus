import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

export function TasksWidget() {
    const [tasks, setTasks] = useState([
        { id: '1', title: 'Finish News Hub UI polish', status: 'done', priority: 'high' },
        { id: '2', title: 'Set up YouTube channel', status: 'in-progress', priority: 'high' },
        { id: '3', title: 'Create first Suno song', status: 'todo', priority: 'medium' },
        { id: '4', title: 'Connect Neural Frames API', status: 'todo', priority: 'low' },
    ]);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        const savedTasks = localStorage.getItem('dashboard-tasks');
        if (savedTasks) {
            try { setTasks(JSON.parse(savedTasks)); } catch { }
        }
    }, []);

    const toggleTaskStatus = (id: string) => {
        const updated = tasks.map(t => {
            if (t.id === id) {
                const nextStatus = t.status === 'todo' ? 'in-progress' : t.status === 'in-progress' ? 'done' : 'todo';
                return { ...t, status: nextStatus };
            }
            return t;
        });
        setTasks(updated);
        localStorage.setItem('dashboard-tasks', JSON.stringify(updated));
    };

    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        const updated = [...tasks, { id: Date.now().toString(), title: newTaskTitle, status: 'todo', priority: 'medium' }];
        setTasks(updated);
        setNewTaskTitle('');
        localStorage.setItem('dashboard-tasks', JSON.stringify(updated));
    };

    const deleteTask = (id: string) => {
        const updated = tasks.filter(t => t.id !== id);
        setTasks(updated);
        localStorage.setItem('dashboard-tasks', JSON.stringify(updated));
    };

    const getTaskStatusStyle = (status: string) => {
        switch (status) {
            case 'done': return 'bg-green-500/20 text-green-400';
            case 'in-progress': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 space-y-2 overflow-auto custom-scrollbar mb-2">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#12121a] border border-white/5 group transition-colors hover:border-white/10">
                        <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getTaskStatusStyle(task.status)} transition-colors whitespace-nowrap`}
                        >
                            {task.status === 'done' ? 'DONE' : task.status === 'in-progress' ? 'WIP' : 'TODO'}
                        </button>
                        <span className={`text-sm flex-1 truncate ${task.status === 'done' ? 'line-through text-gray-600' : 'text-white/80'}`}>
                            {task.title}
                        </span>
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 shrink-0">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add task..."
                    className="flex-1 bg-[#12121a] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-gray-600"
                />
                <button onClick={addTask} disabled={!newTaskTitle.trim()} className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors disabled:opacity-50">
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}
