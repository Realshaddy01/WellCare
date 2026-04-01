<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'clinic_id',
        'appointment_id',
        'diagnosis',
        'prescription',
        'notes',
        'vitals' // JSON field for BP, Temp, etc.
    ];

    protected $casts = [
        'vitals' => 'array'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
