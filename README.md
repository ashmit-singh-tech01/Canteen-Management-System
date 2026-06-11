# 🍔 Canteen Management System

A full-stack canteen management system for colleges and universities. Students can browse the menu, add items to cart, and place orders online. Kitchen staff can view and process orders, while counter staff can manage both online order pickups and cash walk-in customers.

## ✨ Features

### 👨‍💻 Customer
- Browse menu with categories
- Add items to cart with quantity controls
- 5% GST calculation
- Phone number validation (10 digits, starts with 6-9)
- Place orders with mock payment

### 🧑‍🍳 Kitchen
- View pending orders
- Update order status: pending → cooking → ready

### 🛒 Counter
- Process online order pickups
- Cash counter for walk-in customers
- Full menu access for counter billing
- Quick items (tea, coffee, samosa) skip kitchen flow
- Complete orders instantly

### 👑 Admin
- Add new menu items
- Edit existing items
- Delete items
- Toggle availability

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Laravel 11 (REST API) |
| Database | MySQL |
| Payment | Mock payment (Cashfree ready) |

## 🚀 Installation

### Prerequisites
- PHP 8.1+
- Composer
- Node.js 18+
- MySQL (XAMPP recommended)

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
