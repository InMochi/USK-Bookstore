<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Author;
use App\Models\Category;

class Book extends Model
{
    use HasFactory;

    protected $table = 'books';

    public $incrementing = true;

    public $timestamps = true;

    protected $fillable = [
        'title', 
        'publication_date', 
        'author_id', 
        'price', 
        'image', 
        'edition',
        'status', 
        'stock', 
        'genre',
    ];

    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_category');
    }

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

}
