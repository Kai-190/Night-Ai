<?php

return [
    'secret_key' => env('PAYMONGO_SECRET_KEY'),
    'webhook_secret' => env('PAYMONGO_WEBHOOK_SECRET'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    'mode' => env('PAYMONGO_MODE', 'test'),
];
