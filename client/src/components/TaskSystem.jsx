// client/src/components/TaskSystem.jsx
import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useTonWallet } from '../services/tonWallet';

export const TaskSystem = () => {
    const [tasks, setTasks] = useState([]);
    const { supabase } = useSupabase();
    const { wallet } = useTonWallet();

    useEffect(() => {
        if (wallet) {
            loadTasks();
        }
    }, [wallet]);

    const loadTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                user_tasks!inner(
                    completed,
                    completed_at
                )
            `)
            .eq('user_tasks.user_id', wallet.address);

        if (data) {
            setTasks(data);
        }
    };

    const completeTask = async (taskId) => {
        const { data, error } = await supabase
            .from('user_tasks')
            .update({
                completed: true,
                completed_at: new Date().toISOString()
            })
            .eq('task_id', taskId)
            .eq('user_id', wallet.address);

        if (!error) {
            loadTasks();
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Daily Tasks</h2>
            <div className="grid gap-4">
                {tasks.map((task) => (
                    <div key={task.id} 
                        className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-white">
                                {task.description}
                            </h3>
                            <p className="text-green-400">
                                Reward: {task.reward_amount} $GNOME
                            </p>
                        </div>
                        <button
                            onClick={() => completeTask(task.id)}
                            disabled={task.user_tasks[0]?.completed}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors
                                ${task.user_tasks[0]?.completed 
                                    ? 'bg-gray-600 text-gray-400' 
                                    : 'bg-green-500 hover:bg-green-600 text-white'}`}
                        >
                            {task.user_tasks[0]?.completed ? 'Completed' : 'Complete'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};