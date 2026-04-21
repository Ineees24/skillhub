<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class AuthController extends Controller
{
    private const FIELD_EMAIL = 'email';

    // POST /api/login
    public function login(Request $request)
    {
        $credentials = $request->only(self::FIELD_EMAIL, 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Email ou mot de passe incorrect'], 401);
        }

        $user = auth('api')->user();

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60,
            'user'         => $user,
        ]);
    }

    // POST /api/register
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom'      => 'required|string|max:100',
            'prenom'   => 'required|string|max:100',
            self::FIELD_EMAIL => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:APPRENANT,FORMATEUR,ADMINISTRATEUR',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'nom'      => $request->nom,
            'prenom'   => $request->prenom,
            self::FIELD_EMAIL => $request->{self::FIELD_EMAIL},
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        $token = auth('api')->login($user);

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'user'         => $user,
        ], 201);
    }

    // GET /api/me
    public function me()
    {
        return response()->json(auth('api')->user());
    }

    // POST /api/logout
    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Déconnexion réussie']);
    }
}
