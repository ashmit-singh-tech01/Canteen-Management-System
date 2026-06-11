<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;

class PaymentController extends Controller
{
    public function createOrder(Request $request)
    {
        try {
            Log::info('Payment createOrder called', $request->all());

            // Validate request
            $request->validate([
                'customer_name' => 'required|string',
                'phone' => 'required|string',
                'items' => 'required|array',
                'items.*.menu_item_id' => 'required|exists:menu_items,id',
                'items.*.quantity' => 'required|integer|min:1'
            ]);

            // Calculate total
            $items = $request->items;
            $total = 0;
            foreach ($items as $item) {
                $menu = MenuItem::find($item['menu_item_id']);
                if (!$menu) {
                    return response()->json(['success' => false, 'error' => 'Menu item not found'], 404);
                }
                $total += $menu->price * $item['quantity'];
            }

            // Create order
            $order = Order::create([
                'customer_name' => $request->customer_name,
                'phone' => $request->phone,
                'total_amount' => $total,
                'status' => 'pending'
            ]);

            // Create order items
            foreach ($items as $item) {
                $menu = MenuItem::find($item['menu_item_id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menu->id,
                    'quantity' => $item['quantity'],
                    'price' => $menu->price
                ]);
            }

            // Generate payment order ID
            $paymentOrderId = 'PAY_' . $order->id . '_' . time();
            $order->update(['payment_order_id' => $paymentOrderId]);

            Log::info('Order created successfully', ['order_id' => $order->id]);

            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'payment_order_id' => $paymentOrderId,
                'message' => 'Order created successfully!'
            ]);

        } catch (\Exception $e) {
            Log::error('Payment error: ' . $e->getMessage());
            return response()->json([
                'success' => false, 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function callback(Request $request)
    {
        Log::info('Payment callback received', $request->all());
        
        $orderId = $request->input('order_id');
        $order = Order::find($orderId);

        if ($order) {
            return redirect('http://localhost:5173/payment-success?order_id=' . $order->id);
        }

        return redirect('http://localhost:5173/payment-failed');
    }
}