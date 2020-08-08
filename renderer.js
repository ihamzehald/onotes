// This file is required by the index.html file and will
//   be executed in the renderer process for that window.
//  No Node.js APIs are available in this process because
//  `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { createBrowserWindow } = require('./common.js');
const { app, BrowserWindow, remote } = require('electron')
const path = require('path')
const button = document.getElementById('open_new_window');
const sqlite3 = require('sqlite3').verbose();

button.addEventListener('click', () => {
    createBrowserWindow(null, true);
});