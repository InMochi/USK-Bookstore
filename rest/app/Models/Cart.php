<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Book;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use App\Models\Order;

// #[Guarded([])]

class Cart extends Model
{
    /** @use HasFactory<\Database\Factories\CartFactory> */
    use HasFactory;

    protected $table = 'carts';

    public $incrementing = true;

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'book_id',
        'total_books',
        'total_price',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
