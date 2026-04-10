<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{

    public function index(Request $request)
    {
        $search = $request->query('search');
        $query = User::query();

        if($search){
            $query->where('name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%");
        }

        $perPage = $request->query('per_page',20);
        $user = $query->paginate($perPage);

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'data berhasil di tampilkan',
            'data' => $user
        ],200);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:users',
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' =>  Hash::make($request->password),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'pesan' => 'berhasil membuat akun',
            'data' => [
                'nama' => $user->name,
                'email' => $user->email,
                'token' => $token
            ],
            'token' => $token
        ],200);
    }
    
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password,$user->password)){
            return response()->json([
                'email atau password salah'
            ],401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'pesan' => 'login berhasil',
            'token' => $token,
            'data'=> [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ],200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'pesan' => 'berhasil keluar'
        ],200);
    }
}
