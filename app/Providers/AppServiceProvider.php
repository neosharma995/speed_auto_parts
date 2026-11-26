<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Mail\MailManager;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mailer\Transport\Smtp\Stream\SocketStream;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->configureWindowsSslCaBundle();
    }

    protected function configureWindowsSslCaBundle(): void
    {
        if (PHP_OS_FAMILY !== 'Windows') {
            return;
        }

        $candidates = array_filter([
            storage_path('certs/windows-ca-bundle.pem'),
            (string) env('SSL_CERT_FILE', ''),
            (string) ini_get('openssl.cafile'),
            dirname(PHP_BINARY) . DIRECTORY_SEPARATOR . 'extras' . DIRECTORY_SEPARATOR . 'ssl' . DIRECTORY_SEPARATOR . 'cacert.pem',
            'D:\\XAMPP\\php\\extras\\ssl\\cacert.pem',
            'C:\\xampp\\php\\extras\\ssl\\cacert.pem',
            'D:\\XAMPP\\apache\\bin\\curl-ca-bundle.crt',
            base_path('vendor/stripe/stripe-php/data/ca-certificates.crt'),
        ]);

        $caFile = null;
        foreach ($candidates as $path) {
            if (is_file($path)) {
                $caFile = $path;
                break;
            }
        }

        if (! $caFile) {
            return;
        }

        stream_context_set_default([
            'ssl' => [
                'cafile' => $caFile,
                'verify_peer' => true,
                'verify_peer_name' => true,
            ],
        ]);

        $this->app->afterResolving('mail.manager', function (MailManager $manager) use ($caFile): void {
            try {
                $mailer = $manager->mailer('smtp');
                $transport = $mailer->getSymfonyTransport();
                if ($transport instanceof EsmtpTransport) {
                    $stream = $transport->getStream();
                    if ($stream instanceof SocketStream) {
                        $stream->setStreamOptions([
                            'ssl' => [
                                'cafile' => $caFile,
                                'verify_peer' => true,
                                'verify_peer_name' => true,
                            ],
                        ]);
                    }
                }
            } catch (\Throwable) {
                // Ignore if SMTP mailer is not configured
            }
        });
    }
}
