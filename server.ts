import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import Database from 'better-sqlite3';
import axios from 'axios';
import * as admin from 'firebase-admin';
import fs from 'fs';

// Initialize SQLite for "others data" as requested for hosting server
const db = new Database('wellcare.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS clinic_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinic_id TEXT,
    total_patients INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    total_doctors INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS demo_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    clinic_id TEXT,
    doctor_id TEXT,
    patient_id TEXT,
    patient_name TEXT,
    doctor_name TEXT,
    date TEXT,
    time TEXT,
    type TEXT,
    status TEXT,
    amount REAL
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    age INTEGER,
    gender TEXT,
    blood_group TEXT,
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    patient_name TEXT,
    doctor_name TEXT,
    date TEXT,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT
  );
`);

// Seed initial demo data if empty
const seedData = () => {
  const stats = db.prepare('SELECT COUNT(*) as count FROM clinic_stats').get() as { count: number };
  if (stats.count === 0) {
    db.prepare('INSERT INTO clinic_stats (clinic_id, total_patients, total_revenue, total_doctors, total_appointments) VALUES (?, ?, ?, ?, ?)').run(
      'default-clinic', 487, 124500.50, 168, 1250
    );
    
    // Seed doctors
    const doctors = [
      { id: 'doc-1', name: 'Dr. Jeffrey Williams', specialty: 'Cardiology', fees: 1000, rating: 4.8 },
      { id: 'doc-2', name: 'Dr. Sarah Smith', specialty: 'Neurology', fees: 1200, rating: 4.9 },
      { id: 'doc-3', name: 'Dr. Mike Ross', specialty: 'Pediatrics', fees: 800, rating: 4.7 },
    ];
    db.prepare('INSERT INTO demo_data (type, data) VALUES (?, ?)').run('doctors', JSON.stringify(doctors));

    // Seed patients
    const patients = [
      { id: 'pat-1', name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9800000001', age: 28, gender: 'Male', blood_group: 'A+', address: 'Kathmandu' },
      { id: 'pat-2', name: 'Priya Thapa', email: 'priya@example.com', phone: '9800000002', age: 24, gender: 'Female', blood_group: 'O+', address: 'Pokhara' },
    ];
    patients.forEach(p => {
      db.prepare('INSERT INTO patients (id, name, email, phone, age, gender, blood_group, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        p.id, p.name, p.email, p.phone, p.age, p.gender, p.blood_group, p.address
      );
    });

    // Seed appointments
    const appointments = [
      { id: 'app-1', clinic_id: 'default-clinic', doctor_id: 'doc-1', patient_id: 'pat-1', patient_name: 'Aarav Sharma', doctor_name: 'Dr. Jeffrey Williams', date: '2026-04-02', time: '10:30 AM', type: 'In-person', status: 'Confirmed', amount: 1000 },
      { id: 'app-2', clinic_id: 'default-clinic', doctor_id: 'doc-2', patient_id: 'pat-2', patient_name: 'Priya Thapa', doctor_name: 'Dr. Sarah Smith', date: '2026-04-02', time: '11:15 AM', type: 'Video', status: 'Pending', amount: 1200 },
    ];
    appointments.forEach(a => {
      db.prepare('INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, patient_name, doctor_name, date, time, type, status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        a.id, a.clinic_id, a.doctor_id, a.patient_id, a.patient_name, a.doctor_name, a.date, a.time, a.type, a.status, a.amount
      );
    });

    // Seed records
    const records = [
      { id: 'REC-001', patient_id: 'pat-1', patient_name: 'Aarav Sharma', doctor_name: 'Dr. Jeffrey Williams', date: '2026-03-15', diagnosis: 'Hypertension', prescription: 'Amlodipine 5mg', notes: 'Patient advised to reduce salt intake.' },
    ];
    records.forEach(r => {
      db.prepare('INSERT INTO medical_records (id, patient_id, patient_name, doctor_name, date, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        r.id, r.patient_id, r.patient_name, r.doctor_name, r.date, r.diagnosis, r.prescription, r.notes
      );
    });
  }
};
seedData();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'WellCare Backend is running' });
  });

  // Example "others data" endpoint using SQLite
  app.get('/api/stats/:clinicId', (req, res) => {
    const { clinicId } = req.params;
    const row = db.prepare('SELECT * FROM clinic_stats WHERE clinic_id = ? OR clinic_id = "default-clinic"').get(clinicId);
    if (row) {
      res.json(row);
    } else {
      res.json({ clinic_id: clinicId, total_patients: 0, total_revenue: 0, total_doctors: 0, total_appointments: 0 });
    }
  });

  app.get('/api/demo/doctors', (req, res) => {
    const row = db.prepare('SELECT data FROM demo_data WHERE type = "doctors"').get() as { data: string };
    res.json(JSON.parse(row.data));
  });

  app.get('/api/demo/patients', (req, res) => {
    const rows = db.prepare('SELECT * FROM patients').all();
    res.json(rows);
  });

  app.post('/api/demo/patients', (req, res) => {
    const { name, email, phone, age, gender, blood_group, address } = req.body;
    const id = `pat-${Date.now()}`;
    db.prepare('INSERT INTO patients (id, name, email, phone, age, gender, blood_group, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, name, email, phone, age, gender, blood_group, address
    );
    res.status(201).json({ id, name, email, phone, age, gender, blood_group, address });
  });

  // Appointments CRUD
  app.get('/api/demo/appointments', (req, res) => {
    const rows = db.prepare('SELECT * FROM appointments').all();
    res.json(rows);
  });

  app.post('/api/demo/appointments', (req, res) => {
    const { clinic_id, doctor_id, patient_id, patient_name, doctor_name, date, time, type, amount } = req.body;
    const id = `app-${Date.now()}`;
    db.prepare('INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, patient_name, doctor_name, date, time, type, status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, clinic_id || 'default-clinic', doctor_id, patient_id, patient_name, doctor_name, date, time, type, 'Pending', amount
    );
    res.status(201).json({ id, status: 'Pending' });
  });

  // Records CRUD
  app.get('/api/demo/records', (req, res) => {
    const rows = db.prepare('SELECT * FROM medical_records').all();
    res.json(rows);
  });

  app.post('/api/demo/records', (req, res) => {
    const { patient_id, patient_name, doctor_name, date, diagnosis, prescription, notes } = req.body;
    const id = `REC-${Date.now()}`;
    db.prepare('INSERT INTO medical_records (id, patient_id, patient_name, doctor_name, date, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, patient_id, patient_name, doctor_name, date, diagnosis, prescription, notes
    );
    res.status(201).json({ id });
  });

  // Payment Verification (Nepal Focus: Khalti/eSewa)
  app.post('/api/payments/verify/khalti', async (req, res) => {
    const { token, amount } = req.body;
    try {
      const response = await axios.post('https://khalti.com/api/v2/payment/verify/', {
        token,
        amount
      }, {
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`
        }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(400).json({ error: error.response?.data || 'Verification failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WellCare Server running on http://localhost:${PORT}`);
  });
}

startServer();
