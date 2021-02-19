const { app, Menu, shell, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron');
const fs = require('fs');


function saveFile() {
  console.log('Saving the file');
  const window = BrowserWindow.getFocusedWindow();
  window.webContents.send('editor-event', 'save');
}

function loadFile() {
  const options = {
    title: 'Pick a markdown file',
    filters: [
      { name: 'Markdown files', extensions: ['md'] },
      { name: 'Text files', extensions: ['txt'] }
    ]
  };
  const window = BrowserWindow.getFocusedWindow();
  dialog.showOpenDialog(window, options).then(result => {
    const filename = result.filePaths[0];
    if (filename) {
      const content = fs.readFileSync(filename).toString();
      window.webContents.send('load', content);
    }
  });
}

app.on('ready', () => {
  globalShortcut.register('CommandOrControl+S', () => { saveFile(); });
  globalShortcut.register('CommandOrControl+O', () => { loadFile(); });
});

ipcMain.on('save', (event, arg) => {
  const options = {
    title: 'Save markdown file',
    filters: [
      {
        name: 'MyFile',
        extensions: ['md']
      }
    ]
  };
  const window = BrowserWindow.getFocusedWindow();
  dialog.showSaveDialog(window, options).then(result => {
    const filename = result.filePath;
    if (filename) {
      console.log(`Saving content to the file: ${filename}`);
      fs.writeFileSync(filename, arg);
    }
  });

});

ipcMain.on('editor-reply', (event, arg) => {
  console.log(`Received reply from web page: ${arg}`);
});

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'CommandOrControl+O',
        click() {
          loadFile();
        }
      },
      {
        label: 'Save',
        accelerator: 'CommandOrControl+S',
        click() {
          saveFile();
        }
      }
    ]
  }
];

if (process.platform === 'win32') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })
}

if (process.env.DEBUG) {
   template.push({
     label: 'Debugging',
     submenu: [
       {
         label: 'Dev Tools',
         role: 'toggleDevTools'
       },

       { type: 'separator' },
       {
         role: 'reload',
         accelerator: 'Alt+R'
       }
     ]
   });
 }

const menu = Menu.buildFromTemplate(template);
module.exports = menu;
