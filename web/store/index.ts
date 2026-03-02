import { create } from "zustand";
import type { User, Goal, Habit, Squad, ChatMessage } from "@/types";

interface GropalStore {
  user: User | null;
  goals: Goal[];
  habits: Habit[];
  squad: Squad | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  activeModal: string | null;

  setUser: (user: User) => void;
  setGoals: (goals: Goal[]) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  setHabits: (habits: Habit[]) => void;
  completeHabit: (id: string) => void;
  setSquad: (squad: Squad) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  setLoading: (val: boolean) => void;
  setActiveModal: (modal: string | null) => void;
}

export const useGropalStore = create<GropalStore>((set) => ({
  user: null,
  goals: [],
  habits: [],
  squad: null,
  chatHistory: [],
  isLoading: false,
  activeModal: null,

  setUser: (user) => set({ user }),
  setGoals: (goals) => set({ goals }),
  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  setHabits: (habits) => set({ habits }),
  completeHabit: (id) =>
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, streak: h.streak + 1, completed_today: true } : h
      ),
    })),
  setSquad: (squad) => set({ squad }),
  addChatMessage: (msg) =>
    set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  clearChat: () => set({ chatHistory: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setActiveModal: (activeModal) => set({ activeModal }),
}));
