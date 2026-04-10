<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Cart;
use App\Models\Payment;


class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    protected $table = 'orders';

    public $incrementing = true;

    public $timestamps = true;

    protected $fillable = [
        'cart_id',
        'quantity',
        'user_id',
        'order_date',
        'dest_address',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
