#!/usr/bin/env node

import { spawn } from "child_process";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

class LSPProxy {
  constructor(intelephensePath) {
    this.intelephensePath = intelephensePath;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.workspaceRoot = null;
    this.fileCache = new Map(); // Cache pre súbory
    this.configCache = new Map(); // Cache pre config súbory

    this.startIntelephense();
    this.setupStdio();
  }

  startIntelephense() {
    // Intelephense sa spúšťa s argumentom "--stdio" pre LSP protokol
    this.intelephense = spawn("node", [this.intelephensePath, "--stdio"]);

    this.intelephense.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    this.intelephense.stderr.on("data", (data) => {
      console.error("Intelephense error:", data.toString());
    });

    this.intelephense.on("error", (error) => {
      console.error("Failed to start Intelephense:", error);
      process.exit(1);
    });
  }

  setupStdio() {
    let buffer = "";

    process.stdin.on("data", (chunk) => {
      buffer += chunk.toString();

      while (true) {
        const match = buffer.match(/Content-Length: (\d+)\r?\n\r?\n/);
        if (!match) break;

        const contentLength = parseInt(match[1]);
        const headerLength = match[0].length;

        if (buffer.length < headerLength + contentLength) break;

        const content = buffer.slice(
          headerLength,
          headerLength + contentLength,
        );
        buffer = buffer.slice(headerLength + contentLength);

        try {
          const message = JSON.parse(content);
          this.handleMessage(message);
        } catch (err) {
          console.error("Parse error:", err);
        }
      }
    });
  }

  handleMessage(message) {
    if (message.method === "initialize" && message.params?.rootUri) {
      this.workspaceRoot = message.params.rootUri.replace("file://", "");
    }

    if (message.method === "textDocument/definition") {
      const result = this.handleDefinition(message);
      if (result) {
        this.sendResponse(message.id, result);
        return;
      }
    }

    if (message.method === "textDocument/hover") {
      const result = this.handleHover(message);
      if (result) {
        this.sendResponse(message.id, result);
        return;
      }
    }

    this.forwardToIntelephense(message);
  }

