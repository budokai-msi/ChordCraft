import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // UI State
  theme: 'dark',
  sidebarCollapsed: false,
  bottomPanelHeight: 320,
  leftPanelWidth: 320,
  rightPanelWidth: 320,
  
  // Modal States
  isSettingsOpen: false,
  isExportModalOpen: false,
  isImportModalOpen: false,
  isHelpModalOpen: false,
  
  // Notification State
  notifications: [],
  
  // Loading States
  isAnalyzing: false,
  isGenerating: false,
  isSaving: false,
  
  // Error State
  error: null,
  
  // Actions
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setBottomPanelHeight: (height) => set({ bottomPanelHeight: Math.max(200, Math.min(600, height)) }),
  setLeftPanelWidth: (width) => set({ leftPanelWidth: Math.max(200, Math.min(600, width)) }),
  setRightPanelWidth: (width) => set({ rightPanelWidth: Math.max(200, Math.min(600, width)) }),
  
  // Modal Actions
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openExportModal: () => set({ isExportModalOpen: true }),
  closeExportModal: () => set({ isExportModalOpen: false }),
  openImportModal: () => set({ isImportModalOpen: true }),
  closeImportModal: () => set({ isImportModalOpen: false }),
  openHelpModal: () => set({ isHelpModalOpen: true }),
  closeHelpModal: () => set({ isHelpModalOpen: false }),
  
  // Notification Actions
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    }]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  // Loading Actions
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setSaving: (saving) => set({ isSaving: saving }),
  
  // Error Actions
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Utility Actions
  showSuccess: (message) => get().addNotification({
    type: 'success',
    message,
    duration: 3000
  }),
  
  showError: (message) => get().addNotification({
    type: 'error',
    message,
    duration: 5000
  }),
  
  showWarning: (message) => get().addNotification({
    type: 'warning',
    message,
    duration: 4000
  }),
  
  showInfo: (message) => get().addNotification({
    type: 'info',
    message,
    duration: 3000
  })
}));
