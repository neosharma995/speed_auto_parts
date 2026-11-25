<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        $reviews = ProductReview::query()
            ->with(['product', 'user'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
        ]);
    }

    public function toggleApprove(ProductReview $review): RedirectResponse
    {
        $review->update([
            'is_approved' => !$review->is_approved,
        ]);

        $status = $review->is_approved ? 'approved' : 'hidden';

        return back()->with('success', "Review #{$review->id} has been {$status}.");
    }

    public function destroy(ProductReview $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'Review deleted successfully.');
    }
}
