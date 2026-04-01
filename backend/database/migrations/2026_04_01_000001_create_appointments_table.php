<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('clinic_id');
            $table->unsignedBigInteger('doctor_id');
            $table->unsignedBigInteger('patient_id');
            $table->date('appointment_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('status')->default('pending'); // pending, confirmed, cancelled, completed
            $table->string('type')->default('in-person'); // in-person, video
            $table->text('notes')->nullable();
            $table->decimal('amount', 10, 2)->default(0.00);
            $table->string('payment_status')->default('unpaid'); // unpaid, paid, partially_paid
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('clinic_id')->references('id')->on('clinics')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('users')->onDelete('cascade');

            $table->index(['clinic_id', 'appointment_date']);
            $table->index(['doctor_id', 'appointment_date']);
            $table->index(['patient_id', 'appointment_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
