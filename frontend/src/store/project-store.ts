import { create } from 'zustand';
import { initialProjects } from '@/lib/project-data';
import type { Project } from '@/lib/types';

interface ProjectStore {
  projects: Project[];
  updateProject: (updatedProject: Project) => void;
  getProject: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: initialProjects,
  updateProject: (updatedProject) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      ),
    }));
  },
  getProject: (id) => {
    return get().projects.find((project) => project.id === id);
  },
}));