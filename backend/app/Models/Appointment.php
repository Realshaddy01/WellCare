<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'clinic_id',
        'doctor_id',
        'patient_id',
        'appointment_date',
        'start_time',
        'end_time',
        'status', // pending, confirmed, cancelled, completed
        'type', // in-person, video
        'notes',
        'amount',
        'payment_status'
    ];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }
}
