<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    /**
     * Display a listing of appointments for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Appointment::with(['doctor', 'patient', 'clinic']);

        if ($user->role === 'doctor') {
            $query->where('doctor_id', $user->id);
        } elseif ($user->role === 'patient') {
            $query->where('patient_id', $user->id);
        } elseif ($user->role === 'clinic_admin') {
            $query->where('clinic_id', $user->clinic_id);
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'doctor_id' => 'required|exists:users,id',
            'patient_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'type' => 'required|in:in-person,video',
            'amount' => 'required|numeric'
        ]);

        $appointment = Appointment::create($validated);

        return response()->json($appointment, 201);
    }

    /**
     * Update the specified appointment status.
     */
    public function updateStatus(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update(['status' => $request->status]);

        return response()->json($appointment);
    }
}
