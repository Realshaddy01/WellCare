export type UserRole = 'super_admin' | 'clinic_admin' | 'doctor' | 'receptionist' | 'patient';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  clinicId?: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  clinicId: string;
  specialty: string;
  fees: number;
  bio?: string;
  availability?: any;
}

export interface Patient {
  id: string;
  userId: string;
  clinicId: string;
  dob: string;
  allergies: string[];
  medicalHistory?: string;
  bloodGroup?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  clinicId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  type: 'in-person' | 'video';
  videoLink?: string;
}

export interface Encounter {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  prescriptions: any[];
  vitals?: any;
  createdAt: string;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  patientId: string;
  clinicId: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'partially_paid' | 'refunded';
  paymentMethod?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  gateway: 'fonepay' | 'khalti' | 'esewa' | 'cash';
  transactionId: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface Service {
  id: string;
  clinicId: string;
  doctorId?: string;
  name: string;
  price: number;
  description?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}
