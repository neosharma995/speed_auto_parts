<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SubscriberController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $query = NewsletterSubscriber::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($status = trim((string) $request->query('status', ''))) {
            $query->where('status', $status);
        }

        $subscribers = $query->latest('id')->paginate(10)->withQueryString();

        return Inertia::render('Admin/Subscribers/Index', [
            'subscribers' => $subscribers,
            'filters' => (object) $request->only(['search', 'status']),
            'stats' => [
                'total' => NewsletterSubscriber::count(),
                'subscribed' => NewsletterSubscriber::where('status', 'subscribed')->count(),
                'unsubscribed' => NewsletterSubscriber::where('status', 'unsubscribed')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'in:subscribed,unsubscribed'],
        ]);

        $email = strtolower(trim($validated['email']));
        $status = $validated['status'] ?? 'subscribed';

        NewsletterSubscriber::updateOrCreate(
            ['email' => $email],
            [
                'name' => $validated['name'] ?? null,
                'status' => $status,
                'source' => 'admin',
                'subscribed_at' => $status === 'subscribed' ? now() : null,
                'unsubscribed_at' => $status === 'unsubscribed' ? now() : null,
            ]
        );

        return back()->with('success', "Subscriber '{$email}' saved.");
    }

    public function toggleStatus(NewsletterSubscriber $subscriber): RedirectResponse
    {
        $nextStatus = $subscriber->status === 'subscribed' ? 'unsubscribed' : 'subscribed';

        $subscriber->update([
            'status' => $nextStatus,
            'subscribed_at' => $nextStatus === 'subscribed' ? now() : $subscriber->subscribed_at,
            'unsubscribed_at' => $nextStatus === 'unsubscribed' ? now() : null,
        ]);

        return back()->with('success', "Subscriber '{$subscriber->email}' marked as {$nextStatus}.");
    }

    public function export(Request $request): Response
    {
        $query = NewsletterSubscriber::query();
        if ($status = trim((string) $request->query('status', ''))) {
            $query->where('status', $status);
        }

        $rows = $query->latest('id')->get();
        $lines = ['email,name,status,source,subscribed_at'];
        foreach ($rows as $row) {
            $lines[] = implode(',', [
                '"' . str_replace('"', '""', (string) $row->email) . '"',
                '"' . str_replace('"', '""', (string) ($row->name ?? '')) . '"',
                $row->status,
                $row->source,
                $row->subscribed_at ? $row->subscribed_at->toDateTimeString() : '',
            ]);
        }

        return response(implode("\n", $lines) . "\n", 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="newsletter-subscribers.csv"',
        ]);
    }

    public function destroy(NewsletterSubscriber $subscriber): RedirectResponse
    {
        $email = $subscriber->email;
        $subscriber->delete();

        return back()->with('success', "Subscriber '{$email}' deleted.");
    }
}
