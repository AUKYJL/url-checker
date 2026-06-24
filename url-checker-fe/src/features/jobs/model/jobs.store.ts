import { create } from 'zustand';

type JobsStoreState = {
  activeJobId: string | null;
  setActiveJobId: (jobId: string | null) => void;
};

export const useJobsStore = create<JobsStoreState>((set) => ({
  activeJobId: null,
  setActiveJobId: (jobId) => set({ activeJobId: jobId }),
}));
