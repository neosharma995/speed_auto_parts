<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(): Response
    {
        return $this->view();
    }

    public function view(): Response
    {
        return Inertia::render('Public/Cart');
    }

    public function get(Request $request): JsonResponse
    {
        $cart = $request->session()->get('cart', []);

        return response()->json([
            'success' => true,
            'cart' => is_array($cart) ? $cart : [],
            'count' => is_array($cart) ? array_sum(array_column($cart, 'quantity')) : 0,
            'sessionId' => $request->session()->getId(),
        ]);
    }

    public function sync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cart' => ['present', 'array'],
            'cart.*.id' => ['required', 'string'],
            'cart.*.productId' => ['required'],
            'cart.*.name' => ['required', 'string'],
            'cart.*.price' => ['required', 'numeric'],
            'cart.*.quantity' => ['required', 'integer', 'min:1'],
            'cart.*.image' => ['nullable', 'string'],
            'cart.*.slug' => ['nullable', 'string'],
            'cart.*.sku' => ['nullable', 'string'],
            'cart.*.partNumber' => ['nullable', 'string'],
            'cart.*.variationId' => ['nullable'],
            'cart.*.variationLabel' => ['nullable', 'string'],
        ]);

        $cart = $validated['cart'];
        $request->session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'cart' => $cart,
            'count' => array_sum(array_column($cart, 'quantity')),
            'sessionId' => $request->session()->getId(),
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'productId' => ['required', 'exists:products,id'],
            'variationId' => ['nullable', 'exists:product_variations,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($validated['productId']);
        $quantity = (int) ($validated['quantity'] ?? 1);
        $variation = !empty($validated['variationId']) ? ProductVariation::find($validated['variationId']) : null;

        $price = $variation ? (float) ($variation->sale_price ?: $variation->price) : (float) ($product->sale_price ?: $product->base_price);
        $itemId = $variation ? "p{$product->id}_v{$variation->id}" : "p{$product->id}";

        $cart = $request->session()->get('cart', []);
        $found = false;

        foreach ($cart as &$item) {
            if ($item['id'] === $itemId) {
                $item['quantity'] += $quantity;
                $found = true;
                break;
            }
        }
        unset($item);

        if (!$found) {
            $cart[] = [
                'id' => $itemId,
                'productId' => $product->id,
                'variationId' => $variation?->id,
                'name' => $product->name,
                'variationLabel' => $variation?->name,
                'sku' => $variation?->sku ?: $product->sku,
                'partNumber' => $variation?->part_number ?: $product->part_number,
                'price' => $price,
                'quantity' => $quantity,
                'image' => $variation?->image ?: $product->main_image ?: '/images/products/placeholder.jpg',
                'slug' => $product->slug,
            ];
        }

        $request->session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'cart' => $cart,
            'count' => array_sum(array_column($cart, 'quantity')),
            'message' => "{$product->name} added to cart.",
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'string'],
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $cart = $request->session()->get('cart', []);
        $qty = (int) $validated['quantity'];

        if ($qty <= 0) {
            $cart = array_values(array_filter($cart, fn ($i) => $i['id'] !== $validated['id']));
        } else {
            foreach ($cart as &$item) {
                if ($item['id'] === $validated['id']) {
                    $item['quantity'] = $qty;
                    break;
                }
            }
            unset($item);
        }

        $request->session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'cart' => $cart,
            'count' => array_sum(array_column($cart, 'quantity')),
        ]);
    }

    public function remove(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'string'],
        ]);

        $cart = $request->session()->get('cart', []);
        $cart = array_values(array_filter($cart, fn ($i) => $i['id'] !== $validated['id']));

        $request->session()->put('cart', $cart);

        return response()->json([
            'success' => true,
            'cart' => $cart,
            'count' => array_sum(array_column($cart, 'quantity')),
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $request->session()->forget('cart');

        return response()->json([
            'success' => true,
            'cart' => [],
            'count' => 0,
        ]);
    }
}
