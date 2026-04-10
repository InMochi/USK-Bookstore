<?php

namespace App\Http\Controllers\Api;

use App\Models\Cart;
use App\Models\Book;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreCartRequest;
use App\Http\Requests\UpdateCartRequest;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $query = Cart::with('book');
        $user = $request->user();

        if ($user && $user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        if($search){
            $query->where(function($q) use ($search) {
                $q->where('book_id', 'like', "%{$search}%")
                  ->orWhere('user_id', 'like', "%{$search}%");
            });
        }

        $perPage = $request->query('per_page',20);
        $cart = $query->paginate($perPage);

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data keranjang berhasil ditemukan',
            'data' => $cart
        ],200);
    }

    public function store(Request $request, Book $book )
    {
        $validated = $request->validate([
            'total_books' => 'required',
            'total_price' => 'required'
        ]);
        
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $cart = $book->carts()->create([
            'user_id' => $user->id,
            'total_books' => $validated['total_books'],
            'total_price' => $validated['total_price']
        ]);

        return response()->json([ 
            'status' => 'sukses',
            'pesan' => 'berhasil',
            'data' => $cart 
        ],201);
    }

    public function show($id)
    {
        $user = request()->user();
        if ($user && $user->role !== 'admin') {
            $cart = $user->carts()->find($id);
        } else {
            $cart = Cart::find($id);
        }

        if(!$cart){
            return response()->json([
                'status' => 'not found',
                'pesan' => 'data tidak ditemukan',
            ],404);
        }

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data berhasil di tampilkan ',
            'data' => $cart
        ],200);
    }

    
    public function destroy(Request $request,$id)
    {
        $user = $request->user();

        $cart = $user->carts()->find($id);

        if(!$cart){
            return response()->json([
                'status' => 'not found',
                'pesan' => 'data tidak ditemukan',
            
            ],404);
        }

        $cart->delete();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data berhasil di hapus '
        ],200);
    }

}
