<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Book;

class Category extends Model
{
    /** @use HasFactory<\Database\Factories\CategoryFactory> */
    use HasFactory;

    protected $table = 'categories';

    public $incrementing = true;

    public $timestamps = true;

    protected $fillable = [
        'category_name'
    ];

    public function books()
    {
        return $this->belongsToMany(Book::class, 'book_category');
    }
}
