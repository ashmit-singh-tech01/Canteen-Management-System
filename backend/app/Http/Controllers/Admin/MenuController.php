<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MenuItem;

class MenuController extends Controller
{
    public function index()
    {
        return MenuItem::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'price' => 'required'
        ]);

        $menu = MenuItem::create([
            'name' => $request->name,
            'price' => $request->price,
            'image' => $request->image,
            'availability' => true
        ]);

        return response()->json($menu);
    }

    public function update(Request $request, $id)
    {
        $menu = MenuItem::findOrFail($id);
        $menu->update($request->all());

        return response()->json($menu);
    }

    public function destroy($id)
    {
        MenuItem::destroy($id);

        return response()->json(['message' => 'Deleted']);
    }
}