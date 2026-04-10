<?php

namespace App\Http\Controllers\Api;

use App\Models\Author;
use App\Models\Book;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthorController extends Controller
{


  public function index(Request $request)
  {

    $search = $request->query('search');
    $query = Author::query();

    if($search){
        $query->where('name', 'like', "%{$search}%");
    }

    $perPage = $request->query('per_page',20);
    $author = $query->paginate($perPage);

    return response()->json($author);

  }
  
  public function all()
  {
    $authors = Author::get();
    return response()->json([
        'data' => $authors
    ],200);
  }



    public function storeBook(Request $request, $author_id)
    {
        $author = Author::find($author_id);
        if (!$author) {
            return response()->json(['message' => 'Author not found'], 404);
        }

        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'publication_date' => 'required|date',
            'price'            => 'required|numeric',
            'stock'            => 'required|integer',
            'genre'            => 'required|string',
            'image'            => 'required|image|mimes:jpeg,png,jpg|max:2048', // Image wajib saat store baru
        ]);

        if ($request->hasFile('image')) {
            // Simpan gambar ke folder storage/app/public/books
            $path = $request->file('image')->store('books', 'public');
            $validated['image'] = $path;
        }

        // Tambahkan author_id ke data yang akan disimpan
        $validated['author_id'] = $author->id;
        $validated['status'] = $request->status ?? 'available';

        $book = Book::create($validated);

        return response()->json([
            'status' => 'success',
            'data'   => $book
        ], 201);
    }

  public function store(Request $request)
  {
    $validated = $request->validate([
        'name' => 'required',
        'description' => 'nullable',
        'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        'DOB' => 'required|date',
    ]);

    if ($request->hasFile('photo')) {
        $path = $request->file('photo')->store('authors', 'public');
        $validated['photo'] = $path; 
    }

    $author = Author::create($validated);

    return response()->json([
        'status' => 'success',
        'pesan' => 'Author ditambahkan',
        'data' => $author
    ],201);
  }

  public function show($id)
  {
    $author = Author::find($id);

    if(!$author){
        return response()->json([
            'status' => 'Tidak Ditemukan',
            'pesan' => 'Author Tidak ditemukan'
        ],404);
    }

    return response()->json([
        'status'=> 'Sukses',
        'pesan' => 'Data Author ditemukan',
        'data' => $author
    ],200);
  }


  public function update(Request $request, $id)
  {
    $author = Author::find($id);

    if(!$author){
        return response()->json([
            'status' => 'Tidak Ditemukan',
            'pesan' => 'Author Tidak ditemukan'
        ],404);
    }

    $validated = $request->validate([
        'name' => 'required',
        'description' => 'nullable',
        'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        'DOB' => 'required|date',
    ]);

    if ($request->hasFile('photo')) {
        $path = $request->file('photo')->store('authors', 'public');
        $validated['photo'] = $path;
    }

    $author->update($validated);

    return response()->json([
        'status' => 'Sukses',
        'pesan' => 'Data Author berhasil di update',
        'data' => $author
    ],200);
  }

  public function destroy($id)
  {
    $author = Author::find($id);
    $books = $author->books()->exists();

    if(!$author){
        return response()->json([
            'status' => 'Tidak Ditemukan',
            'pesan' => 'Author Tidak ditemukan'
        ],404);
    }

    if ($books) {
        return response()->json([
            'status' => 'error',
            'pesan' => 'Author tidak bisa dihapus karena masih memiliki buku terkait.'
        ], 400); 
    }

    $author->delete();

    return response()->json([
        "status" => 'Sukses',
        'pesan' => 'Data Author berhasil di hapus'
    ],200);
  }


  public function details($id)
  {
    $author = Author::with('books.categories')
    ->where('id', $id)
    ->firstOrFail();

    return response()->json([
        'status' => 'sukses',
        'data' => $author
    ],200);
  }
  
}
