<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;

class OrderController extends Controller
{
    // GET all orders (Admin/Kitchen/Counter)
    public function index()
    {
        return Order::with('items.menuItem')
            ->orderByDesc('created_at')
            ->get();
    }

    // CREATE ORDER
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string',
            'phone' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        $items = $request->items;
        $total = 0;

        foreach ($items as $item) {
            $menu = MenuItem::find($item['menu_item_id']);
            $total += $menu->price * $item['quantity'];
        }

        // If status is provided (for quick items), use it, otherwise default to 'pending'
        $status = $request->input('status', 'pending');

        $order = Order::create([
            'customer_name' => $request->customer_name,
            'phone' => $request->phone,
            'total_amount' => $total,
            'status' => $status
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

        return response()->json($order->load('items'), 201);
    }

    // UPDATE order status (Kitchen/Counter)
    public function updateStatus(Request $request, int $id)
    {
        try {
            $order = Order::findOrFail($id);
            
            $request->validate([
                'status' => 'required|in:pending,cooking,ready,completed'
            ]);
            
            $order->update([
                'status' => $request->status
            ]);
            
            // TODO: Add SMS notification when status changes to 'ready'
            // if ($request->status === 'ready') {
            //     // SmsService::sendOrderReady($order->customer_name, $order->phone, $order->id);
            // }
            
            return response()->json([
                'success' => true,
                'order' => $order,
                'message' => 'Order status updated to ' . $request->status
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}