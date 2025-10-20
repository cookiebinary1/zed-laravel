# Inštalačný návod pre Zed Laravel Extension

## Rýchla inštalácia

### 1. Nainštalujte Intelephense

```bash
# Globálne cez npm (odporúčané)
npm install -g intelephense

# Alebo lokálne v Laravel projekte
cd /path/to/your/laravel/project
npm install intelephense
```

### 2. Skompilujte rozšírenie

```bash
cd /path/to/zed-laravel
cargo build --release
```

### 3. Nainštalujte rozšírenie do Zed

```bash
# Vytvorte extensions priečinok (ak neexistuje)
mkdir -p ~/.config/zed/extensions/

# Skopírujte zed_laravel.wasm do Zed extensions priečinka
cp target/wasm32-wasip2/release/zed_laravel.wasm ~/.config/zed/extensions/
```

### 4. Reštartujte Zed editor

Zatvorte a znovu otvorte Zed editor.

## Overenie inštalácie

1. Otvorte Laravel projekt v Zed editore
2. Otvorte PHP súbor s Laravel helper funkciami
3. Skúste Ctrl+Click na `config('app.name')` - mal by vás presmerovať na `config/app.php`

## Riešenie problémov

### Chyba: "intelephense not found"

**Riešenie:**
```bash
# Skontrolujte, či je Intelephense nainštalovaný
intelephense --version

# Ak nie je, nainštalujte ho
npm install -g intelephense

# Pridajte do PATH (ak je potrebné)
export PATH="$PATH:$(npm config get prefix)/bin"
```

### Chyba: "operation not supported on this platform"

**Riešenie:**
1. Skontrolujte, či je rozšírenie správne nainštalované
2. Reštartujte Zed editor
3. Skontrolujte, či je Intelephense správne nainštalovaný
4. Skontrolujte logy v Zed editore pre podrobnejšie informácie

### Laravel helper funkcie nefungujú

**Riešenie:**
1. Skontrolujte, či je projekt rozpoznaný ako Laravel projekt
2. Skontrolujte, či sú súbory v štandardných Laravel priečinkoch:
   - `config/` pre config helper
   - `resources/views/` pre view helper
   - `routes/` pre route helper
   - `public/` pre asset helper
   - `lang/` pre trans helper

## Testovanie funkcionality

Vytvorte test súbor `test.php` v Laravel projekte:

```php
<?php

// Test config helper
$appName = config('app.name');

// Test view helper
return view('welcome');

// Test route helper
return redirect()->route('home');

// Test asset helper
echo asset('css/app.css');

// Test url helper
echo url('api/users');

// Test trans helper
echo trans('messages.welcome');

// Test env helper
$dbHost = env('DB_HOST');
```

Skúste Ctrl+Click na každú helper funkciu - mal by vás presmerovať na príslušný súbor.

## Podpora

Ak máte problémy:
1. Skontrolujte [README.md](README.md) pre podrobnejšie informácie
2. Otvorte issue na GitHub
3. Skontrolujte logy v Zed editore (View > Developer > Show Logs)
