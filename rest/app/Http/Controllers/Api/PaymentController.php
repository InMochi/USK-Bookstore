<?php

namespace App\Http\Controllers\Api;

use App\Models\Payment;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Cart;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $query = Payment::query();

        if($search){
            $query->where('status', 'like', "%{$search}%")
            ->orWhere('receipt_number','like', "%{$search}%");
        }

        $perPage = $request->query('per_page',20);
        $payment = $query->paginate($perPage);

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data berhasil ditemukan',
            'data' => $payment
        ],200);
    }

   public function store(Request $request, Order $order)
   {

    $validated = $request->validate([
        'status' => 'required',
        'payment_method' => 'required',
    ]);

    $user = $request->user();

    if(!$user){
        return response()->json([
            'pesan' => 'Login terlebih dahulu untuk melakukan order',
        ],401);
    }

    $generatedReceiptNumber = "PAY-" . date('YmdHis') . "-" . strtoupper(Str::random(4));

    $payment = $order->payments()->create([
        'user_id' => $user->id,
        'status' => $validated['status'],
        'payment_method' => $validated['payment_method'],
        'receipt_number' => $generatedReceiptNumber,
    ]);

    return response()->json([
        'status' => 'sukses',
        'pesan' => 'data berhasil dibuat',
        'data' => $payment
    ],201);
   }

    public function show($id)
    {
        $payment = Payment::find($id);

        if(!$payment){
            return response()->json([
                'status' => 'not found',
                'pesan' => 'data tidak ditemukan',
            
            ],404);
        }

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data berhasil di tampilkan ',
            'data' => $payment
        ],200);
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,approved,rejected',
            ]);

            DB::beginTransaction();

            $payment = Payment::findOrFail($id);
            $payment->status = $request->status;
            $payment->save();

            $order = Order::findOrFail($payment->order_id);
            $order->load('cart.book');
            
            if ($request->status === 'approved') {
                $order->status = 'complete';
                
                if (!$order->cart || !$order->cart->book) {
                    throw new \Exception('Invalid order cart or book');
                }
                
                $cart = $order->cart;
                $book = $cart->book;
                
                if ($book->stock < $cart->total_books) {
                    throw new \Exception('Insufficient stock: ' . $book->title);
                }
                
                $book->decrement('stock', $cart->total_books);
                Log::info('Stock deducted for completed order', [
                    'order_id' => $order->id,
                    'book_id' => $book->id,
                    'book_title' => $book->title,
                    'quantity' => $cart->total_books,
                    'new_stock' => $book->getOriginal('stock') - $cart->total_books
                ]);
            } elseif ($request->status === 'rejected') {
                $order->status = 'pending';
            }
            $order->save();

            DB::commit();

            return response()->json([
                'message' => 'Payment status updated successfully',
                'data' => $payment,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Payment update error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'message' => 'Server error while updating payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    
    public function destroy($id)
    {
        $payment = Payment::find($id);

        if(!$payment){
            return response()->json([
                'status' => 'not found',
                'pesan' => 'data tidak ditemukan',
            ],404);
        }

        $payment->delete();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data berhasil di hapus '
        ],200);
    }

}
