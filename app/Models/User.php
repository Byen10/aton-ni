<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'employee_id',
        'position',
        'department',
        'phone',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function requests()
    {
        return $this->hasMany(Request::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function approvedRequests()
    {
        return $this->hasMany(Request::class, 'approved_by');
    }

    public function processedTransactions()
    {
        return $this->hasMany(Transaction::class, 'processed_by');
    }

    public function userPermissions()
    {
        return $this->hasOne(UserPermission::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRole($query, $roleId)
    {
        return $query->where('role_id', $roleId);
    }

    // Accessors & Mutators

    public function hasRole($roleName)
    {
        return $this->role && $this->role->name === $roleName;
    }

    public function hasPermission($permission)
    {
        // Check if user has custom permissions enabled
        if ($this->userPermissions && $this->userPermissions->use_custom_permissions) {
            return $this->userPermissions->hasPermission($permission);
        }
        
        // Fall back to role permissions
        return $this->role && $this->role->hasPermission($permission);
    }

    public function getEffectivePermissions()
    {
        // Return custom permissions if enabled, otherwise role permissions
        if ($this->userPermissions && $this->userPermissions->use_custom_permissions) {
            return $this->userPermissions->permissions ?? [];
        }
        
        return $this->role ? ($this->role->permissions ?? []) : [];
    }

    public function enableCustomPermissions(array $permissions = [])
    {
        if (!$this->userPermissions) {
            $this->userPermissions()->create([
                'permissions' => $permissions,
                'use_custom_permissions' => true,
            ]);
        } else {
            $this->userPermissions->setPermissions($permissions);
        }
    }

    public function disableCustomPermissions()
    {
        if ($this->userPermissions) {
            $this->userPermissions->resetToRolePermissions();
        }
    }
}
