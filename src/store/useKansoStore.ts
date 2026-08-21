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
      scratchpad: boolean;
      metricsModal: boolean;
      spellCheck: boolean;
      }

interface KansoState {
      notes: Note[];
      activeNoteId: string | null;
      toolbox: ToolboxVisibility;
      addNote: (title: string, content: string) => void;
      updateNote: (id: string, content: string) => void;
      setActiveNote: (id: string | null) => void;
      toggleToolboxItem: (key: keyof ToolboxVisibility) => void;
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
                  scratchpad: true,
                  metricsModal: true,
                  spellCheck: true
            },
            addNote: (title, content) =>
                  set((state) => ({
                        notes: [{ id: Date.now().toString(), title, content,        updatedAt: Date.now() }, ...state.notes],
                  })),
            updateNote: (id, content) =>
                  set((state) => ({
                  notes: state.notes.map((note) => (note.id === id ? { ...note, content, updatedAt: Date.now() } : note)),
                  })),
            setActiveNote: (id) => set({ activeNoteId: id }),
            toggleToolboxItem: (key) =>
                  set((state) => ({
                  toolbox: { ...state.toolbox, [key]: !state.toolbox[key] },
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
                  }),
            }
            )
      );