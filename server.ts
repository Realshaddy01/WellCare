import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import axios from 'axios';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

// Correct way to get a specific database in Firebase Admin SDK
const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId)
  : getFirestore(admin.app());

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Dr. Sathi HomeCare Backend is running with Firebase' });
  });

  // Insights from Firestore
  app.get('/api/dashboard/insights/:clinicId', async (req, res) => {
    try {
      const { clinicId } = req.params;
      const cid = clinicId === 'undefined' ? 'default-clinic' : clinicId;
      
      const [patientsSnap, doctorsSnap, appointmentsSnap, servicesSnap, paymentsSnap] = await Promise.all([
        db.collection('patients').get(),
        db.collection('doctors').where('clinicId', '==', cid).get(),
        db.collection('appointments').where('clinicId', '==', cid).get(),
        db.collection('services').where('clinicId', '==', cid).get(),
        db.collection('payments').where('clinicId', '==', cid).where('status', '==', 'Paid').get()
      ]);

      const totalRevenue = paymentsSnap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);

      res.json({
        total_patients: patientsSnap.size,
        total_doctors: doctorsSnap.size,
        total_appointments: appointmentsSnap.size,
        total_services: servicesSnap.size,
        active_services: servicesSnap.size,
        total_revenue: totalRevenue
      });
    } catch (error: any) {
      console.error('Error fetching insights:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  app.get('/api/dashboard/booking-status/:clinicId', async (req, res) => {
    try {
      const { clinicId } = req.params;
      const cid = clinicId === 'undefined' ? 'default-clinic' : clinicId;
      
      const appointmentsSnap = await db.collection('appointments').where('clinicId', '==', cid).get();
      const statusCounts: Record<string, number> = {};
      
      appointmentsSnap.docs.forEach(doc => {
        const status = doc.data().status || 'Pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const result = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching booking status:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  // Doctors CRUD
  app.get('/api/demo/doctors', async (req, res) => {
    try {
      const snap = await db.collection('doctors').get();
      const doctors = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(doctors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/demo/doctors', async (req, res) => {
    try {
      const docData = req.body;
      const docRef = await db.collection('doctors').add({
        ...docData,
        clinicId: docData.clinicId || 'default-clinic',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ id: docRef.id, ...docData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Services CRUD
  app.get('/api/demo/services', async (req, res) => {
    try {
      const snap = await db.collection('services').get();
      const services = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/demo/services', async (req, res) => {
    try {
      const serviceData = req.body;
      const docRef = await db.collection('services').add({
        ...serviceData,
        clinicId: serviceData.clinicId || 'default-clinic',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ id: docRef.id, ...serviceData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Patients CRUD
  app.get('/api/demo/patients', async (req, res) => {
    try {
      const snap = await db.collection('patients').get();
      const patients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(patients);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/demo/patients', async (req, res) => {
    try {
      const patientData = req.body;
      const docRef = await db.collection('patients').add({
        ...patientData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ id: docRef.id, ...patientData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Appointments CRUD
  app.get('/api/demo/appointments', async (req, res) => {
    try {
      const snap = await db.collection('appointments').get();
      const appointments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/demo/appointments', async (req, res) => {
    try {
      const appData = req.body;
      const docRef = await db.collection('appointments').add({
        ...appData,
        clinicId: appData.clinicId || 'default-clinic',
        status: appData.status || 'Pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ id: docRef.id, status: 'Pending' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Records CRUD
  app.get('/api/demo/records', async (req, res) => {
    try {
      const snap = await db.collection('medical_records').get();
      const records = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/demo/records', async (req, res) => {
    try {
      const recordData = req.body;
      const docRef = await db.collection('medical_records').add({
        ...recordData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ id: docRef.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Payments CRUD
  app.get('/api/demo/payments', async (req, res) => {
    try {
      const snap = await db.collection('payments').orderBy('createdAt', 'desc').get();
      const payments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Payment Verification (Nepal Focus: Khalti/eSewa)
  app.post('/api/payments/verify/khalti', async (req, res) => {
    const { token, amount, appointmentId, patientId, clinicId } = req.body;
    try {
      const response = await axios.post('https://khalti.com/api/v2/payment/verify/', {
        token,
        amount
      }, {
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`
        }
      });

      // If verification successful, record payment in Firestore
      if (response.data && response.data.idx) {
        await db.collection('payments').add({
          appointmentId,
          patientId,
          clinicId: clinicId || 'default-clinic',
          amount: amount / 100, // Khalti amount is in paisa
          status: 'Paid',
          paymentMethod: 'Khalti',
          transactionId: response.data.idx,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update appointment status if needed
        if (appointmentId) {
          await db.collection('appointments').doc(appointmentId).update({
            paymentStatus: 'Paid'
          });
        }
      }

      res.json(response.data);
    } catch (error: any) {
      console.error('Khalti verification error:', error.response?.data || error.message);
      res.status(400).json({ error: error.response?.data || 'Verification failed' });
    }
  });

  // Clinics CRUD
  app.get('/api/demo/clinics', async (req, res) => {
    try {
      const snap = await db.collection('clinics').get();
      const clinics = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(clinics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/demo/clinics', async (req, res) => {
    try {
      const clinicData = req.body;
      const docRef = await db.collection('clinics').add({
        ...clinicData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ id: docRef.id, ...clinicData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Inventory CRUD
  app.get('/api/demo/inventory', async (req, res) => {
    try {
      const snap = await db.collection('inventory').get();
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/demo/inventory', async (req, res) => {
    try {
      const itemData = req.body;
      const docRef = await db.collection('inventory').add({
        ...itemData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ id: docRef.id, ...itemData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lab Tests CRUD
  app.get('/api/demo/lab-tests', async (req, res) => {
    try {
      const snap = await db.collection('lab_tests').get();
      const tests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(tests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/demo/lab-tests', async (req, res) => {
    try {
      const testData = req.body;
      const docRef = await db.collection('lab_tests').add({
        ...testData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ id: docRef.id, ...testData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pharmacy / Prescriptions CRUD
  app.get('/api/demo/prescriptions', async (req, res) => {
    try {
      const snap = await db.collection('prescriptions').get();
      const prescriptions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(prescriptions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/demo/prescriptions', async (req, res) => {
    try {
      const presData = req.body;
      const docRef = await db.collection('prescriptions').add({
        ...presData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ id: docRef.id, ...presData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notifications CRUD
  app.get('/api/demo/notifications', async (req, res) => {
    try {
      const snap = await db.collection('notifications').orderBy('createdAt', 'desc').get();
      const notifications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/demo/notifications', async (req, res) => {
    try {
      const notifData = req.body;
      const docRef = await db.collection('notifications').add({
        ...notifData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ id: docRef.id, ...notifData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
