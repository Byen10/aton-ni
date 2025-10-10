<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Role;

class AuthController extends Controller
{
    public function showLoginForm()
    {
        return view('welcome');
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        $credentials = $request->only('email', 'password');

        // Find user by email
        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password'
                ], 401);
            }
            return back()->withErrors(['email' => 'Invalid email or password'])->withInput();
        }

        // Check if user is active
        if (!$user->is_active) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is deactivated'
                ], 401);
            }
            return back()->withErrors(['email' => 'Account is deactivated'])->withInput();
        }

        // Verify password
        if (!Hash::check($credentials['password'], $user->password)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password'
                ], 401);
            }
            return back()->withErrors(['email' => 'Invalid email or password'])->withInput();
        }

        // Login the user
        Auth::login($user);
        
        // Commit the session to ensure it's stored
        session()->save();

        // Get user role information
        $role = $user->role;
        
        // Determine redirect route based on role
        $redirectRoute = $this->getRedirectRouteForRole($role);
        
        if ($request->expectsJson()) {
            // For JSON requests, we need to ensure the session cookie is properly set
            // by using a different approach - return a redirect response that sets the cookie
            // and then redirect back to the frontend with the user data
            
            // Store user data in session temporarily
            session(['login_user_data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role ? $role->name : null,
                'role_display' => $role ? $role->display_name : null,
                'permissions' => $role ? $role->permissions : null,
                'is_active' => $user->is_active
            ]]);
            
            // Return a redirect response that will set the session cookie
            return redirect()->route($redirectRoute)->with('login_success', true);
        }

        return redirect()->route($redirectRoute);
    }

    /**
     * Determine the redirect route based on user role
     */
    private function getRedirectRouteForRole($role)
    {
        if (!$role) {
            return 'dashboard'; // Default fallback
        }

        // Check role name
        switch ($role->name) {
            case 'employee':
                return 'employee.dashboard';
            case 'super_admin':
            case 'admin':
                return 'dashboard';
            default:
                return 'dashboard';
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/');
    }

    public function checkAuth()
    {
        if (Auth::check()) {
            $user = Auth::user();
            // Eager-load relations to expose permissions correctly
            $user->load(['role', 'userPermissions']);
            $role = $user->role;
            $userPerm = $user->userPermissions;
            
            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $role ? $role->name : null,
                    'role_display' => $role ? $role->display_name : null,
                    // Keep role permissions field for backward-compat
                    'permissions' => $role ? $role->permissions : null,
                    // NEW: include user custom permissions so the frontend can prefer them
                    'user_permissions' => $userPerm ? [
                        'use_custom_permissions' => (bool) $userPerm->use_custom_permissions,
                        'permissions' => $userPerm->permissions ?? [],
                    ] : null,
                    'is_active' => $user->is_active
                ]
            ]);
        }

        return response()->json(['authenticated' => false]);
    }
    
    public function getLoginData()
    {
        if (Auth::check()) {
            $user = Auth::user();
            $user->load(['role', 'userPermissions']);
            $role = $user->role;
            $userPerm = $user->userPermissions;
            
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $role ? $role->name : null,
                    'role_display' => $role ? $role->display_name : null,
                    'permissions' => $role ? $role->permissions : null,
                    'user_permissions' => $userPerm ? [
                        'use_custom_permissions' => (bool) $userPerm->use_custom_permissions,
                        'permissions' => $userPerm->permissions ?? [],
                    ] : null,
                    'is_active' => $user->is_active
                ],
                'redirect' => route('dashboard')
            ]);
        }
        
        return response()->json(['success' => false, 'message' => 'Not authenticated']);
    }
}