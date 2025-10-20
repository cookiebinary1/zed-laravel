<?php

/**
 * Test súbor pre overenie inštalácie Zed Laravel Extension
 * 
 * Inštrukcie:
 * 1. Otvorte tento súbor v Zed editore
 * 2. Skúste Ctrl+Click na každú helper funkciu
 * 3. Malo by vás to presmerovať na príslušný súbor
 */

// Test config helper - mal by presmerovať na config/app.php
$appName = config('app.name');
$debugMode = config('app.debug');

// Test view helper - mal by presmerovať na resources/views/welcome.blade.php
return view('welcome');

// Test route helper - mal by presmerovať na routes/web.php
return redirect()->route('home');

// Test asset helper - mal by presmerovať na public/css/app.css
echo asset('css/app.css');

// Test url helper - mal by presmerovať na routes alebo public súbory
echo url('api/users');

// Test translation helper - mal by presmerovať na lang/en/messages.php
echo trans('messages.welcome');

// Test environment helper - mal by presmerovať na .env súbor
$dbHost = env('DB_HOST');

// Test s rôznymi Laravel helper funkciami
$configs = [
    'app.name' => config('app.name'),
    'database.default' => config('database.default'),
    'cache.default' => config('cache.default'),
];

$views = [
    'welcome' => view('welcome'),
    'auth.login' => view('auth.login'),
    'layouts.app' => view('layouts.app'),
];

$routes = [
    'home' => route('home'),
    'login' => route('login'),
    'dashboard' => route('dashboard'),
];

// Test s Blade syntax (ak je súbor .blade.php)
/*
@extends('layouts.app')

@section('content')
    <h1>{{ trans('messages.welcome') }}</h1>
    <img src="{{ asset('images/logo.png') }}" alt="{{ config('app.name') }}">
    <a href="{{ route('home') }}">{{ trans('nav.home') }}</a>
@endsection
*/
