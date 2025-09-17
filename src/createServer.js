'use strict';

const http = require('http');
const fs = require('fs/promises');
const path = require('path');

function createServer() {
  return http.createServer(async (req, res) => {
    const BASE_URL = path.join(__dirname, '..', 'public');

    if (!req.url.startsWith('/file/')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Invalid path. Use /file/filename to load files.');

      return;
    }

    if (/\/{2,}/.test(req.url)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Paths having duplicated slashes');

      return;
    }

    const filePath = req.url.replace('/file/', '');
    const fullPath = path.join(BASE_URL, filePath);

    if (!fullPath.startsWith(BASE_URL)) {
      res.statusCode = 400;
      res.end('Traversal is not allowed');

      return;
    }

    try {
      await fs.access(fullPath, fs.constants.F_OK);
    } catch (notExistFile) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not exist');

      return;
    }

    const fileData = await fs.readFile(fullPath);

    res.writeHead(200, { 'Contetn-Type': 'text/html' });
    res.end(fileData);
  });
}

module.exports = {
  createServer,
};
