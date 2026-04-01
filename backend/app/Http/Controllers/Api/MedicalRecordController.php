<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;

class MedicalRecordController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = MedicalRecord::with(['patient.user', 'doctor', 'clinic']);

        if ($user->role === 'doctor') {
            $query->where('doctor_id', $user->id);
        } elseif ($user->role === 'patient') {
            $query->where('patient_id', $user->patient->id);
        } elseif ($user->role === 'clinic_admin') {
            $query->where('clinic_id', $user->clinic_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'clinic_id' => 'required|exists:clinics,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'diagnosis' => 'required|string',
            'prescription' => 'required|string',
            'notes' => 'nullable|string',
            'vitals' => 'nullable|array'
        ]);

        $record = MedicalRecord::create($validated);

        return response()->json($record->load(['patient.user', 'doctor']), 201);
    }

    public function show($id)
    {
        $record = MedicalRecord::with(['patient.user', 'doctor', 'appointment'])->findOrFail($id);
        return response()->json($record);
    }
}
