<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PayMongoWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $secret = config('paymongo.webhook_secret');
        $signatureHeader = $request->header('Paymongo-Signature');
        $payload = $request->getContent();

        if (! is_string($secret) || $secret === '' || ! is_string($signatureHeader) || ! $this->hasValidSignature($signatureHeader, $payload, $secret)) {
            Log::warning('Rejected PayMongo webhook with an invalid signature.');

            return response()->json(['message' => 'Invalid webhook signature.'], 400);
        }

        try {
            $event = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return response()->json(['message' => 'Invalid webhook payload.'], 400);
        }

        $eventType = data_get($event, 'data.attributes.type');
        $checkoutSessionId = data_get($event, 'data.attributes.data.id');
        if (! is_string($eventType) || ! is_string($checkoutSessionId)) {
            return response()->json(['message' => 'Invalid webhook payload.'], 400);
        }

        $newStatus = match ($eventType) {
            'checkout_session.payment.paid' => 'paid',
            'checkout_session.payment.failed' => 'failed',
            default => null,
        };

        if ($newStatus !== null) {
            $payment = Payment::query()
                ->where('checkout_session_id', $checkoutSessionId)
                ->first();

            if ($payment) {
                if ($payment->status !== 'paid' || $newStatus === 'paid') {
                    $payment->update(['status' => $newStatus]);
                }
            } else {
                Log::warning('PayMongo webhook did not match a stored checkout session.', [
                    'checkout_session_id' => $checkoutSessionId,
                    'event_type' => $eventType,
                ]);
            }
        }

        return response()->json(['received' => true]);
    }

    private function hasValidSignature(string $header, string $payload, string $secret): bool
    {
        $parts = [];
        foreach (explode(',', $header) as $component) {
            [$key, $value] = array_pad(explode('=', trim($component), 2), 2, null);
            if ($key !== null && $value !== null) {
                $parts[$key] = $value;
            }
        }

        $timestamp = $parts['t'] ?? null;
        $signature = config('paymongo.mode') === 'live'
            ? ($parts['li'] ?? null)
            : ($parts['te'] ?? null);

        if (! is_string($timestamp) || ! ctype_digit($timestamp) || ! is_string($signature)) {
            return false;
        }

        if (abs(time() - (int) $timestamp) > 300) {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

        return hash_equals($expected, $signature);
    }
}
