const { app, BrowserWindow, ipcMain } = require('electron')
const LaunchModule = require('./launch')
const lnch = new LaunchModule(app.getPath('documents'));
const { download } = require('electron-dl')
var DecompressZip = require('decompress-zip');
const request = require('request');
const { version } = require('request/lib/helpers');
const urljoin = require('url-join')
let thewin = null

var lnchlog = '[LOG START]'
var testermode = false
var remoteData = {}

const mc_version = '1.16.5'

var modpacks = {}
var areModpacksReady = false
var selectedModpack = ''

require('update-electron-app')()

request('https://raw.githubusercontent.com/mlntcandy/NTMLauncher/master/modpacklist.json', {}, (e, r, b) => {
  remoteData = JSON.parse(b)
  modpacks = remoteData.modpacks
  // parse modpacks once and for all
  for (let mp in modpacks) {
    if (modpacks[mp].link == "unavailable") continue
    let getFullURL = (path) => urljoin(modpacks[mp].link, path)
    request(modpacks[mp].link, {}, (er, res, body) => {
      if (!er) {
        var remote_mp = JSON.parse(body)
        modpacks[mp] = {...modpacks[mp], ...remote_mp}
      } else {
        modpacks[mp].link = 'unavailable'
      }

      if (Number(mp) + 1 == modpacks.length) {
        areModpacksReady = true
        lnch.acceptModpacks(modpacks)
      }
      console.log(modpacks)
    })
  }
  //lnch.acceptServerIP(remoteData.server.ip, remoteData.server.port)
})

console.log(modpacks)

function createWindow () {
  const win = new BrowserWindow({
    width: 500,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  win.setMenuBarVisibility(false)
  win.loadFile('index.html')
  thewin = win
}

async function getMpState() {
  modpacks = await lnch.checkAllModpacks(modpacks)
  thewin.webContents.send("modpacks_update_state", modpacks)
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

ipcMain.on('load-finish', async () => {
    thewin.webContents.send("takeappversion", app.getVersion())
    console.log((await lnch.checkAllModpacks(modpacks)))
    thewin.webContents.send("mpstatus", (await lnch.checkAllModpacks(modpacks)))
    thewin.webContents.send("prefs", lnch.readPrefs())
    if (areModpacksReady) thewin.webContents.send("modpacks", modpacks)
    lnch.setLogger((d) => {
        thewin.webContents.send('log', d)
        lnchlog = lnchlog + '\n' + d
    })
})

ipcMain.on('dl-modpack', async (e) => {
    thewin.webContents.send("mpsync", true, selectedModpack)
    lnch.log('== Modpack Download ==')
    let onProgress = status => {
      if (status.total){
        thewin.webContents.send("pbar", status.loaded/status.total) 
        lnch.log(`[Modpack Download] ${status.phase} | ${Math.floor(status.loaded/status.total*1000)/10}%`)
      } else {
        thewin.webContents.send("pbar", 0.3)
        lnch.log(`[Modpack Download] ${status.phase} | ${status.loaded}`)
      }
    }
    lnch.installModpack(onProgress).then(()=>{getMpState()})
    getMpState()
})
ipcMain.on('rm-modpack', async (e) => {
    thewin.webContents.send("mprem", true)
    lnch.deleteModpack()
    thewin.webContents.send("mprem", false)
    thewin.webContents.send("mpstatus", (await lnch.checkAllModpacks(modpacks)))
})

ipcMain.on('get_modpacks_status', async (e) => {
  await getMpState()
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
    lnch.savePrefs(nick, ram, connect, selectedModpack.name)
})
ipcMain.on('tester-mode', (e) => {
  testermode = true;
})
ipcMain.on('get_modpacks', (e) => {

  if (areModpacksReady) {
    thewin.webContents.send("modpacks", modpacks)
  }
  else {
    thewin.webContents.send("modpacks", false)
  }
})


lnch.getModpacksCallback(() => {
  if (areModpacksReady) return modpacks
  else return false
})

ipcMain.on('select-modpack', (e, modpack) => {
  for (let mp of modpacks) {
    if (modpack == mp.name) {
      console.log(mp)
      lnch.selectModpack(mp)
      break
    }
  }

})
ipcMain.on('upload-log', (e) => {
  require('./dogbin')(lnchlog).then((url)=>{
    lnch.log(`###################`)
    lnch.log(`Uploaded the log at:`)
    lnch.log(url)
    lnch.log(`###################`)
  })
})