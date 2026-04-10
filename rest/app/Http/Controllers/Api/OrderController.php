<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Cart;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $query = Order::query($search);

        if($search){
            $query->where('status', 'like', "%{$search}%");
        }

        $perPage = $request->query('per_page',20);
        $order = $query->paginate($perPage);

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data berhasil ditemukan',
            'data' => $order
        ],200);
    }

   public function store(Request $request, Cart $cart)
   {
    $validated = $request->validate([
        'quantity' => 'required',
        'order_date' => 'required',
        'dest_address' => 'required',
        'status' => 'required'
    ]);

    $user = $request->user();

    if(!$user){
        return response()->json([
            'pesan' => 'Login terlebih dahulu untuk melakukan order',
        ],401);
    }

    $order = $cart->orders()->create([
        'user_id' => $user->id,
        'quantity' => $validated['quantity'],
        'order_date' => $validated['order_date'],
        'dest_address' => $validated['dest_address'],
        'status' => $validated['status'],
    ]);

    return response()->json([
        'status' => 'sukses',
        'pesan' => 'SUKSES INTEGRITAS SOLIDARITAS',
        'data' => $order
    ],201);
   }

    public function show($id)
    {
        $order = Order::find($id);

        if(!$order){
            return response()->json([
                'status' => 'not found',
                'pesan' => 'data tidak ditemukan',
            
            ],404);
        }

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data berhasil di tampilkan ',
            'data' => $order
        ],200);
    }

    
    public function destroy($id)
    {
        $order = Order::find($id);

        if(!$order){
            return response()->json([
                'status' => 'not found',
                'pesan' => 'data tidak ditemukan',
            
            ],404);
        }

        $order->delete();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data berhasil di hapus '
        ],200);
    }

    public function update(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'status' => 'not found',
                'pesan' => 'data tidak ditemukan',
            ], 404);
        }

        $validated = $request->validate([
            'dest_address' => 'required|string',
        ]);

        $order->dest_address = $validated['dest_address'];
        $order->save();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data berhasil diupdate',
            'data' => $order
        ], 200);
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'cart_ids'     => 'required|array',
            'cart_ids.*'   => 'required|integer|exists:carts,id',
            'order_date'   => 'required',
            'dest_address' => 'required',
            'status'       => 'required',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'pesan' => 'Login terlebih dahulu untuk melakukan order',
            ], 401);
        }

        // Hitung total quantity dari semua cart
        $carts = \App\Models\Cart::whereIn('id', $validated['cart_ids'])->get();
        $totalQuantity = $carts->sum('total_books');

        // Buat 1 order saja
        $firstCart = $carts->first();
        $order = $firstCart->orders()->create([
            'user_id'      => $user->id,
            'quantity'     => $totalQuantity,
            'order_date'   => $validated['order_date'],
            'dest_address' => $validated['dest_address'],
            'status'       => $validated['status'],
        ]);

        return response()->json([
            'status' => 'sukses',
            'pesan'  => 'Order berhasil dibuat',
            'data'   => $order
        ], 201);
    }

}
