<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PayMongoCheckoutController extends Controller
{
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'decimal:0,2', 'min:20', 'max:100000'],
            'description' => ['required', 'string', 'min:3', 'max:120'],
        ]);

        $secretKey = config('paymongo.secret_key');
        if (! is_string($secretKey) || $secretKey === '') {
            Log::error('PayMongo secret key is not configured.');

            return response()->json([
                'message' => 'Payments are not configured yet. Please contact the site owner.',
            ], 503);
        }

        $reference = (string) Str::uuid();
        $amountInCentavos = (int) round(((float) $validated['amount']) * 100);
        $frontendUrl = rtrim((string) config('paymongo.frontend_url'), '/');
        if ($frontendUrl === '') {
            Log::error('PayMongo frontend URL is not configured.');

            return response()->json([
                'message' => 'Payments are not configured yet. Please contact the site owner.',
            ], 503);
        }

        try {
            $providerResponse = Http::withBasicAuth($secretKey, '')
                ->acceptJson()
                ->timeout(20)
                ->post('https://api.paymongo.com/v1/checkout_sessions', [
                    'data' => [
                        'attributes' => [
                            'cancel_url' => $frontendUrl.'/?payment_result=cancelled',
                            'description' => $validated['description'],
                            'line_items' => [[
                                'amount' => $amountInCentavos,
                                'currency' => 'PHP',
                                'name' => $validated['description'],
                                'quantity' => 1,
                            ]],
                            'metadata' => ['reference' => $reference],
                            'payment_method_types' => ['gcash'],
                            'reference_number' => $reference,
                            'success_url' => $frontendUrl.'/?payment_reference='.$reference,
                        ],
                    ],
                ]);
        } catch (\Throwable $exception) {
            Log::error('PayMongo checkout request failed.', [
                'reference' => $reference,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Could not connect to PayMongo. Please try again.',
            ], 502);
        }

        if (! $providerResponse->successful()) {
            Log::error('PayMongo rejected the checkout request.', [
                'reference' => $reference,
                'status' => $providerResponse->status(),
                'response' => $providerResponse->json(),
            ]);

            return response()->json([
                'message' => 'PayMongo could not start checkout. Please check the merchant account setup.',
            ], 502);
        }

        $session = $providerResponse->json('data');
        $checkoutUrl = data_get($session, 'attributes.checkout_url');
        $checkoutSessionId = data_get($session, 'id');
        if (! is_string($checkoutUrl) || ! str_starts_with($checkoutUrl, 'https://') || ! is_string($checkoutSessionId)) {
            Log::error('PayMongo returned an invalid checkout session.', ['reference' => $reference]);

            return response()->json([
                'message' => 'PayMongo returned an invalid checkout session. Please try again.',
            ], 502);
        }

        try {
            Payment::create([
                'reference' => $reference,
                'description' => $validated['description'],
                'amount' => $amountInCentavos,
                'currency' => 'PHP',
                'status' => 'pending',
                'checkout_session_id' => $checkoutSessionId,
            ]);
        } catch (\Throwable $exception) {
            Log::error('Could not save the PayMongo checkout session.', [
                'reference' => $reference,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Could not save the payment. Please contact the site owner.',
            ], 500);
        }

        return response()->json([
            'checkout_url' => $checkoutUrl,
            'reference' => $reference,
        ], 201);
    }

    public function show(string $reference): JsonResponse
    {
        if (! Str::isUuid($reference)) {
            throw ValidationException::withMessages([
                'reference' => 'The payment reference is invalid.',
            ]);
        }

        $payment = Payment::query()->where('reference', $reference)->first();
        if (! $payment) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        return response()->json([
            'reference' => $payment->reference,
            'status' => $payment->status,
        ]);
    }
}
