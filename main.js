const { app, BrowserWindow, ipcMain } = require('electron')
const LaunchModule = require('./launch')
const lnch = new LaunchModule(app.getPath('documents'));
const { download } = require('electron-dl')
var DecompressZip = require('decompress-zip');
const request = require('request');
const { version } = require('request/lib/helpers');
let thewin = null

var lnchlog = '[LOG START]'
var testermode = false
var remoteData = {}

const mc_version = '1.16.5'

var modpacks = {}

require('update-electron-app')()

request('https://raw.githubusercontent.com/mlntcandy/mlntcandy.com/master/assets/ntm.json', {}, (e, r, b) => {
  remoteData = JSON.parse(b)
  lnch.acceptServerIP(remoteData.server.ip, remoteData.server.port)
})

function createWindow () {
  const win = new BrowserWindow({
    width: 500,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.setMenuBarVisibility(false)
  win.loadFile('index.html')
  thewin = win
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
    console.log(1)
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
    

  }
})

ipcMain.on('load-finish', () => {
    thewin.webContents.send("takeappversion", app.getVersion())
    thewin.webContents.send("mpstatus", lnch.checkForModpack())
    thewin.webContents.send("prefs", lnch.readPrefs())
    lnch.setLogger((d) => {
        thewin.webContents.send('log', d)
        lnchlog = lnchlog + '\n' + d
    })
})

ipcMain.on('dl-modpack', (e) => {
    thewin.webContents.send("mpload", true)
    lnch.log('== Modpack Download ==')
    let onProgress = status => {
        thewin.webContents.send("pbar", status.percent*0.8)
        lnch.log(`[Modpack Download] Progress: ${Math.floor(status.percent*1000)/10}%`)
    }
    let uncompress = (filepath) => {
      lnch.log("Finished downloading archive to " + filepath)
      lnch.log('<> Modpack Decompression <>')
      var unzipper = new DecompressZip(filepath)
      unzipper.on('progress', function (fileIndex, fileCount) {
          let perc = (fileIndex + 1) / fileCount
          lnch.log('[Modpack Unpacking] Extracted file ' + (fileIndex + 1) + ' of ' + fileCount + ` (${Math.floor(perc*1000)/10}%)`)
          thewin.webContents.send("pbar", perc * 0.2 + 0.8)
      });
      unzipper.extract({
          path: lnch.gameDirectory,
          filter: function (file) {
              return file.type !== "SymbolicLink"
          }
      })
      unzipper.on('extract', function (log) {
          lnch.log('Finished unpacking to ' + lnch.gameDirectory)
          lnch.log('Deleting the file')
          thewin.webContents.send("pbar", 0.5)
          lnch.delFile(filepath)
          lnch.log('## READY TO PLAY ##')
          thewin.webContents.send("pbar", 0)
          thewin.webContents.send("mpload", false)
          thewin.webContents.send("mpstatus", lnch.checkForModpack())
      });
      
  }
    if (testermode) return uncompress(lnch.pathModule.join(lnch.appDirectory, '/test-modpack.zip'))
    
    download(BrowserWindow.getFocusedWindow(), remoteData.modpackUrl, {directory: app.getPath("temp"), onProgress: onProgress}).then(dl => uncompress(dl.getSavePath()))
})
ipcMain.on('rm-modpack', (e) => {
    thewin.webContents.send("mprem", true)
    lnch.deleteModpack()
    thewin.webContents.send("mprem", false)
    thewin.webContents.send("mpstatus", lnch.checkForModpack())
})

ipcMain.on('launch', (e, nickname, ram, connect) => {
    if (ram == '') {ram = '4G'}
    thewin.webContents.send("pbar", 0.5)
    lnch.launch(nickname, ram, connect, mc_version, (progress) => {
        if (progress.type == 'close') return thewin.webContents.send("gameload", false)
        thewin.webContents.send("gameload", true)
        thewin.webContents.send("pbar", ((progress.task+1)/(progress.total+1)))
    })
})

ipcMain.on('save-fields', (e, nick, ram, connect) => {
    lnch.savePrefs(nick, ram, connect)
})
ipcMain.on('tester-mode', (e) => {
  testermode = true;
})
ipcMain.on('upload-log', (e) => {
  require('./dogbin')(lnchlog).then((url)=>{
    lnch.log(`###################`)
    lnch.log(`Uploaded the log at:`)
    lnch.log(url)
    lnch.log(`###################`)
  })
})