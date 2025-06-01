import http from 'http';
import fs from 'fs';
import path from 'path';

// Tipos para diferentes extensões de arquivo
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Cria o servidor
const server = http.createServer((req, res) => {
    console.log(`Request: ${req.url}`);
    
    // Analisa URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Obtém a extensão do arquivo
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Lê o arquivo
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Arquivo não encontrado
                fs.readFile('./index.html', (err, content) => {
                    if (err) {
                        // Se mesmo o index.html não for encontrado, retorna 500
                        res.writeHead(500);
                        res.end('Error: ' + err.code);
                    } else {
                        // Serve index.html para todas as rotas (suporte a SPA)
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // Erro do servidor
                res.writeHead(500);
                res.end('Error: ' + error.code);
            }
        } else {
            // Sucesso
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Configuração da porta
const port = process.env.PORT || 3000;

// Inicia o servidor
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log('Press Ctrl+C to stop the server');
});