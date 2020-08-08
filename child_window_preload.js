var electron = require('electron');

const { createBrowserWindow, initDbNote, updateById, getNoteDom, setNoteClosed } = require('./common.js');



window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }

    var currentWindow = remote.getCurrentWindow();
    let winWebPreferences = currentWindow.webContents.browserWindowOptions.webPreferences;
    let customData = winWebPreferences.customData;

    initDbNote(customData.note_id);

    //update note to db when the uer change the text

    let noteDom = getNoteDom();

    noteDom.addEventListener('keyup', () => {
        updateById(noteDom.value, customData.note_id);
    });


})