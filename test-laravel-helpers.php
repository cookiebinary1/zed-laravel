<?php

/**
 * Test súbor pre Laravel helper funkcie
 * Tento súbor demonštruje všetky podporované Laravel helper funkcie
 * v Zed Laravel rozšírení
 */

// Config helper - mal by presmerovať na config/app.php
$appName = config('app.name');
$debugMode = config('app.debug');

// View helper - mal by presmerovať na resources/views/welcome.blade.php
return view('welcome');
return view('auth.login');

// Route helper - mal by presmerovať na routes/web.php
return redirect()->route('home');
return redirect()->route('dashboard');

// Asset helper - mal by presmerovať na public/css/app.css
echo asset('css/app.css');
echo asset('js/app.js');

// URL helper - mal by presmerovať na routes alebo public súbory
echo url('api/users');
echo url('css/style.css');

// Translation helper - mal by presmerovať na lang/en/messages.php
echo trans('messages.welcome');
echo trans('auth.failed');

// Environment helper - mal by presmerovať na .env súbor
$dbHost = env('DB_HOST');
$appEnv = env('APP_ENV');

// Kombinované použitie
$config = [
    'name' => config('app.name'),
    'url' => url('/'),
    'asset' => asset('favicon.ico'),
    'translation' => trans('messages.hello'),
    'environment' => env('APP_ENV')
];

// Route s parametrami
Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
Route::resource('posts', PostController::class);

// Blade template s helper funkciami
/*
@extends('layouts.app')

@section('content')
    <h1>{{ trans('messages.welcome') }}</h1>
    <img src="{{ asset('images/logo.png') }}" alt="{{ config('app.name') }}">
    <a href="{{ route('home') }}">{{ trans('nav.home') }}</a>
@endsection
*/
