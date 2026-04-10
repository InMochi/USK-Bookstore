<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use App\Models\Book;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Illuminate\Http\Request;


class CategoryController extends Controller
{
 public function index(Request $request)
{
    $search = $request->query('search');
    $query = Category::withCount('books');

    if ($search) {
        $query->where('category_name', 'like', "%{$search}%");
    }

    $perPage = $request->query('per_page', 20);
    $categories = $query->paginate($perPage);

    return response()->json([
        'status' => 'sukses',
        'pesan'  => 'data berhasil ditemukan',
        'data'   => $categories
    ], 200);
}

public function detail($id)
{
    $category = Category::with('books')->find($id);

    if (!$category) {
        return response()->json([
            'status' => 'not found',
            'pesan'  => 'data tidak ditemukan',
        ], 404);
    }

    return response()->json([
        'status' => 'sukses',
        'pesan'  => 'data berhasil ditemukan',
        'data'   => $category
    ], 200);
}

//
public function store(Request $request, Book $book)
{
    $validated = $request->validate([
        'category_name' => 'required|string',
    ]);

    $category = Category::firstOrCreate([
        'category_name' => $validated['category_name']
    ]);
    
    $book->categories()->syncWithoutDetaching([$category->id]);

    return response()->json([
        'status' => 'sukses',
        'pesan'  => 'Category berhasil ditambahkan',
        'data'   => $category
    ], 201);
}

// destroy — hapus category
public function destroy($id)
{
    $category = Category::find($id);

    if (!$category) {
        return response()->json([
            'status' => 'not found',
            'pesan'  => 'data tidak ditemukan',
        ], 404);
    }

    if ($category->books()->count() > 0) {
        return response()->json([
            'status' => 'error',
            'pesan'  => 'Tidak dapat menghapus kategori yang masih memiliki buku terkait.',
        ], 400);
    }

    $category->delete();

    return response()->json([
        'status' => 'sukses',
        'pesan'  => 'data berhasil dihapus'
    ], 200);
}

// update — edit nama category
public function update(Request $request, $id)
{
    $category = Category::find($id);

    if (!$category) {
        return response()->json([
            'status' => 'not found',
            'pesan'  => 'data tidak ditemukan',
        ], 404);
    }

    $validated = $request->validate([
        'category_name' => 'required|string',
    ]);

    $category->category_name = $validated['category_name'];
    $category->save();

    return response()->json([
        'status' => 'sukses',
        'pesan'  => 'data berhasil diupdate',
        'data'   => $category
    ], 200);
}
}


