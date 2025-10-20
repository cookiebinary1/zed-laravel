#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class LSPProxy {
    constructor(intelephensePath) {
        this.intelephensePath = intelephensePath;
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.workspaceRoot = null;
        
        this.startIntelephense();
        this.setupStdio();
    }

    startIntelephense() {
        this.intelephense = spawn('node', [this.intelephensePath, '--stdio']);
        
        this.intelephense.stdout.on('data', (data) => {
            process.stdout.write(data);
        });
        
        this.intelephense.stderr.on('data', (data) => {
            console.error('Intelephense error:', data.toString());
        });
    }

    setupStdio() {
        let buffer = '';
        
        process.stdin.on('data', (chunk) => {
            buffer += chunk.toString();
            
            while (true) {
                const match = buffer.match(/Content-Length: (\d+)\r?\n\r?\n/);
                if (!match) break;
                
                const contentLength = parseInt(match[1]);
                const headerLength = match[0].length;
                
                if (buffer.length < headerLength + contentLength) break;
                
                const content = buffer.slice(headerLength, headerLength + contentLength);
                buffer = buffer.slice(headerLength + contentLength);
                
                try {
                    const message = JSON.parse(content);
                    this.handleMessage(message);
                } catch (err) {
                    console.error('Parse error:', err);
                }
            }
        });
    }

    handleMessage(message) {
        if (message.method === 'initialize' && message.params?.rootUri) {
            this.workspaceRoot = message.params.rootUri.replace('file://', '');
        }
        
        if (message.method === 'textDocument/definition') {
            const result = this.handleDefinition(message);
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
        
        const filePath = uri.replace('file://', '');
        if (!existsSync(filePath)) return null;
        
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const line = lines[position.line] || '';
        
        const configMatch = line.match(/config\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (configMatch) {
            return this.resolveConfig(configMatch[1]);
        }
        
        const viewMatch = line.match(/view\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (viewMatch) {
            return this.resolveView(viewMatch[1]);
        }
        
        const routeMatch = line.match(/route\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (routeMatch) {
            return this.resolveRoute(routeMatch[1]);
        }
        
        return null;
    }

    resolveConfig(key) {
        const parts = key.split('.');
        const file = parts[0];
        const configPath = join(this.workspaceRoot, 'config', `${file}.php`);
        
        if (!existsSync(configPath)) return null;
        
        const content = readFileSync(configPath, 'utf-8');
        const lines = content.split('\n');
        
        if (parts.length === 1) {
            return {
                uri: `file://${configPath}`,
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
            };
        }
        
        const searchKey = parts[parts.length - 1];
        const pattern = new RegExp(`^\\s*['"](${searchKey})['"]\\s*=>`);
        
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
                return {
                    uri: `file://${configPath}`,
                    range: { start: { line: i, character: 0 }, end: { line: i, character: lines[i].length } }
                };
            }
        }
        
        return {
            uri: `file://${configPath}`,
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
        };
    }

    resolveView(name) {
        const viewPath = name.replace(/\./g, '/');
        const possiblePaths = [
            join(this.workspaceRoot, 'resources', 'views', `${viewPath}.blade.php`),
            join(this.workspaceRoot, 'resources', 'views', `${viewPath}.php`)
        ];
        
        for (const path of possiblePaths) {
            if (existsSync(path)) {
                return {
                    uri: `file://${path}`,
                    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
                };
            }
        }
        
        return null;
    }

    resolveRoute(name) {
        return null;
    }

    forwardToIntelephense(message) {
        const json = JSON.stringify(message);
        const header = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n`;
        this.intelephense.stdin.write(header + json);
    }

    sendResponse(id, result) {
        const response = { jsonrpc: '2.0', id, result };
        const json = JSON.stringify(response);
        const header = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n`;
        process.stdout.write(header + json);
    }
}

const intelephensePath = process.argv[2] || 'node_modules/intelephense/lib/intelephense.js';
new LSPProxy(intelephensePath);
