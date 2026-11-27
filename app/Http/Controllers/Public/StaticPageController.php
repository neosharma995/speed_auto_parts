<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\CmsPage;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class StaticPageController extends Controller
{
    public function categories(): Response
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Public/Categories', [
            'categories' => $categories,
        ]);
    }

    public function brands(): Response
    {
        $brands = Brand::query()
            ->where('is_active', true)
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return Inertia::render('Public/Brands', [
            'brands' => $brands,
        ]);
    }

    public function trackOrder(): Response
    {
        return Inertia::render('Public/TrackOrder');
    }

    public function trackOrderApi(Request $request): JsonResponse
    {
        $orderNumber = trim((string) $request->query('order_number'));

        if (empty($orderNumber)) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid order number.',
            ], 422);
        }

        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with(['items'])
            ->first();

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => "Order #{$orderNumber} was not found. Please verify the order number on your invoice.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => [
                'order_number' => $order->order_number,
                'status' => $order->delivery_status,
                'payment_status' => $order->payment_status,
                'delivery_status' => $order->delivery_status,
                'tracking_number' => $order->tracking_number,
                'tracking_url' => $order->tracking_url,
                'carrier' => $order->tracking_carrier,
                'total_amount' => $order->total_amount,
                'shipping_city' => $order->city,
                'shipping_state' => $order->state,
                'created_at' => $order->created_at->format('M d, Y h:i A'),
                'items_count' => $order->items->count(),
            ],
        ]);
    }

    protected function renderCmsPage(string $slug, string $fallbackTitle, string $fallbackSubtitle = '', string $fallbackContent = ''): Response
    {
        $page = Schema::hasTable('cms_pages')
            ? CmsPage::query()->where('slug', $slug)->first()
            : null;

        return Inertia::render('Public/StaticPage', [
            'slug' => $page?->slug ?? $slug,
            'title' => $page?->title ?? $fallbackTitle,
            'subtitle' => $page?->subtitle ?? $fallbackSubtitle,
            'content' => $page?->content ?? $fallbackContent,
            'translations' => $page?->translations ?? null,
            'sections' => $page?->sections ?? [],
        ]);
    }

    public function about(): Response
    {
        return $this->renderCmsPage('about-us', 'About SPEED AUTOS PARTS');
    }

    public function contact(): Response
    {
        return $this->renderCmsPage('contact-us', 'Contact Engineering Support');
    }

    public function shippingPolicy(): Response
    {
        return $this->renderCmsPage('shipping-policy', 'Shipping & Dispatch Policy');
    }

    public function returnPolicy(): Response
    {
        return $this->renderCmsPage('return-policy', 'Return & Refund Policy');
    }

    public function privacyPolicy(): Response
    {
        return $this->renderCmsPage('privacy-policy', 'Privacy Policy');
    }

    public function terms(): Response
    {
        return $this->renderCmsPage('terms-and-conditions', 'Terms & Conditions');
    }

    public function helpCenter(): Response
    {
        return $this->renderCmsPage('help-center', 'Help Center');
    }

    public function faqs(): Response
    {
        return $this->renderCmsPage('faqs', 'Frequently Asked Questions (FAQs)');
    }

    public function notFound(): \Symfony\Component\HttpFoundation\Response
    {
        return Inertia::render('Public/NotFound')->toResponse(request())->setStatusCode(404);
    }
}
