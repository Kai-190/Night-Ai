<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'reference',
        'description',
        'amount',
        'currency',
        'status',
        'checkout_session_id',
    ];
}
