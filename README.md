# Zed Laravel Extension

Rozšírenie pre [Zed editor](https://zed.dev) ktoré poskytuje podporu pre Laravel framework v PHP projektoch.

## Funkcie

### 🎯 Go to Definition pre Laravel Helper funkcie

Rozšírenie poskytuje inteligentnú navigáciu pre najčastejšie používané Laravel helper funkcie:

- **`config('key')`** - presmeruje na konfiguračné súbory v `config/` priečinku
- **`view('name')`** - presmeruje na Blade/PHP view súbory v `resources/views/`
- **`route('name')`** - presmeruje na route definície v `routes/` súboroch
- **`asset('path')`** - presmeruje na statické súbory v `public/` priečinku
- **`url('path')`** - presmeruje na routes alebo statické súbory
- **`trans('key')`** - presmeruje na prekladové súbory v `lang/` priečinku
- **`env('key')`** - presmeruje na environment premenné v `.env` súbore

### 🔧 Integrácia s PHP Language Serverom

- Používa **Intelephense** language server pre základnú PHP podporu
- Rozšírená funkcionalita špecificky pre Laravel projekty cez custom LSP proxy
- Plná podpora pre PHP syntax highlighting, autocomplete a error detection

## Inštalácia

### Požiadavky

- [Zed editor](https://zed.dev) (najnovšia verzia)
- Node.js (pre LSP proxy)
- Rust toolchain (pre kompiláciu rozšírenia)
- Intelephense (inštalovaný cez npm alebo dostupný v node_modules)

### Kroky inštalácie

1. **Klonujte repozitár:**
   ```bash
   git clone https://github.com/yourusername/zed-laravel.git
   cd zed-laravel
   ```

2. **Skompilujte rozšírenie:**
   ```bash
   cargo build --release
   ```

3. **Nainštalujte rozšírenie do Zed:**
   ```bash
   # Vytvorte extensions priečinok (ak neexistuje)
   mkdir -p ~/.config/zed/extensions/
   
   # Skopírujte zed_laravel.wasm súbor do Zed extensions priečinka
   cp target/wasm32-wasip2/release/zed_laravel.wasm ~/.config/zed/extensions/
   ```

4. **Nainštalujte Intelephense (ak nie je nainštalovaný):**
   ```bash
   # Globálne cez npm
   npm install -g intelephense
   
   # Alebo lokálne v projekte
   npm install intelephense
   ```

5. **Reštartujte Zed editor**

## Použitie

Po inštalácii rozšírenia:

1. **Otvoríte Laravel projekt** v Zed editore
2. **Rozšírenie sa automaticky aktivuje** pre PHP súbory
3. **Intelephense sa použije** ako language server s rozšírenou Laravel funkcionalitou
4. **Používajte Ctrl+Click** (alebo Cmd+Click na macOS) na Laravel helper funkcie pre navigáciu

### Príklady použitia

```php
// Config helper - presmeruje na config/app.php
$appName = config('app.name');

// View helper - presmeruje na resources/views/welcome.blade.php
return view('welcome');

// Route helper - presmeruje na routes/web.php
return redirect()->route('home');

// Asset helper - presmeruje na public/css/app.css
echo asset('css/app.css');

// URL helper - presmeruje na routes alebo public súbory
echo url('api/users');

// Translation helper - presmeruje na lang/en/messages.php
echo trans('messages.welcome');

// Environment helper - presmeruje na .env súbor
$dbHost = env('DB_HOST');
```

## Podporované Laravel Helper funkcie

| Helper funkcia | Popis | Príklad |
|----------------|-------|---------|
| `config()` | Navigácia na konfiguračné súbory | `config('app.name')` |
| `view()` | Navigácia na Blade/PHP views | `view('welcome')` |
| `route()` | Navigácia na route definície | `route('home')` |
| `asset()` | Navigácia na statické súbory | `asset('css/app.css')` |
| `url()` | Navigácia na routes alebo súbory | `url('api/users')` |
| `trans()` | Navigácia na prekladové súbory | `trans('messages.welcome')` |
| `env()` | Navigácia na environment premenné | `env('DB_HOST')` |

## Architektúra

Rozšírenie pozostáva z dvoch hlavných častí:

### Rust Extension (`src/lib.rs`)
- Hlavný kód rozšírenia pre Zed editor
- Spravuje konfiguráciu Intelephense language servera
- Komunikuje s LSP proxy

### Node.js LSP Proxy (`lsp-proxy/proxy.js`)
- Sprostredkuje komunikáciu medzi Zed a Intelephense
- Rozširuje LSP funkcionalitu o Laravel-specifické features
- Implementuje custom resolvery pre Laravel helper funkcie

## Vývoj

### Lokálny vývoj

1. **Klonujte repozitár:**
   ```bash
   git clone https://github.com/yourusername/zed-laravel.git
   cd zed-laravel
   ```

2. **Nainštalujte závislosti:**
   ```bash
   # Rust závislosti sa nainštalujú automaticky pri cargo build
   cargo build
   ```

3. **Testovanie:**
   ```bash
   # Skontrolujte syntax
   cargo check
   
   # Testujte Node.js proxy
   cd lsp-proxy
   node --check proxy.js
   ```

### Pridávanie nových Laravel Helper funkcií

Pre pridanie podpory nového Laravel helper:

1. **Rozšírte regex pattern** v `handleDefinition()` funkcii
2. **Implementujte resolver funkciu** v `LSPProxy` triede
3. **Pridajte error handling** a dokumentáciu

Príklad:
```javascript
// V handleDefinition()
const newHelperMatch = line.match(/newHelper\s*\(\s*['"]([^'"]+)['"]\s*\)/);
if (newHelperMatch) {
  return this.resolveNewHelper(newHelperMatch[1]);
}

// Nová resolver funkcia
resolveNewHelper(param) {
  try {
    // Implementácia logiky
    return result;
  } catch (error) {
    console.error("Error resolving newHelper:", error);
    return null;
  }
}
```

## Riešenie problémov

### Intelephense sa nenájde
- Skontrolujte, či máte nainštalovaný Intelephense
- Skontrolujte, či je Intelephense v PATH alebo v node_modules
- Skontrolujte logy v Zed editore

### Laravel helper funkcie nefungujú
- Skontrolujte, či je projekt správne rozpoznaný ako Laravel projekt
- Skontrolujte, či sú súbory v štandardných Laravel priečinkoch
- Skontrolujte logy v Zed editore

### Rozšírenie sa neaktivuje
- Skontrolujte, či je rozšírenie správne nainštalované
- Reštartujte Zed editor
- Skontrolujte, či máte najnovšiu verziu Zed editora

## Príspevky

Príspevky sú vítané! Prosím:

1. Forknite repozitár
2. Vytvorte feature branch (`git checkout -b feature/amazing-feature`)
3. Commitnite zmeny (`git commit -m 'Add amazing feature'`)
4. Pushnite branch (`git push origin feature/amazing-feature`)
5. Otvorte Pull Request

## Licencia

Tento projekt je licencovaný pod MIT licenciou - pozrite si [LICENSE](LICENSE) súbor pre detaily.

## Podpora

Ak máte problémy alebo otázky:

- Otvorte [Issue](https://github.com/yourusername/zed-laravel/issues) na GitHub
- Skontrolujte [Zed dokumentáciu](https://zed.dev/docs)
- Skontrolujte [Laravel dokumentáciu](https://laravel.com/docs)

## Changelog

### v0.0.1
- Počiatočná verzia
- Podpora pre `config()`, `view()`, `route()` helper funkcie
- Integrácia s Intelephense language serverom
- Automatická inštalácia závislostí
