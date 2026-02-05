
export interface Admin {
  id: string;
  name: string;
  age: string;
  gender: string;
  address: string;
  mobile: string;
  whatsapp?: string;
  batch: string;
  joinDate: string;
  currentTrainer: string;
  latestTrainer: string;
  facebookLink: string;
  documents: string[]; // Base64 encoded images
  rating: number; // 1-5 stars
  status: 'Active' | 'Inactive';
}

export interface Batch {
  id: string;
  batchNumber: string;
  startDate: string;
  admissionDate: string;
  headTeacher: string;
  status: 'Coming Soon' | 'Ongoing' | 'Ended';
  adminIds: string[]; // IDs of admins from the AdminPage
  createdAt: string;
}

export interface Course {
  id: string;
  courseName: string;
  batches: Batch[];
}

export interface Sedulous {
  id: string;
  courseName: string;
  classType: string;
  batchNumber: string;
  classTime: string; // "08:30 PM" format
  days: string[]; // e.g., ["Monday", "Wednesday"]
}

export interface AppData {
  admins: Admin[];
  courses: Course[];
  sedulous: Sedulous[];
}

export type ActiveTab = 'Admin' | 'Sedulous' | 'Courses';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}
