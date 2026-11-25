<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RegionalPricingRule;
use App\Models\Setting;
use App\Models\TaxClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(Request $request): Response
    {
        $settingsList = Setting::all()->pluck('value', 'key')->toArray();
        $taxClasses = TaxClass::query()
            ->with(['rates'])
            ->withCount('products')
            ->get();

        $regionalRules = Schema::hasTable('regional_pricing_rules')
            ? RegionalPricingRule::orderByDesc('is_default')->orderBy('country_name')->get()
            : collect();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settingsList,
            'taxClasses' => $taxClasses,
            'regionalRules' => $regionalRules,
            'initialTab' => $request->query('tab', 'store'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $inputs = $request->except(['_token']);

        foreach ($inputs as $key => $value) {
            Setting::set($key, $value);
        }

        return back()->with('success', 'Store configuration settings saved.');
    }
}
