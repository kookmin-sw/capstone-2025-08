import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GetUserSettingsResponseDto } from '@/generated-api';

interface UserState {
  user: GetUserSettingsResponseDto | null;
  setUser: (user: GetUserSettingsResponseDto) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    },
  ),
);
