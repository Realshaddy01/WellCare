<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Patient::with('user');

        if ($user->role === 'clinic_admin') {
            $query->where('clinic_id', $user->clinic_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'age' => 'required|integer',
            'gender' => 'required|string',
            'blood_group' => 'nullable|string',
            'address' => 'nullable|string',
            'clinic_id' => 'required|exists:clinics,id'
        ]);

        return DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make('password123'), // Default password
                'role' => 'patient',
                'clinic_id' => $validated['clinic_id']
            ]);

            $patient = Patient::create([
                'user_id' => $user->id,
                'clinic_id' => $validated['clinic_id'],
                'age' => $validated['age'],
                'gender' => $validated['gender'],
                'blood_group' => $validated['blood_group'],
                'address' => $validated['address']
            ]);

            return response()->json($patient->load('user'), 201);
        });
    }

    public function show($id)
    {
        $patient = Patient::with(['user', 'appointments', 'medicalRecords'])->findOrFail($id);
        return response()->json($patient);
    }
}
