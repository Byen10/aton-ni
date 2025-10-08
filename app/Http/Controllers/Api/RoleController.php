<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use App\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(Request $request): JsonResponse
    {
        $roles = Role::query()->orderBy('id', 'asc')->get();
        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:roles,name',
                'display_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'permissions' => 'nullable|array',
                'is_active' => 'boolean',
            ]);

            $role = Role::create($validated);

            // Log the activity
            ActivityLogService::logSystemActivity(
                'Created role',
                "Created new role: {$role->name} ({$role->display_name})"
            );

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Role created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Display the specified role.
     */
    public function show(int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $role,
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $role = Role::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255|unique:roles,name,' . $role->id,
                'display_name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'permissions' => 'nullable|array',
                'is_active' => 'boolean',
            ]);

            $role->update($validated);

            // Log the activity
            ActivityLogService::logSystemActivity(
                'Updated role',
                "Updated role: {$role->name} ({$role->display_name})"
            );

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Role updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Remove the specified role.
     */
    public function destroy(int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        
        // Log the activity before deletion
        ActivityLogService::logSystemActivity(
            'Deleted role',
            "Deleted role: {$role->name} ({$role->display_name})"
        );
        
        $role->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully',
        ]);
    }

    /**
     * Toggle or set permissions for a role.
     */
    public function setPermissions(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        $validated = $request->validate([
            'permissions' => 'required|array',
        ]);

        $role->permissions = array_values($validated['permissions']);
        $role->save();

        // Log the activity
        ActivityLogService::logSystemActivity(
            'Updated role permissions',
            "Updated permissions for role: {$role->name} ({$role->display_name})"
        );

        return response()->json([
            'success' => true,
            'data' => $role,
            'message' => 'Permissions updated successfully',
        ]);
    }
}


