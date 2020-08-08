const { app, BrowserWindow, remote } = require('electron');
var Promise = require('bluebird');
const { resolve } = require('bluebird');
const sqlite3 = require('sqlite3').verbose();

function getNoteDom() {
    let noteDom = document.getElementById('main_note');
    return noteDom;
}

/**
 * BO DB helpers
 */

/**
 * Get sqlite3 db instance
 * @param dbfile as db file path
 */
function getDB(dbfile = './db/onotes.sqlite3') {
    return (db = new sqlite3.Database(dbfile, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the chinook database.');
    }));
}

/**
 * Close a db connection
 * @param db as sqlite3 instanse
 */
function closeDB(db) {
    console.log('close.....');
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}

/**
 *
 * @param id as record id
 */
function getById(id) {
    return new Promise(function(resolve, reject) {
        let db = getDB();

        let sql = `SELECT *
                   FROM note
                   WHERE id  = ?`;
        let noteId = id;
        let row;

        db.get(sql, [noteId], (err, row) => {
            if (err) {
                console.log('SQL ERROR===>');
                console.log(err);
                closeDB(db);
                reject(err);
            } else {
                closeDB(db);
                resolve(row);
            }
        });
    });
}

/**
 * Update record by ID
 * @param {*} text as note text to be updated
 * @param {*} id as the note id to be updated
 */

function updateById(text, id) {
    return new Promise(function(resolve, reject) {
        let db = getDB();

        let sql = `UPDATE note
                   set text = ?
                   WHERE id  = ?`;
        let noteId = id;
        let row;

        db.get(sql, [text, noteId], (err, row) => {
            console.log(text);
            console.log(id);
            closeDB(db);
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Create a new empty note in the db
 */
function createNewNote() {
    let db = getDB();
    let sql = 'INSERT INTO note(text) VALUES("")';

    return new Promise(function(resolve, reject) {
        db.run(sql, function(err) {
            console.log(err);
            closeDB(db);
            if (!err) {
                resolve(this);
            } else {
                reject(err);
            }
        });
    });
}

/**
 * Mark note as closed
 * @param noteId as note id
 */
function setNoteClosed(noteId) {
    return new Promise(function(resolve, reject) {
        let db = getDB();

        let sql = `UPDATE note
              set is_open = 0
              WHERE id  = ?`;

        db.get(sql, [noteId], (err, row) => {
            console.log(text);
            console.log(id);
            closeDB(db);
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * EO DB helpers
 */

/**
 * Create a note window
 * @param {*} id
 * @param {*} is_new
 */
function createBrowserWindow(id = 1, is_new = false) {
    if (is_new) {
        // create new window in the db then draw the note window

        createNewNote()
            .then(function(newNote) {
                const BrowserWindow = remote.BrowserWindow;
                const win = new BrowserWindow({
                    webPreferences: {
                        preload: path.join(__dirname, 'child_window_preload.js'),
                        nodeIntegration: true,
                        customData: {
                            note_id: newNote.lastID,
                        },
                    },
                    height: 400,
                    width: 400,
                });

                win.loadFile('index.html');

                win.on('closed', function(e) {
                    e.preventDefault();

                    // setNoteClosed(newNote.lastID).then(function(closedNote){
                    //   win.destroy();
                    // }).catch(function(err){
                    //   console.log(err);
                    // });
                });
                //win.webContents.openDevTools()
            })
            .catch(function(err) {
                console.log(err);
            });
    } else {
        // init the note window from previous record from the db

        const BrowserWindow = remote.BrowserWindow;
        const win = new BrowserWindow({
            webPreferences: {
                preload: path.join(__dirname, 'child_window_preload.js'),
                nodeIntegration: true,
                customData: {
                    note_id: id,
                },
            },
            height: 400,
            width: 400,
        });

        win.loadFile('index.html');

        win.on('closed', function(e) {
            e.preventDefault();

            // setNoteClosed(id).then(function(closedNote){
            //   e.destroy();
            // }).catch(function(err){
            //   console.log(err);
            // });
        });
        // win.webContents.openDevTools();
    }
}

//open the notes in the db

function initDbNotes() {
    let db = getDB();
    let initNotesCount = 1;
    db.serialize(() => {
        db.each(`SELECT * FROM note`, (err, note) => {
            if (!err) {
                console.log(note);
                if (initNotesCount == 1) {
                    // first note
                    const noteDom = document.getElementById('main_note');
                    noteDom.value = note.text;

                    noteDom.addEventListener('keyup', () => {
                        updateById(noteDom.value, note.id);
                    });
                } else {
                    createBrowserWindow(note.id);
                }
                initNotesCount++;
            } else {
                console.error(err.message);
            }
            console.log('ok');
        });
    });

    closeDB(db);
}

//init the current window note

function initDbNote(noteId) {
    getById(noteId)
        .then(function(note) {
            console.log('INIT note');
            console.log(note);
            const noteDom = document.getElementById('main_note');
            noteDom.value = note.text;
        })
        .catch(function(err) {
            console.log(err);
        });
}

//TODO: encapsulte all these methods under one module and export that module

exports.getDB = getDB;
exports.closeDB = closeDB;
exports.createBrowserWindow = createBrowserWindow;
exports.initDbNotes = initDbNotes;
exports.initDbNote = initDbNote;
exports.updateById = updateById;
exports.getNoteDom = getNoteDom;
exports.setNoteClosed = setNoteClosed;