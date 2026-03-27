import { create } from 'zustand';

export interface Profile {
  id: number;
  auth_id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  school: string | null;
  school_year: string | null;
  email: string | null;
  phone_number: string | null;
  persona: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthStore {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: any | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    try {
      const res = await fetch('/api/auth/profile');
      const data = await res.json();

      if (!data.user) {
        set({ user: null, profile: null, isLoading: false });
        return;
      }

      set({ user: data.user, profile: data.profile, isLoading: false });
    } catch {
      set({ user: null, profile: null, isLoading: false });
    }
  },

  signOut: async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    localStorage.clear();
    set({ user: null, profile: null });
    window.location.href = '/es/login';
  },

  reset: () => set({ user: null, profile: null, isLoading: true }),
}));
