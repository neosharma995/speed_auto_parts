<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Vehicle;
use App\Services\VehicleFitmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected VehicleFitmentService $fitmentService
    ) {}

    public function show(string $slug, Request $request): Response
    {
        $aliases = [
            'performance-summer-tire' => 'pilot-sport-5-performance-tire',
            'high-flow-cold-air-intake-system' => 'cold-air-intake-system',
            'track-spec-adjustable-coilover-kit' => 'b16-pss10-coilover-suspension-kit',
        ];

        $targetSlug = $aliases[$slug] ?? $slug;

        $product = Product::published()
            ->where('slug', $targetSlug)
            ->with([
                'brand',
                'category',
                'taxClass.rates',
                'variations',
                'attributes.values',
                'productVehicles.vehicle',
                'reviews' => fn ($q) => $q->orderByDesc('created_at'),
            ])
            ->firstOrFail();

        $activeVehicle = session('active_vehicle');
        $fitmentStatus = null;

        if ($activeVehicle && !empty($activeVehicle['id'])) {
            $fitmentStatus = $this->fitmentService->checkFitment(
                $product->id,
                (int) $activeVehicle['id']
            );
        }

        $relatedProducts = Product::published()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['brand', 'category', 'variations'])
            ->take(4)
            ->get();

        return Inertia::render('Public/ProductShow', [
            'product' => $product,
            'variations' => $product->variations,
            'compatibleVehicles' => $product->productVehicles,
            'reviews' => $product->reviews,
            'relatedProducts' => $relatedProducts,
            'activeVehicle' => $activeVehicle,
            'fitmentStatus' => $fitmentStatus,
        ]);
    }
}
