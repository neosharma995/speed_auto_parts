<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settingsList = Setting::all()->pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settingsList,
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
