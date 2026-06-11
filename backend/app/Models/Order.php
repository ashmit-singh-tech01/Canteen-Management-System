<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
    'customer_name',
    'phone',
    'total_amount', 
    'status',
    'payment_order_id'  // Add this
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}