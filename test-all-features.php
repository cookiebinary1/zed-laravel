<?php

/**
 * Kompletný test súbor pre všetky Laravel funkcionality v Zed rozšírení
 * 
 * Inštrukcie:
 * 1. Otvorte tento súbor v Zed editore
 * 2. Skúste Ctrl+Click na každú funkciu/helper
 * 3. Hover over helper funkcie pre tooltip
 */

// ========================================
// LARAVEL HELPER FUNKCIE
// ========================================

// Config helpers
$appName = config('app.name');
$debugMode = config('app.debug');
$dbConnection = config('database.default');

// View helpers
return view('welcome');
return view('auth.login');
return view('layouts.app');

// Route helpers
return redirect()->route('home');
return redirect()->route('dashboard');
return redirect()->route('profile.edit');

// Asset helpers
echo asset('css/app.css');
echo asset('js/app.js');
echo asset('images/logo.png');

// URL helpers
echo url('/');
echo url('api/users');
echo url('admin/dashboard');

// Translation helpers
echo trans('messages.welcome');
echo trans('auth.failed');
echo __('messages.hello'); // alias pre trans()

// Environment helpers
$dbHost = env('DB_HOST');
$appEnv = env('APP_ENV');
$mailDriver = env('MAIL_MAILER');

// Old helpers (form data)
$oldEmail = old('email');
$oldName = old('name');

// Session helpers
$userId = session('user_id');
$cartItems = session('cart');

// Cache helpers
$cachedData = cache('key');
$userCache = cache('user_' . $userId);

// Path helpers
$storagePath = storage_path('app/uploads');
$publicPath = public_path('css/style.css');
$basePath = base_path('composer.json');
$appPath = app_path('Models/User.php');
$databasePath = database_path('migrations');
$resourcePath = resource_path('views/welcome.blade.php');

// ========================================
// LARAVEL FACADES
// ========================================

// Auth facade
Auth::user();
Auth::check();
Auth::login($user);
Auth::logout();

// Cache facade
Cache::get('key');
Cache::put('key', 'value', 3600);
Cache::forget('key');

// DB facade
DB::table('users')->get();
DB::select('SELECT * FROM users');
DB::insert('INSERT INTO users ...');

// Storage facade
Storage::disk('local')->put('file.txt', 'content');
Storage::get('file.txt');
Storage::delete('file.txt');

// Mail facade
Mail::to('user@example.com')->send(new WelcomeEmail());
Mail::queue(new WelcomeEmail());

// Log facade
Log::info('User logged in');
Log::error('Something went wrong');
Log::debug('Debug information');

// Validator facade
Validator::make($data, $rules);
Validator::validate($data, $rules);

// Hash facade
Hash::make('password');
Hash::check('password', $hashedPassword);

// Password facade
Password::sendResetLink($request->only('email'));
Password::reset($credentials, function($user, $password) {
    // Reset password logic
});

// ========================================
// DATABASE & MIGRATIONS
// ========================================

// Schema facade
Schema::create('users', function($table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->rememberToken();
    $table->timestamps();
});

Schema::table('users', function($table) {
    $table->string('phone')->nullable();
});

Schema::drop('users');

// Blueprint methods
Schema::create('posts', function($table) {
    $table->bigIncrements('id');
    $table->string('title');
    $table->text('content');
    $table->unsignedBigInteger('user_id');
    $table->foreign('user_id')->references('id')->on('users');
    $table->boolean('published')->default(false);
    $table->timestamps();
});

// ========================================
// VALIDATION RULES
// ========================================

$request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|email|unique:users',
    'password' => 'required|min:8|confirmed',
    'age' => 'required|integer|min:18|max:100',
    'website' => 'nullable|url',
    'avatar' => 'nullable|image|max:2048'
]);

// Custom validation rules
$request->validate([
    'username' => ['required', new UniqueUsernameRule()],
    'phone' => ['required', new ValidPhoneRule()],
]);

// ========================================
// BLADE TEMPLATE EXAMPLES (komentované)
// ========================================

/*
<!-- Blade komponenty -->
<x-button type="submit">Save</x-button>
<x-form.input name="email" type="email" />
<x-alert type="success" message="User created successfully!" />

<!-- Blade directives -->
@if($user->isAdmin())
    <p>Admin panel</p>
@endif

@foreach($users as $user)
    <p>{{ $user->name }}</p>
@endforeach

<!-- Blade helpers v template -->
<h1>{{ trans('messages.welcome') }}</h1>
<img src="{{ asset('images/logo.png') }}" alt="{{ config('app.name') }}">
<a href="{{ route('home') }}">{{ __('nav.home') }}</a>

<!-- Form helpers -->
<input type="email" name="email" value="{{ old('email') }}">
@error('email')
    <span class="error">{{ $message }}</span>
@enderror

<!-- Session helpers -->
@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif
*/

// ========================================
// SERVICE PROVIDERS & BINDINGS
// ========================================

// V service provider:
$this->app->bind(UserRepositoryInterface::class, UserRepository::class);
$this->app->singleton(PaymentService::class, function($app) {
    return new PaymentService($app->make('config'));
});
$this->app->bindIf(LoggerInterface::class, FileLogger::class);

// Service container usage
$userRepo = app(UserRepositoryInterface::class);
$paymentService = app(PaymentService::class);

// ========================================
// EVENTS & LISTENERS
// ========================================

// Event firing
event(new UserRegistered($user));
event(new OrderPlaced($order));
Event::dispatch(new UserLogin($user));

// Event listening
Event::listen(UserRegistered::class, function($event) {
    // Send welcome email
});
Event::listen(OrderPlaced::class, SendOrderConfirmation::class);

// Event listeners
class SendWelcomeEmail implements ShouldQueue
{
    public function handle(UserRegistered $event)
    {
        // Send welcome email
    }
}

// ========================================
// QUEUES & JOBS
// ========================================

// Job dispatching
dispatch(new SendWelcomeEmail($user));
dispatch(new ProcessPayment($payment));
dispatch(ProcessPodcast::dispatch($podcast)->delay(now()->addMinutes(10)));

// Queue facade
Queue::push(new SendWelcomeEmail($user));
Queue::pushOn('high', new ProcessPayment($payment));

// Job classes
class SendWelcomeEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public function handle()
    {
        // Send email logic
    }
}

class ProcessPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public function handle()
    {
        // Process payment logic
    }
}

// ========================================
// COLLECTIONS & HELPERS
// ========================================

$users = collect([
    ['name' => 'John', 'age' => 30],
    ['name' => 'Jane', 'age' => 25]
]);

$filtered = $users->where('age', '>', 25);
$names = $users->pluck('name');

// ========================================
// TESTING HELPERS
// ========================================

// V testoch:
$this->actingAs($user);
$this->assertDatabaseHas('users', ['email' => 'test@example.com']);
$this->assertSessionHas('success');
$this->assertRedirect(route('dashboard'));
