<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;

class CashfreeController extends Controller
{
    private $apiUrl;
    private $appId;
    private $secret;

    public function __construct()
    {
        $this->appId = env('CASHFREE_APP_ID');
        $this->secret = env('CASHFREE_SECRET');
        $this->apiUrl = env('CASHFREE_MODE', 'sandbox') === 'sandbox' 
            ? 'https://sandbox.cashfree.com/pg' 
            : 'https://api.cashfree.com/pg';
    }

    public function createOrder(Request $request)
    {
        try {
            \Log::info('Cashfree createOrder called', $request->all());

            $request->validate([
                'customer_name' => 'required|string',
                'phone' => 'required|string|digits:10',
                'items' => 'required|array',
                'items.*.menu_item_id' => 'required|exists:menu_items,id',
                'items.*.quantity' => 'required|integer|min:1'
            ]);

            $items = $request->items;
            $total = 0;
            foreach ($items as $item) {
                $menu = MenuItem::find($item['menu_item_id']);
                $total += $menu->price * $item['quantity'];
            }

            $order = Order::create([
                'customer_name' => $request->customer_name,
                'phone' => $request->phone,
                'total_amount' => $total,
                'status' => 'pending_payment'
            ]);

            foreach ($items as $item) {
                $menu = MenuItem::find($item['menu_item_id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menu->id,
                    'quantity' => $item['quantity'],
                    'price' => $menu->price
                ]);
            }

            $cfOrderId = 'ORDER_' . $order->id . '_' . time();
            $order->update(['payment_order_id' => $cfOrderId]);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-api-version' => '2022-09-01',
                'x-client-id' => $this->appId,
                'x-client-secret' => $this->secret,
            ])->post($this->apiUrl . '/orders', [
                'order_id' => $cfOrderId,
                'order_amount' => (float)$total,
                'order_currency' => 'INR',
                'customer_details' => [
                    'customer_id' => 'CUST_' . $order->id,
                    'customer_name' => $request->customer_name,
                    'customer_phone' => $request->phone,
                    'customer_email' => $request->customer_name . '@customer.com',
                ],
                'order_meta' => [
                    'return_url' => 'http://localhost:5173/payment-success',
                    'notify_url' => 'http://127.0.0.1:8000/api/cashfree/webhook',
                ],
            ]);

            $result = $response->json();

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'order_id' => $order->id,
                    'payment_session_id' => $result['payment_session_id'],
                    'order_token' => $result['order_token'],
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => $result['message'] ?? 'Failed to create order'
                ], 500);
            }

        } catch (\Exception $e) {
            \Log::error('Cashfree error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function verifyPayment(Request $request)
    {
        try {
            $orderId = $request->input('order_id');
            $order = Order::where('payment_order_id', $orderId)->first();

            if (!$order) {
                return response()->json(['success' => false, 'error' => 'Order not found'], 404);
            }

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-api-version' => '2022-09-01',
                'x-client-id' => $this->appId,
                'x-client-secret' => $this->secret,
            ])->get($this->apiUrl . '/orders/' . $orderId);

            $result = $response->json();

            if ($response->successful() && isset($result['order_status']) && $result['order_status'] === 'PAID') {
                $order->update(['status' => 'pending']);
                return response()->json(['success' => true, 'order_id' => $order->id]);
            }

            return response()->json(['success' => false, 'status' => $result['order_status'] ?? 'PENDING']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function webhook(Request $request)
    {
        $data = $request->all();
        \Log::info('Cashfree webhook', $data);

        if (isset($data['type']) && $data['type'] === 'PAYMENT_SUCCESS_WEBHOOK') {
            $order = Order::where('payment_order_id', $data['data']['order']['order_id'])->first();
            if ($order && $order->status === 'pending_payment') {
                $order->update(['status' => 'pending']);
            }
        }

        return response()->json(['status' => 'received'], 200);
    }
}