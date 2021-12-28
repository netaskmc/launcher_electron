const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const fs = require('fs-extra');
const path = require('path');

const git = require('./git')

module.exports = function LaunchModule(altospath) {
	
	

    var ospath = process.env.PORTABLE_EXECUTABLE_DIR || __dirname;

    if (process.platform !== 'win32') ospath = altospath;

    const appDir = path.join(ospath, '/NeTaskLauncherData');

    if (!fs.existsSync(appDir)){
        fs.mkdirSync(appDir);
    }

    loggerFunction = () => {};

    

    serverdata = {
        ip: '',
        port: ''
    }

    this.modpacks = []
    this.selectedModpack = {}
	this.modpacksCallback = () => false

	this.git = new git(fs, appDir)

    this.selectModpack = function(modpack) {
        this.selectedModpack = modpack
        console.log(modpack)
        this.gameDirectory = path.join(appDir, modpack.name)
    }

    this.getModpacksCallback = function(cb) {
		this.modpacksCallback = cb
    }

    
    this.appDirectory = appDir;
    this.pathModule = path;

    this.isReady = () => {
        if (this.modpacksCallback() == false) {
            setTimeout(()=>this.isReady(), 200)
            return false
        } else {
            this.modpacks = this.modpacksCallback()
            return true
        }
    }

    this.launch = function(nickname, ram, connect, version, callback) {
        let opts = {
            clientPackage: null,
            // For production launchers, I recommend not passing
            // the getAuth function through the authorization field and instead
            // handling authentication outside before you initialize
            // MCLC so you can handle auth based errors and validation!
            authorization: Authenticator.getAuth(nickname),
            root: this.gameDirectory,
            version: {
                number: version,
                type: "release"
            },
            memory: {
                max: ram,
                min: ram
            },
            overrides: {
                detached: false,
                fw: {
                    version: '1.5.3',
                }
            },
            forge: this.gameDirectory + "/forge.jar"
        }
        
        if (serverdata.ip != serverdata.port && connect) {
            opts = {...opts, server: {
                host: serverdata.ip,
                port: serverdata.port
            }}
        }

        launcher.launch(opts);
        launcher.on('close', (e) => {callback({type: 'close', task: 0, total: 1})})
        launcher.on('progress', callback);
        launcher.on('debug', (e) => this.log(e));
        launcher.on('data', (e) => this.log(e));
    }
    this.log = function (data) {
        loggerFunction(data);
    }
    this.setLogger = function(callback) {
        loggerFunction = callback;
    }
    this.checkModpack = async function(modpack = this.selectedModpack) {
        return await this.git.checkUpdate(modpack)
    }

    this.checkAllModpacks = async function(modpacks) {
        this.modpacks = modpacks
        for (let mp in modpacks) {
            this.modpacks[mp].status = await this.checkModpack(this.modpacks[mp])
        }
        return this.modpacks
    }

    this.installModpack = async function(callback) {
        this.git.setProgressCb(callback)
        if (this.selectedModpack.status == 'uninstalled') {
            await this.git.install(this.selectedModpack)
        } else {
            await this.git.update(this.selectedModpack)
        }
    }

    this.deleteModpack = function() {
        console.log('YES')
        this.modpacks = this.modpacks.map(mp => {
            mp.status = 'deleting'
            return mp
        })
        let bckup = ['saves/', 'servers.dat', 'options.txt'];
        this.backupPaths(bckup, false);
        fs.rmdirSync(this.gameDirectory, {recursive: true});
        console.log(this.gameDirectory)
        if (!fs.existsSync(this.gameDirectory)) {
            fs.mkdirSync(this.gameDirectory);
        }
        this.backupPaths(bckup, true);
    }
    this.savePrefs = function(nick, ram, connect, selectedModpack = '') {
        fs.writeFileSync(path.join(appDir, '/prefs.json'), JSON.stringify({
            nickname: nick,
            ram,
            connect,
            selectedModpack
        }), 'utf8');
    }
    this.readPrefs = function() {
        let r = {nickname: '', ram: '', selectedModpack: '', connect: false};
        if (fs.existsSync(path.join(appDir, '/prefs.json'))) r = JSON.parse(fs.readFileSync(path.join(appDir, '/prefs.json'), 'utf8'));
        selectedModpack = r.selectedModpack
        return r;
    }
    this.delFile = function(file) {
        fs.unlinkSync(file);
    }
    this.backupPaths = function(paths, restore) {
        for (let bpath of paths) {
            rpath = path.join(appDir, '/tmp/', bpath);
            mpath = path.join(this.gameDirectory, bpath);
            if (!fs.existsSync(mpath)) continue
            if (!restore) {
                fs.moveSync(mpath, rpath);
            } else {
                fs.moveSync(rpath, mpath);
                fs.rmdirSync(rpath)
            }
        }
    }
    this.acceptModpacks = function(modpacks, onSuccess = () => {}) {
        this.modpacks = modpacks
        this.checkAllModpacks(modpacks).then(onSuccess)
    }
    this.acceptElectronDl = (dl) => this.git.acceptElectronDl(dl)
}