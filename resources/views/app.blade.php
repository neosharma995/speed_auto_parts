<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'SPEED AUTOS PARTS') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="shortcut icon" href="/favicon.ico">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <meta name="theme-color" content="#0B0B0E">

        <!-- Scripts & Styles -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead

        <style>
            .goog-te-banner-frame,
            iframe.goog-te-banner-frame,
            .skiptranslate,
            #goog-gt-tt,
            .goog-te-balloon-frame,
            .VIpgJd-ZVi9od-ORHb-OEVmcd,
            .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
            .VIpgJd-ZVi9od-l4eHX-hSRGPd {
                display: none !important;
                visibility: hidden !important;
            }
            body {
                top: 0px !important;
                position: static !important;
            }
            font {
                background-color: transparent !important;
                box-shadow: none !important;
            }
        </style>
    </head>
    <body class="site-wrap">
        <div id="google_translate_element" style="display:none !important;"></div>
        @inertia

        <script>
            window.googleTranslateElementInit = function () {
                if (window.google && window.google.translate) {
                    new window.google.translate.TranslateElement({
                        pageLanguage: 'en',
                        includedLanguages: 'en,ar,fr',
                        autoDisplay: false
                    }, 'google_translate_element');
                }
            };
        </script>
        <script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer></script>
    </body>
</html>
