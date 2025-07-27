import { create } from 'zustand';

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  files: [],
  currentFile: null,
  
  createProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: Date.now() }]
  })),
  
  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter(project => project.id !== projectId),
    currentProject: state.currentProject?.id === projectId ? null : state.currentProject
  })),
  
  setCurrentProject: (project) => set({
    currentProject: project
  }),
  
  addFile: (file) => set((state) => ({
    files: [...state.files, { ...file, id: Date.now() }]
  })),
  
  setCurrentFile: (file) => set({
    currentFile: file
  }),
  
  updateFileContent: (fileId, content) => set((state) => ({
    files: state.files.map(file => 
      file.id === fileId ? { ...file, content } : file
    ),
    currentFile: state.currentFile?.id === fileId 
      ? { ...state.currentFile, content } 
      : state.currentFile
  })),
  
  deleteFile: (fileId) => set((state) => ({
    files: state.files.filter(file => file.id !== fileId),
    currentFile: state.currentFile?.id === fileId ? null : state.currentFile
  })),
}));