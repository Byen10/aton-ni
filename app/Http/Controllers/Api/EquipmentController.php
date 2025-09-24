<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class EquipmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Equipment::with(['category']);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by category
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // Search by name, brand, or model
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('brand', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%")
                      ->orWhere('asset_tag', 'like', "%{$search}%");
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 10);
            $equipment = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $equipment,
                'message' => 'Equipment retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching equipment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'category' => 'required|string',
                'serial_number' => 'required|string|unique:equipment',
                'brand' => 'required|string',
                'supplier' => 'required|string',
                'description' => 'required|string',
                'price' => 'required|numeric',
                'item_image' => 'nullable|image|max:5120', // 5MB max
                'receipt_image' => 'nullable|image|max:5120', // 5MB max
            ]);

            $itemImagePath = null;
            $receiptImagePath = null;

            // Ensure directories exist
            if (!Storage::disk('public')->exists('equipment/items')) {
                Storage::disk('public')->makeDirectory('equipment/items');
            }
            if (!Storage::disk('public')->exists('equipment/receipts')) {
                Storage::disk('public')->makeDirectory('equipment/receipts');
            }

            if ($request->hasFile('item_image')) {
                $itemImagePath = $request->file('item_image')->store('equipment/items', 'public');
            }

            if ($request->hasFile('receipt_image')) {
                $receiptImagePath = $request->file('receipt_image')->store('equipment/receipts', 'public');
            }

            // Get or create category
            $category = Category::firstOrCreate(
                ['name' => $request->category],
                ['description' => 'Auto-created category']
            );

            $equipment = Equipment::create([
                'name' => $request->brand, // Using brand as name
                'brand' => $request->brand,
                'model' => $request->category,
                'serial_number' => $request->serial_number,
                'specifications' => $request->description,
                'status' => 'available',
                'condition' => 'excellent',
                'purchase_price' => $request->price,
                'location' => $request->supplier,
                'item_image' => $itemImagePath,
                'receipt_image' => $receiptImagePath,
                'purchase_date' => now(),
                'category_id' => $category->id,
            ]);

            $equipment->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Equipment added successfully',
                'data' => $equipment
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Clean up any uploaded files if the database operation fails
            if (isset($itemImagePath)) {
                Storage::disk('public')->delete($itemImagePath);
            }
            if (isset($receiptImagePath)) {
                Storage::disk('public')->delete($receiptImagePath);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error adding equipment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $equipment = Equipment::with(['category', 'requests.user', 'transactions.user'])
                             ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $equipment,
            'message' => 'Equipment retrieved successfully'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $equipment = Equipment::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'brand' => 'sometimes|required|string|max:255',
                'model' => 'nullable|string|max:255',
                'specifications' => 'nullable|string',
                'serial_number' => 'nullable|string|max:255|unique:equipment,serial_number,' . $id,
                'asset_tag' => 'nullable|string|max:255|unique:equipment,asset_tag,' . $id,
                'status' => 'sometimes|required|in:available,in_use,maintenance,retired',
                'condition' => 'sometimes|required|in:excellent,good,fair,poor',
                'purchase_price' => 'nullable|numeric|min:0',
                'purchase_date' => 'nullable|date',
                'warranty_expiry' => 'nullable|date|after:purchase_date',
                'notes' => 'nullable|string',
                'location' => 'nullable|string|max:255',
                'category_id' => 'nullable|exists:categories,id',
                'item_image' => 'nullable|image|max:5120',
                'receipt_image' => 'nullable|image|max:5120',
            ]);

            // Handle file uploads and remove old files if present
            if ($request->hasFile('item_image')) {
                if ($equipment->item_image) {
                    Storage::disk('public')->delete($equipment->item_image);
                }
                $validated['item_image'] = $request->file('item_image')->store('equipment/item_images', 'public');
            }

            if ($request->hasFile('receipt_image')) {
                if ($equipment->receipt_image) {
                    Storage::disk('public')->delete($equipment->receipt_image);
                }
                $validated['receipt_image'] = $request->file('receipt_image')->store('equipment/receipt_images', 'public');
            }

            $equipment->update($validated);
            $equipment->load('category');

            return response()->json([
                'success' => true,
                'data' => $equipment,
                'message' => 'Equipment updated successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $equipment = Equipment::findOrFail($id);

        // Check if equipment has active transactions
        if ($equipment->transactions()->where('status', 'active')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete equipment with active transactions'
            ], 422);
        }

        $equipment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipment deleted successfully'
        ]);
    }

    /**
     * Get equipment statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total' => Equipment::count(),
                'available' => Equipment::where('status', 'available')->count(),
                'in_use' => Equipment::where('status', 'in_use')->count(),
                'maintenance' => Equipment::where('status', 'maintenance')->count(),
                'retired' => Equipment::where('status', 'retired')->count(),
                'by_condition' => Equipment::selectRaw('condition, COUNT(*) as count')
                                      ->groupBy('condition')
                                      ->pluck('count', 'condition'),
                'by_category' => Equipment::with('category')
                                     ->selectRaw('category_id, COUNT(*) as count')
                                     ->groupBy('category_id')
                                     ->get()
                                     ->mapWithKeys(function ($item) {
                                         return [$item->category->name ?? 'Uncategorized' => $item->count];
                                     })
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Equipment statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
