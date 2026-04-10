<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\Author;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Validation\ValidationException;

class BookController extends Controller
{
    public function all()
    {
        $books = Book::get();
        return response()->json([
            'data' => $books
        ]);
    }

    public function index(Request $request)
    {
        $search = $request->query('search');
        $query = Book::query();

        if($search){
            $query->where('title', 'like', "%{$search}%")
            ->orWhere('genre', 'like', "%{$search}%");
        }

        $perPage = $request->query('per_page',20);
        $book = $query->paginate($perPage);

        return response()->json([
            'status' => 'sukses',
            'pesan' => ' data berhasil di tampilkan ',
            'data' => $book
        ]);
    }

    public function store(Request $request, Author $id)
    {
        try {
            $validated = $request->validate([
                'title' => 'required',
                'publication_date' => 'required|date',
                'price' => 'required',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'status' => 'nullable',
                'stock' => 'required|integer',
                'genre' => 'required',
            ]);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('books', 'public');
                $validated['image'] = $path; 
            }

            if (!array_key_exists('edition', $validated)) {
                $validated['edition'] = '';
            }
            $validated['status'] = $validated['status'] ?? 'available';
            if (!array_key_exists('stock', $validated)) {
                $validated['stock'] = 0;
            }

            $book = $id->books()->create($validated);

            return response()->json([
                'status' => 'berhasil',
                'pesan' => 'data buku berhasil di input',
                'data' => $book
            ],201);
        } catch (ValidationException $ve) {
            Log::warning('Book store validation failed: ' . $ve->getMessage(), ['errors' => $ve->errors()]);
            return response()->json([
                'status' => 'error',
                'pesan' => 'Validasi gagal',
                'errors' => $ve->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error('Book store error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'pesan' => 'Terjadi kesalahan saat menyimpan buku: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $book = Book::find($id);

        if(!$book){
            return response()->json([
                'status' => 'error',
                'pesan' => 'tidak ditemukan'
            ],404);
        }

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Data berhasil ditemukan',
            'data' => $book
        ],200);
    }

    public function update(Request $request, $id)
    {
        $book = Book::find($id);

        if(!$book){
            return response()->json([
                'status' => 'error',
                'pesan' => 'tidak ditemukan'
            ],404);
        }

        $validated = $request->validate([
            'title' => 'required',
            'publication_date' => 'required|date',
            'price' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'edition' => 'nullable',
            'status' => 'nullable',
            'stock' => 'required|integer',
            'genre' => 'required',
        ]);

        // Handle new uploaded image: store and replace path
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('books', 'public');
            $validated['image'] = $path;
        } else {
            // prevent overwriting existing image with null when no file provided
            if (array_key_exists('image', $validated)) {
                unset($validated['image']);
            }
        }

        if (!array_key_exists('edition', $validated)) {
            $validated['edition'] = $book->edition ?? '';
        }

        $book->update($validated);

        return response()->json([
            'status' => 'sukses',
            'pesan' =>  'Data buku berhasil di update',
            'data' => $book
        ],200);
    }

    public function destroy($id)
    {
        $book = Book::find($id);

        if(!$book){
            return response()->json([
                'status' => 'error',
                'pesan' => 'tidak ditemukan'
            ],404);
        }

        $book->delete();

        return response()->json([
            'status' => 'sukses',
            'pesan' =>  'Data buku berhasil di hapus'
        ],200);
    }
}