  handleDefinition(message) {
    if (!this.workspaceRoot) return null;

    const uri = message.params.textDocument.uri;
    const position = message.params.position;

    const filePath = uri.replace("file://", "");
    if (!existsSync(filePath)) return null;

    try {
      const content = this.getCachedFile(filePath);
      const lines = content.split("\n");
      const line = lines[position.line] || "";

      // Rýchle regex matching pre Laravel helper funkcie
      const patterns = [
        { regex: /config\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveConfig' },
        { regex: /view\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveView' },
        { regex: /route\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveRoute' },
        { regex: /asset\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveAsset' },
        { regex: /url\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveUrl' },
        { regex: /trans\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveTrans' },
        { regex: /env\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveEnv' },
        { regex: /__\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveTrans' }, // __() alias for trans()
        { regex: /old\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveOld' }, // old() helper
        { regex: /session\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveSession' }, // session() helper
        { regex: /cache\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveCache' }, // cache() helper
        { regex: /storage_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveStoragePath' }, // storage_path() helper
        { regex: /public_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolvePublicPath' }, // public_path() helper
        { regex: /base_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveBasePath' }, // base_path() helper
        { regex: /app_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveAppPath' }, // app_path() helper
        { regex: /database_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveDatabasePath' }, // database_path() helper
        { regex: /resource_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveResourcePath' }, // resource_path() helper
        // Blade komponenty
        { regex: /<x-([a-zA-Z0-9\-]+)/, resolver: 'resolveBladeComponent', isBlade: true },
        { regex: /<x:([a-zA-Z0-9\-]+)/, resolver: 'resolveBladeComponent', isBlade: true },
        // Laravel Facades
        { regex: /Auth::([a-zA-Z0-9_]+)/, resolver: 'resolveFacade', facade: 'Auth' },
        { regex: /Cache::([a-zA-Z0-9_]+)/, resolver: 'resolveFacade', facade: 'Cache' },
        { regex: /DB::([a-zA-Z0-9_]+)/, resolver: 'resolveFacade', facade: 'DB' },
        { regex: /Storage::([a-zA-Z0-9_]+)/, resolver: 'resolveFacade', facade: 'Storage' },
        { regex: /Mail::([a-zA-Z0-9_]+)/, resolver: 'resolveFacade', facade: 'Mail' },
        { regex: /Log::([a-zA-Z0-9_]+)/, resolver: 'resolveFacade', facade: 'Log' },
        { regex: /Validator::([a-zA-Z0-9_]+)/, resolver: 'resolveFacade', facade: 'Validator' },
        { regex: /Hash::([a-zA-Z0-9_]+)/, resolver: 'resolveFacade', facade: 'Hash' },
        { regex: /Password::([a-zA-Z0-9_]+)/, resolver: 'resolveFacade', facade: 'Password' },
        // Database migrations
        { regex: /Schema::([a-zA-Z0-9_]+)/, resolver: 'resolveSchema', facade: 'Schema' },
        { regex: /Blueprint::([a-zA-Z0-9_]+)/, resolver: 'resolveBlueprint', facade: 'Blueprint' },
        // Validation rules
        { regex: /'([a-zA-Z0-9_]+)'.*=>.*'([a-zA-Z0-9_|]+)'/, resolver: 'resolveValidationRule', isValidation: true },
        // Service Providers & Bindings
        { regex: /\$this->app->bind\s*\(\s*([a-zA-Z0-9_:\\]+)\s*,\s*([a-zA-Z0-9_:\\]+)\s*\)/, resolver: 'resolveServiceBinding', isBinding: true },
        { regex: /\$this->app->singleton\s*\(\s*([a-zA-Z0-9_:\\]+)\s*,\s*([a-zA-Z0-9_:\\]+)\s*\)/, resolver: 'resolveServiceBinding', isBinding: true },
        { regex: /\$this->app->bindIf\s*\(\s*([a-zA-Z0-9_:\\]+)\s*,\s*([a-zA-Z0-9_:\\]+)\s*\)/, resolver: 'resolveServiceBinding', isBinding: true },
        // Events & Listeners
        { regex: /event\s*\(\s*new\s+([a-zA-Z0-9_]+)\s*\(/, resolver: 'resolveEvent', isEvent: true },
        { regex: /Event::listen\s*\(\s*([a-zA-Z0-9_:\\]+)\s*,/, resolver: 'resolveEventListener', isEventListener: true },
        { regex: /Event::dispatch\s*\(\s*new\s+([a-zA-Z0-9_]+)\s*\(/, resolver: 'resolveEvent', isEvent: true },
        // Queues & Jobs
        { regex: /dispatch\s*\(\s*new\s+([a-zA-Z0-9_]+)\s*\(/, resolver: 'resolveJob', isJob: true },
        { regex: /dispatch\s*\(\s*([a-zA-Z0-9_]+)::/, resolver: 'resolveJob', isJob: true },
        { regex: /Queue::push\s*\(\s*([a-zA-Z0-9_:\\]+)\s*,/, resolver: 'resolveJob', isJob: true }
      ];

      // Optimalizované vyhľadávanie - iba ak je kurzor v správnom rozsahu
      const cursorPos = position.character;
      for (const pattern of patterns) {
        const match = line.match(pattern.regex);
        if (match && match.index !== undefined) {
          const matchStart = match.index;
          const matchEnd = matchStart + match[0].length;
          
          // Skontroluj, či je kurzor v rozsahu match
          if (cursorPos >= matchStart && cursorPos <= matchEnd) {
            if (pattern.facade) {
              return this[pattern.resolver](match[1], pattern.facade);
            } else if (pattern.isBlade) {
              return this[pattern.resolver](match[1]);
            } else if (pattern.isValidation) {
              return this[pattern.resolver](match[1], match[2]);
            } else if (pattern.isBinding) {
              return this[pattern.resolver](match[1], match[2]);
            } else if (pattern.isEvent) {
              return this[pattern.resolver](match[1]);
            } else if (pattern.isEventListener) {
              return this[pattern.resolver](match[1]);
            } else if (pattern.isJob) {
              return this[pattern.resolver](match[1]);
            } else {
              return this[pattern.resolver](match[1]);
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error reading file:", error);
      return null;
    }
  }

  getCachedFile(filePath) {
    // Cache súborov na 5 sekúnd
    const cacheKey = filePath;
    const cached = this.fileCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < 5000) {
      return cached.content;
    }

    const content = readFileSync(filePath, "utf-8");
    this.fileCache.set(cacheKey, {
      content: content,
      timestamp: now
    });

    // Vyčistiť starý cache
    if (this.fileCache.size > 100) {
      const entries = Array.from(this.fileCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < 50; i++) {
        this.fileCache.delete(entries[i][0]);
      }
    }

    return content;
  }

  handleHover(message) {
    if (!this.workspaceRoot) return null;

    const uri = message.params.textDocument.uri;
    const position = message.params.position;

    const filePath = uri.replace("file://", "");
    if (!existsSync(filePath)) return null;

    try {
      const content = this.getCachedFile(filePath);
      const lines = content.split("\n");
      const line = lines[position.line] || "";

      // Rýchle regex matching pre Laravel helper funkcie
      const patterns = [
        { regex: /config\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'config' },
        { regex: /view\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'view' },
        { regex: /route\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'route' },
        { regex: /asset\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'asset' },
        { regex: /url\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'url' },
        { regex: /trans\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'trans' },
        { regex: /env\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'env' },
        { regex: /__\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'trans' }, // __() alias for trans()
        { regex: /old\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'old' },
        { regex: /session\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'session' },
        { regex: /cache\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'cache' },
        { regex: /storage_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'storage_path' },
        { regex: /public_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'public_path' },
        { regex: /base_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'base_path' },
        { regex: /app_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'app_path' },
        { regex: /database_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'database_path' },
        { regex: /resource_path\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'resource_path' },
        // Blade komponenty
        { regex: /<x-([a-zA-Z0-9\-]+)/, type: 'blade-component' },
        { regex: /<x:([a-zA-Z0-9\-]+)/, type: 'blade-component' },
        // Laravel Facades
        { regex: /Auth::([a-zA-Z0-9_]+)/, type: 'facade', facade: 'Auth' },
        { regex: /Cache::([a-zA-Z0-9_]+)/, type: 'facade', facade: 'Cache' },
        { regex: /DB::([a-zA-Z0-9_]+)/, type: 'facade', facade: 'DB' },
        { regex: /Storage::([a-zA-Z0-9_]+)/, type: 'facade', facade: 'Storage' },
        { regex: /Mail::([a-zA-Z0-9_]+)/, type: 'facade', facade: 'Mail' },
        { regex: /Log::([a-zA-Z0-9_]+)/, type: 'facade', facade: 'Log' },
        { regex: /Validator::([a-zA-Z0-9_]+)/, type: 'facade', facade: 'Validator' },
        { regex: /Hash::([a-zA-Z0-9_]+)/, type: 'facade', facade: 'Hash' },
        { regex: /Password::([a-zA-Z0-9_]+)/, type: 'facade', facade: 'Password' },
        // Service Providers & Bindings
        { regex: /\$this->app->bind\s*\(\s*([a-zA-Z0-9_:\\]+)\s*,\s*([a-zA-Z0-9_:\\]+)\s*\)/, type: 'service-binding' },
        { regex: /\$this->app->singleton\s*\(\s*([a-zA-Z0-9_:\\]+)\s*,\s*([a-zA-Z0-9_:\\]+)\s*\)/, type: 'service-binding' },
        { regex: /\$this->app->bindIf\s*\(\s*([a-zA-Z0-9_:\\]+)\s*,\s*([a-zA-Z0-9_:\\]+)\s*\)/, type: 'service-binding' },
        // Events & Listeners
        { regex: /event\s*\(\s*new\s+([a-zA-Z0-9_]+)\s*\(/, type: 'event' },
        { regex: /Event::listen\s*\(\s*([a-zA-Z0-9_:\\]+)\s*,/, type: 'event-listener' },
        { regex: /Event::dispatch\s*\(\s*new\s+([a-zA-Z0-9_]+)\s*\(/, type: 'event' },
        // Queues & Jobs
        { regex: /dispatch\s*\(\s*new\s+([a-zA-Z0-9_]+)\s*\(/, type: 'job' },
        { regex: /dispatch\s*\(\s*([a-zA-Z0-9_]+)::/, type: 'job' },
        { regex: /Queue::push\s*\(\s*([a-zA-Z0-9_:\\]+)\s*,/, type: 'job' }
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern.regex);
        if (match) {
          const helperType = pattern.type;
          const value = match[1];
          
          let tooltipText = '';
          if (pattern.facade) {
            tooltipText = `**Laravel ${pattern.facade} Facade**\n\n\`${pattern.facade}::${value}\`\n\n*Click to navigate to facade definition*`;
          } else if (helperType === 'blade-component') {
            tooltipText = `**Blade Component**\n\n\`<x-${value}>\`\n\n*Click to navigate to component definition*`;
          } else if (helperType === 'service-binding') {
            tooltipText = `**Service Binding**\n\n\`$this->app->bind(${match[1]}, ${match[2]})\`\n\n*Click to navigate to implementation*`;
          } else if (helperType === 'event') {
            tooltipText = `**Laravel Event**\n\n\`event(new ${value}())\`\n\n*Click to navigate to event definition*`;
          } else if (helperType === 'event-listener') {
            tooltipText = `**Event Listener**\n\n\`Event::listen(${value}, ...)\`\n\n*Click to navigate to listener definition*`;
          } else if (helperType === 'job') {
            tooltipText = `**Laravel Job**\n\n\`dispatch(new ${value}())\`\n\n*Click to navigate to job definition*`;
          } else {
            tooltipText = `**Laravel ${helperType} Helper**\n\n\`${helperType}('${value}')\`\n\n*Click to navigate to definition*`;
          }
          
          return {
            contents: {
              kind: "markdown",
              value: tooltipText
            }
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error handling hover:", error);
      return null;
    }
  }

  resolveConfig(key) {
    try {
      const parts = key.split(".");
      const file = parts[0];
      const configPath = join(this.workspaceRoot, "config", `${file}.php`);

      if (!existsSync(configPath)) return null;

      const content = this.getCachedFile(configPath);
      const lines = content.split("\n");

      if (parts.length === 1) {
        return {
          uri: `file://${configPath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }

      const searchKey = parts[parts.length - 1];
      const pattern = new RegExp(`^\\s*['"](${searchKey})['"]\\s*=>`);

      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          return {
            uri: `file://${configPath}`,
            range: {
              start: { line: i, character: 0 },
              end: { line: i, character: lines[i].length },
            },
          };
        }
      }

      return {
        uri: `file://${configPath}`,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
      };
    } catch (error) {
      console.error("Error resolving config:", error);
      return null;
    }
  }

  resolveView(name) {
    try {
      const viewPath = name.replace(/\./g, "/");
      const possiblePaths = [
        join(this.workspaceRoot, "resources", "views", `${viewPath}.blade.php`),
        join(this.workspaceRoot, "resources", "views", `${viewPath}.php`),
      ];

      for (const path of possiblePaths) {
        if (existsSync(path)) {
          return {
            uri: `file://${path}`,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving view:", error);
      return null;
    }
  }

  resolveRoute(name) {
    if (!this.workspaceRoot) return null;

    try {
      // Laravel routes sú definované v routes/web.php, routes/api.php, atď.
      const routeFiles = [
        "routes/web.php",
        "routes/api.php", 
        "routes/console.php",
        "routes/channels.php"
      ];

      for (const routeFile of routeFiles) {
        const routePath = join(this.workspaceRoot, routeFile);
        if (!existsSync(routePath)) continue;

        const content = readFileSync(routePath, "utf-8");
        const lines = content.split("\n");

        // Hľadáme route definície s daným názvom
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Podporujeme rôzne formáty Laravel route definícií:
          // Route::get('/path', [Controller::class, 'method'])->name('route-name');
          // Route::post('/path', function() {})->name('route-name');
          // Route::resource('users', UserController::class);
          
          const routeNameMatch = line.match(/->name\s*\(\s*['"]([^'"]+)['"]\s*\)/);
          if (routeNameMatch && routeNameMatch[1] === name) {
            return {
              uri: `file://${routePath}`,
              range: {
                start: { line: i, character: 0 },
                end: { line: i, character: line.length },
              },
            };
          }

          // Pre resource routes hľadáme pattern ako Route::resource('users', UserController::class)
          const resourceMatch = line.match(/Route::resource\s*\(\s*['"]([^'"]+)['"]\s*,/);
          if (resourceMatch && resourceMatch[1] === name) {
            return {
              uri: `file://${routePath}`,
              range: {
                start: { line: i, character: 0 },
                end: { line: i, character: line.length },
              },
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving route:", error);
      return null;
    }
  }

  resolveAsset(path) {
    try {
      const assetPath = join(this.workspaceRoot, "public", path);
      if (existsSync(assetPath)) {
        return {
          uri: `file://${assetPath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error resolving asset:", error);
      return null;
    }
  }

  resolveUrl(path) {
    try {
      // URL helper môže odkazovať na routes alebo statické súbory
      // Najprv skúsime route resolver
      const routeResult = this.resolveRoute(path);
      if (routeResult) return routeResult;

      // Ak nie je route, skúsime asset resolver
      return this.resolveAsset(path);
    } catch (error) {
      console.error("Error resolving url:", error);
      return null;
    }
  }

  resolveTrans(key) {
    try {
      const parts = key.split(".");
      const file = parts[0];
      const langPath = join(this.workspaceRoot, "lang", "en", `${file}.php`);

      if (!existsSync(langPath)) return null;

      const content = readFileSync(langPath, "utf-8");
      const lines = content.split("\n");

      if (parts.length === 1) {
        return {
          uri: `file://${langPath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }

      const searchKey = parts[parts.length - 1];
      const pattern = new RegExp(`^\\s*['"](${searchKey})['"]\\s*=>`);

      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          return {
            uri: `file://${langPath}`,
            range: {
              start: { line: i, character: 0 },
              end: { line: i, character: lines[i].length },
            },
          };
        }
      }

      return {
        uri: `file://${langPath}`,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
      };
    } catch (error) {
      console.error("Error resolving trans:", error);
      return null;
    }
  }

  resolveEnv(key) {
    try {
      const envPath = join(this.workspaceRoot, ".env");
      if (!existsSync(envPath)) return null;

      const content = this.getCachedFile(envPath);
      const lines = content.split("\n");

      const pattern = new RegExp(`^\\s*${key}\\s*=`);
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          return {
            uri: `file://${envPath}`,
            range: {
              start: { line: i, character: 0 },
              end: { line: i, character: lines[i].length },
            },
          };
        }
      }

      return {
        uri: `file://${envPath}`,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
      };
    } catch (error) {
      console.error("Error resolving env:", error);
      return null;
    }
  }

  resolveOld(key) {
    try {
      // old() helper obvykle odkazuje na form field names
      // Môžeme hľadať v session flash data alebo form validation
      const sessionPath = join(this.workspaceRoot, "storage", "framework", "sessions");
      if (existsSync(sessionPath)) {
        return {
          uri: `file://${sessionPath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error resolving old:", error);
      return null;
    }
  }

  resolveSession(key) {
    try {
      // session() helper odkazuje na session data
      const sessionPath = join(this.workspaceRoot, "storage", "framework", "sessions");
      if (existsSync(sessionPath)) {
        return {
          uri: `file://${sessionPath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error resolving session:", error);
      return null;
    }
  }

  resolveCache(key) {
    try {
      // cache() helper odkazuje na cache súbory
      const cachePath = join(this.workspaceRoot, "storage", "framework", "cache");
      if (existsSync(cachePath)) {
        return {
          uri: `file://${cachePath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error resolving cache:", error);
      return null;
    }
  }

  resolveStoragePath(path) {
    try {
      const storagePath = join(this.workspaceRoot, "storage", "app", path);
      if (existsSync(storagePath)) {
        return {
          uri: `file://${storagePath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error resolving storage_path:", error);
      return null;
    }
  }

  resolvePublicPath(path) {
    try {
      const publicPath = join(this.workspaceRoot, "public", path);
      if (existsSync(publicPath)) {
        return {
          uri: `file://${publicPath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error resolving public_path:", error);
      return null;
    }
  }

  resolveBasePath(path) {
    try {
      const basePath = join(this.workspaceRoot, path);
      if (existsSync(basePath)) {
        return {
          uri: `file://${basePath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error resolving base_path:", error);
      return null;
    }
  }

  resolveAppPath(path) {
    try {
      const appPath = join(this.workspaceRoot, "app", path);
      if (existsSync(appPath)) {
        return {
          uri: `file://${appPath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error resolving app_path:", error);
      return null;
    }
  }

  resolveDatabasePath(path) {
    try {
      const databasePath = join(this.workspaceRoot, "database", path);
      if (existsSync(databasePath)) {
        return {
          uri: `file://${databasePath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error resolving database_path:", error);
      return null;
    }
  }

  resolveResourcePath(path) {
    try {
      const resourcePath = join(this.workspaceRoot, "resources", path);
      if (existsSync(resourcePath)) {
        return {
          uri: `file://${resourcePath}`,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error resolving resource_path:", error);
      return null;
    }
  }

  resolveBladeComponent(componentName) {
    try {
      // Hľadáme Blade komponenty v rôznych priečinkoch
      const possiblePaths = [
        // Anonímne komponenty
        join(this.workspaceRoot, "resources", "views", "components", `${componentName}.blade.php`),
        join(this.workspaceRoot, "resources", "views", "components", `${componentName}.php`),
        // Class-based komponenty
        join(this.workspaceRoot, "app", "View", "Components", `${componentName}.php`),
        join(this.workspaceRoot, "app", "View", "Components", `${componentName}Component.php`),
        // Namespace komponenty
        join(this.workspaceRoot, "app", "View", "Components", componentName.replace(/-/g, ""), "index.blade.php"),
        join(this.workspaceRoot, "resources", "views", "components", componentName.replace(/-/g, ""), "index.blade.php")
      ];

      for (const path of possiblePaths) {
        if (existsSync(path)) {
          return {
            uri: `file://${path}`,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving Blade component:", error);
      return null;
    }
  }

  resolveFacade(method, facadeName) {
    try {
      // Hľadáme facade definície v Laravel framework
      const facadePaths = [
        join(this.workspaceRoot, "vendor", "laravel", "framework", "src", "Illuminate", "Support", "Facades", `${facadeName}.php`),
        join(this.workspaceRoot, "app", "Providers", `${facadeName}ServiceProvider.php`),
        join(this.workspaceRoot, "config", "app.php") // pre facade bindings
      ];

      for (const path of facadePaths) {
        if (existsSync(path)) {
          return {
            uri: `file://${path}`,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving facade:", error);
      return null;
    }
  }

  resolveSchema(method, facadeName) {
    try {
      // Hľadáme Schema facade definície
      const schemaPaths = [
        join(this.workspaceRoot, "vendor", "laravel", "framework", "src", "Illuminate", "Database", "Schema", "Builder.php"),
        join(this.workspaceRoot, "database", "migrations") // pre migration súbory
      ];

      for (const path of schemaPaths) {
        if (existsSync(path)) {
          return {
            uri: `file://${path}`,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving schema:", error);
      return null;
    }
  }

  resolveBlueprint(method, facadeName) {
    try {
      // Hľadáme Blueprint definície
      const blueprintPaths = [
        join(this.workspaceRoot, "vendor", "laravel", "framework", "src", "Illuminate", "Database", "Schema", "Blueprint.php"),
        join(this.workspaceRoot, "database", "migrations") // pre migration súbory
      ];

      for (const path of blueprintPaths) {
        if (existsSync(path)) {
          return {
            uri: `file://${path}`,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving blueprint:", error);
      return null;
    }
  }

  resolveValidationRule(field, rules) {
    try {
      // Hľadáme validation rule definície
      const validationPaths = [
        join(this.workspaceRoot, "vendor", "laravel", "framework", "src", "Illuminate", "Validation", "Rules"),
        join(this.workspaceRoot, "app", "Rules"), // pre custom validation rules
        join(this.workspaceRoot, "app", "Http", "Requests") // pre FormRequest súbory
      ];

      // Rozdelíme rules a hľadáme každú
      const ruleList = rules.split('|');
      for (const rule of ruleList) {
        const cleanRule = rule.trim();
        for (const basePath of validationPaths) {
          const rulePath = join(basePath, `${cleanRule}.php`);
          if (existsSync(rulePath)) {
            return {
              uri: `file://${rulePath}`,
              range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 0 },
              },
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving validation rule:", error);
      return null;
    }
  }

  resolveServiceBinding(interfaceName, implementation) {
    try {
      // Hľadáme service binding definície
      const bindingPaths = [
        join(this.workspaceRoot, "app", "Providers", "AppServiceProvider.php"),
        join(this.workspaceRoot, "app", "Providers", "AuthServiceProvider.php"),
        join(this.workspaceRoot, "app", "Providers", "EventServiceProvider.php"),
        join(this.workspaceRoot, "app", "Providers", "RouteServiceProvider.php"),
        join(this.workspaceRoot, "app", "Providers", "BroadcastServiceProvider.php"),
        join(this.workspaceRoot, "app", "Providers", "TelescopeServiceProvider.php"),
        join(this.workspaceRoot, "app", "Providers", "HorizonServiceProvider.php")
      ];

      // Hľadáme implementation súbor
      const cleanImplementation = implementation.replace(/::class$/, '').replace(/\\/g, '/');
      const implementationPaths = [
        join(this.workspaceRoot, "app", `${cleanImplementation}.php`),
        join(this.workspaceRoot, "app", "Services", `${cleanImplementation}.php`),
        join(this.workspaceRoot, "app", "Repositories", `${cleanImplementation}.php`),
        join(this.workspaceRoot, "app", "Contracts", `${cleanImplementation}.php`)
      ];

      for (const path of implementationPaths) {
        if (existsSync(path)) {
          return {
            uri: `file://${path}`,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          };
        }
      }

      // Ak nenájdeme implementation, ukážeme service provider
      for (const path of bindingPaths) {
        if (existsSync(path)) {
          return {
            uri: `file://${path}`,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving service binding:", error);
      return null;
    }
  }

  resolveEvent(eventName) {
    try {
      // Hľadáme event súbory
      const eventPaths = [
        join(this.workspaceRoot, "app", "Events", `${eventName}.php`),
        join(this.workspaceRoot, "app", "Events", "Auth", `${eventName}.php`),
        join(this.workspaceRoot, "app", "Events", "User", `${eventName}.php`),
        join(this.workspaceRoot, "app", "Events", "Order", `${eventName}.php`)
      ];

      for (const path of eventPaths) {
        if (existsSync(path)) {
          return {
            uri: `file://${path}`,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving event:", error);
      return null;
    }
  }

  resolveEventListener(eventClass) {
    try {
      // Hľadáme listener súbory
      const listenerPaths = [
        join(this.workspaceRoot, "app", "Listeners", `${eventClass}Listener.php`),
        join(this.workspaceRoot, "app", "Listeners", "Auth", `${eventClass}Listener.php`),
        join(this.workspaceRoot, "app", "Listeners", "User", `${eventClass}Listener.php`),
        join(this.workspaceRoot, "app", "Listeners", "Order", `${eventClass}Listener.php`)
      ];

      for (const path of listenerPaths) {
        if (existsSync(path)) {
          return {
            uri: `file://${path}`,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          };
        }
      }

      // Ak nenájdeme listener, ukážeme event
      return this.resolveEvent(eventClass);
    } catch (error) {
      console.error("Error resolving event listener:", error);
      return null;
    }
  }

  resolveJob(jobName) {
    try {
      // Hľadáme job súbory
      const jobPaths = [
        join(this.workspaceRoot, "app", "Jobs", `${jobName}.php`),
        join(this.workspaceRoot, "app", "Jobs", "Auth", `${jobName}.php`),
        join(this.workspaceRoot, "app", "Jobs", "User", `${jobName}.php`),
        join(this.workspaceRoot, "app", "Jobs", "Order", `${jobName}.php`),
        join(this.workspaceRoot, "app", "Jobs", "Mail", `${jobName}.php`),
        join(this.workspaceRoot, "app", "Jobs", "Notification", `${jobName}.php`)
      ];

      for (const path of jobPaths) {
        if (existsSync(path)) {
          return {
            uri: `file://${path}`,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving job:", error);
      return null;
    }
  }

  forwardToIntelephense(message) {
    const json = JSON.stringify(message);
    const header = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n`;
    this.intelephense.stdin.write(header + json);
  }

  sendResponse(id, result) {
    const response = { jsonrpc: "2.0", id, result };
    const json = JSON.stringify(response);
    const header = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n`;
    process.stdout.write(header + json);
  }
}

const intelephensePath = process.argv[2] || "node_modules/intelephense/lib/intelephense.js";
new LSPProxy(intelephensePath);
