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
        { regex: /env\s*\(\s*['"]([^'"]+)['"]\s*\)/, resolver: 'resolveEnv' }
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
            return this[pattern.resolver](match[1]);
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
        { regex: /env\s*\(\s*['"]([^'"]+)['"]\s*\)/, type: 'env' }
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern.regex);
        if (match) {
          const helperType = pattern.type;
          const value = match[1];
          return {
            contents: {
              kind: "markdown",
              value: `**Laravel ${helperType} Helper**\n\n\`${helperType}('${value}')\`\n\n*Click to navigate to definition*`
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

      const content = readFileSync(envPath, "utf-8");
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
