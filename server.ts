import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import mysql from 'mysql2/promise';
import axios from 'axios';
import * as admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Database Connection Setup
let db: any;
const isMySQL = process.env.DB_CONNECTION === 'mysql';

async function initDB() {
  if (isMySQL) {
    console.log('Connecting to MySQL database with following config:');
    console.log(`Host: ${process.env.DB_HOST || '127.0.0.1'}`);
    console.log(`Database: ${process.env.DB_DATABASE}`);
    console.log(`User: ${process.env.DB_USERNAME}`);
    try {
      db = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: Number(process.env.DB_PORT) || 3306,
      });
      console.log('Successfully connected to MySQL.');
    } catch (err: any) {
      console.error('FAILED to connect to MySQL:', err.message);
      console.error('Full Error:', err);
      process.exit(1);
    }
  } else {
    console.log('Attempting to use SQLite database (wellcare.db)...');
    try {
      const { default: Database } = await import('better-sqlite3');
      db = new Database('wellcare.db');
      console.log('Successfully connected to SQLite.');
      db.exec(`
        CREATE TABLE IF NOT EXISTS clinics (
          id TEXT PRIMARY KEY,
          name TEXT,
          address TEXT,
          phone TEXT,
          email TEXT
        );

        CREATE TABLE IF NOT EXISTS doctors (
          id TEXT PRIMARY KEY,
          clinic_id TEXT,
          name TEXT,
          specialty TEXT,
          fees REAL,
          bio TEXT,
          availability TEXT
        );

        CREATE TABLE IF NOT EXISTS services (
          id TEXT PRIMARY KEY,
          clinic_id TEXT,
          name TEXT,
          price REAL,
          description TEXT
        );

        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          appointment_id TEXT,
          patient_id TEXT,
          clinic_id TEXT,
          amount REAL,
          status TEXT,
          payment_method TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Migration for existing databases (Ensure columns exist)
      const tableInfo = db.prepare("PRAGMA table_info(clinic_stats)").all() as any[];
      const columns = tableInfo.map(c => c.name);
      if (!columns.includes('total_doctors')) {
        try { db.prepare('ALTER TABLE clinic_stats ADD COLUMN total_doctors INTEGER DEFAULT 0').run(); } catch(e) {}
      }
      if (!columns.includes('total_appointments')) {
        try { db.prepare('ALTER TABLE clinic_stats ADD COLUMN total_appointments INTEGER DEFAULT 0').run(); } catch(e) {}
      }
      seedData();
    } catch (error) {
      console.error('SQLite is not available. Please ensure better-sqlite3 is installed or use MySQL.');
      process.exit(1);
    }
  }
}

// Seed initial demo data
const seedData = async () => {
  let count = 0;
  if (isMySQL) {
    const [rows]: any = await db.execute('SELECT COUNT(*) as count FROM clinic_stats');
    count = rows[0].count;
  } else {
    const stats = db.prepare('SELECT COUNT(*) as count FROM clinic_stats').get() as { count: number };
    count = stats.count;
  }

  if (count === 0) {
    console.log('Seeding initial data...');
    const execute = async (sql: string, params: any[]) => {
      if (isMySQL) await db.execute(sql, params);
      else db.prepare(sql).run(...params);
    };

    await execute('INSERT INTO clinic_stats (clinic_id, total_patients, total_revenue, total_doctors, total_appointments) VALUES (?, ?, ?, ?, ?)', 
      ['default-clinic', 487, 124500.50, 168, 1250]);
    
    await execute('INSERT INTO clinics (id, name, address, phone, email) VALUES (?, ?, ?, ?, ?)',
      ['default-clinic', 'Dr. Sathi HomeCare Main Center', 'Kathmandu, Nepal', '9800000000', 'info@drsathi.com']);

    const doctors = [
      ['doc-1', 'default-clinic', 'Dr. Jeffrey Williams', 'Cardiology', 1000, 'Expert cardiologist with 15 years experience.', 'Mon-Fri 10am-4pm'],
      ['doc-2', 'default-clinic', 'Dr. Sarah Smith', 'Neurology', 1200, 'Specialist in neurological disorders.', 'Tue-Sat 11am-5pm'],
      ['doc-3', 'default-clinic', 'Dr. Mike Ross', 'Pediatrics', 800, 'Experienced pediatrician.', 'Mon-Thu 9am-3pm'],
    ];
    for (const d of doctors) {
      await execute('INSERT INTO doctors (id, clinic_id, name, specialty, fees, bio, availability) VALUES (?, ?, ?, ?, ?, ?, ?)', d);
    }

    const patients = [
      ['pat-1', 'Aarav Sharma', 'aarav@example.com', '9800000001', 28, 'Male', 'A+', 'Kathmandu'],
      ['pat-2', 'Priya Thapa', 'priya@example.com', '9800000002', 24, 'Female', 'O+', 'Pokhara'],
    ];
    for (const p of patients) {
      await execute('INSERT INTO patients (id, name, email, phone, age, gender, blood_group, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', p);
    }

    const appointments = [
      ['app-1', 'default-clinic', 'doc-1', 'pat-1', 'Aarav Sharma', 'Dr. Jeffrey Williams', '2026-04-02', '10:30 AM', 'In-person', 'Confirmed', 1000],
      ['app-2', 'default-clinic', 'doc-2', 'pat-2', 'Priya Thapa', 'Dr. Sarah Smith', '2026-04-02', '11:15 AM', 'Video', 'Pending', 1200],
    ];
    for (const a of appointments) {
      await execute('INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, patient_name, doctor_name, date, time, type, status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', a);
    }

    const records = [
      ['REC-001', 'pat-1', 'Aarav Sharma', 'Dr. Jeffrey Williams', '2026-03-15', 'Hypertension', 'Amlodipine 5mg', 'Patient advised to reduce salt intake.'],
    ];
    for (const r of records) {
      await execute('INSERT INTO medical_records (id, patient_id, patient_name, doctor_name, date, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', r);
    }

    const services = [
      ['ser-1', 'default-clinic', 'General Consultation', 500, 'Standard checkup'],
      ['ser-2', 'default-clinic', 'Follow-up Visit', 300, 'Post-treatment review'],
      ['ser-3', 'default-clinic', 'Minor Wound Dressing', 800, 'Wound care and dressing'],
    ];
    for (const s of services) {
      await execute('INSERT INTO services (id, clinic_id, name, price, description) VALUES (?, ?, ?, ?, ?)', s);
    }

    const payments = [
      ['pay-1', 'app-1', 'pat-1', 'default-clinic', 1000, 'Paid', 'Khalti', '2026-03-25 10:00:00'],
      ['pay-2', 'app-2', 'pat-2', 'default-clinic', 1200, 'Unpaid', 'Manual', '2026-03-25 11:00:00'],
    ];
    for (const p of payments) {
      await execute('INSERT INTO payments (id, appointment_id, patient_id, clinic_id, amount, status, payment_method, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', p);
    }

    console.log('Initial data seeded successfully.');
  }
};

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Dr. Sathi HomeCare Backend is running' });
  });

  // Example "others data" endpoint using SQLite
  app.get('/api/stats/:clinicId', async (req, res) => {
    try {
      const { clinicId } = req.params;
      let row;
      if (isMySQL) {
        const [rows] = await db.execute('SELECT * FROM clinic_stats WHERE clinic_id = ? OR clinic_id = "default-clinic"', [clinicId]);
        row = rows[0];
      } else {
        row = db.prepare('SELECT * FROM clinic_stats WHERE clinic_id = ? OR clinic_id = "default-clinic"').get(clinicId);
      }
      
      if (row) {
        res.json(row);
      } else {
        res.json({ clinic_id: clinicId, total_patients: 0, total_revenue: 0, total_doctors: 0, total_appointments: 0 });
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.get('/api/demo/doctors', async (req, res) => {
    try {
      let rows;
      if (isMySQL) {
        [rows] = await db.execute('SELECT * FROM doctors');
      } else {
        rows = db.prepare('SELECT * FROM doctors').all();
      }
      res.json(rows);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.post('/api/demo/doctors', async (req, res) => {
    try {
      const { clinic_id, name, specialty, fees, bio, availability } = req.body;
      const id = `doc-${Date.now()}`;
      if (isMySQL) {
        await db.execute('INSERT INTO doctors (id, clinic_id, name, specialty, fees, bio, availability) VALUES (?, ?, ?, ?, ?, ?, ?)', [
          id, clinic_id || 'default-clinic', name, specialty, fees, bio, availability
        ]);
      } else {
        db.prepare('INSERT INTO doctors (id, clinic_id, name, specialty, fees, bio, availability) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          id, clinic_id || 'default-clinic', name, specialty, fees, bio, availability
        );
      }
      res.status(201).json({ id, name, specialty });
    } catch (error: any) {
      console.error('Error creating doctor:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.get('/api/demo/services', async (req, res) => {
    try {
      let rows;
      if (isMySQL) {
        [rows] = await db.execute('SELECT * FROM services');
      } else {
        rows = db.prepare('SELECT * FROM services').all();
      }
      res.json(rows);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.post('/api/demo/services', async (req, res) => {
    try {
      const { clinic_id, name, price, description } = req.body;
      const id = `ser-${Date.now()}`;
      if (isMySQL) {
        await db.execute('INSERT INTO services (id, clinic_id, name, price, description) VALUES (?, ?, ?, ?, ?)', [
          id, clinic_id || 'default-clinic', name, price, description
        ]);
      } else {
        db.prepare('INSERT INTO services (id, clinic_id, name, price, description) VALUES (?, ?, ?, ?, ?)').run(
          id, clinic_id || 'default-clinic', name, price, description
        );
      }
      res.status(201).json({ id, name, price });
    } catch (error: any) {
      console.error('Error creating service:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.get('/api/demo/payments', async (req, res) => {
    try {
      let rows;
      if (isMySQL) {
        [rows] = await db.execute('SELECT * FROM payments ORDER BY created_at DESC');
      } else {
        rows = db.prepare('SELECT * FROM payments ORDER BY created_at DESC').all();
      }
      res.json(rows);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.get('/api/dashboard/insights/:clinicId', async (req, res) => {
    try {
      const { clinicId } = req.params;
      const cid = clinicId === 'undefined' ? 'default-clinic' : clinicId;
      
      let stats: any = {};
      if (isMySQL) {
        const [patients]: any = await db.execute('SELECT COUNT(*) as count FROM patients');
        const [doctors]: any = await db.execute('SELECT COUNT(*) as count FROM doctors WHERE clinic_id = ?', [cid]);
        const [appointments]: any = await db.execute('SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ?', [cid]);
        const [services]: any = await db.execute('SELECT COUNT(*) as count FROM services WHERE clinic_id = ?', [cid]);
        const [revenue]: any = await db.execute('SELECT SUM(amount) as total FROM payments WHERE clinic_id = ? AND status = "Paid"', [cid]);
        
        stats = {
          total_patients: patients[0].count,
          total_doctors: doctors[0].count,
          total_appointments: appointments[0].count,
          total_services: services[0].count,
          active_services: services[0].count, // Mocking active as total for now
          total_revenue: revenue[0].total || 0
        };
      } else {
        stats = {
          total_patients: db.prepare('SELECT COUNT(*) as count FROM patients').get().count,
          total_doctors: db.prepare('SELECT COUNT(*) as count FROM doctors WHERE clinic_id = ?').get(cid).count,
          total_appointments: db.prepare('SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ?').get(cid).count,
          total_services: db.prepare('SELECT COUNT(*) as count FROM services WHERE clinic_id = ?').get(cid).count,
          active_services: db.prepare('SELECT COUNT(*) as count FROM services WHERE clinic_id = ?').get(cid).count,
          total_revenue: db.prepare('SELECT SUM(amount) as total FROM payments WHERE clinic_id = ? AND status = "Paid"').get(cid).total || 0
        };
      }
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching insights:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.get('/api/dashboard/booking-status/:clinicId', async (req, res) => {
    try {
      const { clinicId } = req.params;
      const cid = clinicId === 'undefined' ? 'default-clinic' : clinicId;
      
      let rows;
      if (isMySQL) {
        [rows] = await db.execute('SELECT status, COUNT(*) as count FROM appointments WHERE clinic_id = ? GROUP BY status', [cid]);
      } else {
        rows = db.prepare('SELECT status, COUNT(*) as count FROM appointments WHERE clinic_id = ? GROUP BY status').all(cid);
      }
      res.json(rows);
    } catch (error: any) {
      console.error('Error fetching booking status:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.get('/api/demo/patients', async (req, res) => {
    try {
      let rows;
      if (isMySQL) {
        [rows] = await db.execute('SELECT * FROM patients');
      } else {
        rows = db.prepare('SELECT * FROM patients').all();
      }
      res.json(rows);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.post('/api/demo/patients', async (req, res) => {
    try {
      const { name, email, phone, age, gender, blood_group, address } = req.body;
      const id = `pat-${Date.now()}`;
      if (isMySQL) {
        await db.execute('INSERT INTO patients (id, name, email, phone, age, gender, blood_group, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
          id, name, email, phone, age, gender, blood_group, address
        ]);
      } else {
        db.prepare('INSERT INTO patients (id, name, email, phone, age, gender, blood_group, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
          id, name, email, phone, age, gender, blood_group, address
        );
      }
      res.status(201).json({ id, name, email, phone, age, gender, blood_group, address });
    } catch (error: any) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  // Appointments CRUD
  app.get('/api/demo/appointments', async (req, res) => {
    try {
      let rows;
      if (isMySQL) {
        [rows] = await db.execute('SELECT * FROM appointments');
      } else {
        rows = db.prepare('SELECT * FROM appointments').all();
      }
      res.json(rows);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.post('/api/demo/appointments', async (req, res) => {
    try {
      const { clinic_id, doctor_id, patient_id, patient_name, doctor_name, date, time, type, amount } = req.body;
      const id = `app-${Date.now()}`;
      if (isMySQL) {
        await db.execute('INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, patient_name, doctor_name, date, time, type, status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
          id, clinic_id || 'default-clinic', doctor_id, patient_id, patient_name, doctor_name, date, time, type, 'Pending', amount
        ]);
      } else {
        db.prepare('INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, patient_name, doctor_name, date, time, type, status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
          id, clinic_id || 'default-clinic', doctor_id, patient_id, patient_name, doctor_name, date, time, type, 'Pending', amount
        );
      }
      res.status(201).json({ id, status: 'Pending' });
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  // Records CRUD
  app.get('/api/demo/records', async (req, res) => {
    try {
      let rows;
      if (isMySQL) {
        [rows] = await db.execute('SELECT * FROM medical_records');
      } else {
        rows = db.prepare('SELECT * FROM medical_records').all();
      }
      res.json(rows);
    } catch (error: any) {
      console.error('Error fetching records:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.post('/api/demo/records', async (req, res) => {
    try {
      const { patient_id, patient_name, doctor_name, date, diagnosis, prescription, notes } = req.body;
      const id = `REC-${Date.now()}`;
      if (isMySQL) {
        await db.execute('INSERT INTO medical_records (id, patient_id, patient_name, doctor_name, date, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
          id, patient_id, patient_name, doctor_name, date, diagnosis, prescription, notes
        ]);
      } else {
        db.prepare('INSERT INTO medical_records (id, patient_id, patient_name, doctor_name, date, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
          id, patient_id, patient_name, doctor_name, date, diagnosis, prescription, notes
        );
      }
      res.status(201).json({ id });
    } catch (error: any) {
      console.error('Error creating record:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
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
    console.log(`Dr. Sathi HomeCare Server running on http://localhost:${PORT}`);
  });
}

startServer();
