import { create } from 'zustand';
import type { Task } from '@/lib/types';

interface TaskStore {
  tasks: Task[];
  getTaskById: (id: string) => Task | undefined;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],

  getTaskById: (id) => {
    return get().tasks.find(task => task.id === id);
  },

  addTask: (task) => {
    set(state => ({
      tasks: [...state.tasks, task]
    }));
  },

  updateTask: (taskId, updates) => {
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  },

  deleteTask: (taskId) => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== taskId)
    }));
  }
}));