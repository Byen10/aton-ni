<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPermission extends Model
{
    protected $fillable = [
        'user_id',
        'permissions',
        'use_custom_permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
        'use_custom_permissions' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function hasPermission($permission)
    {
        if (!$this->use_custom_permissions) {
            return false; // Use role permissions instead
        }
        
        return in_array($permission, $this->permissions ?? []);
    }

    public function addPermission($permission)
    {
        $permissions = $this->permissions ?? [];
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->permissions = $permissions;
            $this->use_custom_permissions = true;
            $this->save();
        }
    }

    public function removePermission($permission)
    {
        $permissions = $this->permissions ?? [];
        $permissions = array_filter($permissions, fn($p) => $p !== $permission);
        $this->permissions = array_values($permissions);
        $this->save();
    }

    public function setPermissions(array $permissions)
    {
        $this->permissions = $permissions;
        $this->use_custom_permissions = true;
        $this->save();
    }

    public function resetToRolePermissions()
    {
        $this->permissions = [];
        $this->use_custom_permissions = false;
        $this->save();
    }
}