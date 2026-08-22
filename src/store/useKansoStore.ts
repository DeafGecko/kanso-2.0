import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Note {
      id: string;
      title: string;
      content: string;
      updatedAt: number;
}

interface ToolboxVisibility {
      theme: boolean;
      font: boolean;
      wordLimit: boolean;
      paragraphLimit: boolean;
      pageLimit: boolean;
      files: boolean;
      textTools: boolean;
      metricsModal: boolean;
      spellCheck: boolean;
      }

export interface KansoPreferences {
      isPreferencesOpen: boolean;
      currentTheme: 'light' | 'coffee' | 'dark';
      fontFamily: string;
      wordLimit: number;
      paragraphLimit: number;
      pageLimit: number;
      fontSize: number;
}

interface KansoState {
      notes: Note[];
      activeNoteId: string | null;
      toolbox: ToolboxVisibility;
      preferences: KansoPreferences;
      addNote: (title: string, content: string) => void;
      updateNote: (id: string, content: string) => void;
      setActiveNote: (id: string | null) => void;
      toggleToolboxItem: (key: keyof ToolboxVisibility) => void;
      setPreference: <Key extends keyof KansoPreferences>(key: Key, value: KansoPreferences[Key]) => void;
}

export const useKansoStore = create<KansoState>()(
      persist(
      (set) => ({
            notes: [{ id: '1', title: 'Welcome', content: 'Start writing...', updatedAt: Date.now() }],
            activeNoteId: '1',
            toolbox: {
                  theme: true,
                  font: true,
                  wordLimit: true,
                  paragraphLimit: true,
                  pageLimit: true,
                  files: true,
                  textTools: true,
                  metricsModal: true,
                  spellCheck: true
            },
            preferences: {
                  isPreferencesOpen: true,
                  currentTheme: 'dark',
                  fontFamily: 'Georgia, serif',
                  wordLimit: 500,
                  paragraphLimit: 10,
                  pageLimit: 1,
                  fontSize: 18,
            },
            addNote: (title, content) =>
                  set((state) => {
                        const id = Date.now().toString();
                        return {
                              notes: [{ id, title, content, updatedAt: Date.now() }, ...state.notes],
                              activeNoteId: id,
                        };
                  }),
            updateNote: (id, content) =>
                  set((state) => ({
                  notes: state.notes.map((note) => (note.id === id ? { ...note, content, updatedAt: Date.now() } : note)),
                  })),
            setActiveNote: (id) => set({ activeNoteId: id }),
            toggleToolboxItem: (key) =>
                  set((state) => ({
                  toolbox: { ...state.toolbox, [key]: !state.toolbox[key] },
                  })),
            setPreference: (key, value) =>
                  set((state) => ({
                  preferences: { ...state.preferences, [key]: value },
                  })),
            }),
            {
                  name: 'kanso-toolbox-storage-v2',
                  merge: (persisted: unknown, current) => ({
                        ...(current as KansoState),
                        ...(persisted as Partial<KansoState>),
                        toolbox: {
                              ...(current as KansoState).toolbox,
                              ...((persisted as Partial<KansoState>).toolbox ?? {}),
                        },
                        preferences: {
                              ...(current as KansoState).preferences,
                              ...((persisted as Partial<KansoState>).preferences ?? {}),
                        },
                  }),
            }
            )
      );