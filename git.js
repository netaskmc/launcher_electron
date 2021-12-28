const path = require('path')
const Ungit = require('./mcungit')
const ungit = new Ungit()


function Git(fs, appDir) {

    var onProgress = () => {}


    this.setProgressCb = (cb) => {
        onProgress = cb
    }

    var nowUpdating = []

    this.checkUpdate = async (modpack) => {
        console.log('bruh')
        let dir = path.join(appDir, modpack.name)
        if (nowUpdating.includes(modpack.name)) return "updating"

        if (modpack.git == undefined) return null
        // Get last remote commit
        let remoteCommit = await ungit.remoteRefs({url: modpack.git})

        // Get last local commit
        var localCommit = await ungit.localRefs({dir, depth: 1})
        
        if (localCommit == null) return "uninstalled"
        // Comparing the two
        if (remoteCommit == localCommit) return "installed"
        else return "updateable"
    }

    this.update = async (modpack) => {
        let dir = path.join(appDir, modpack.name)

        nowUpdating.push(modpack.name)
        await ungit.pull({dir, zip: modpack.git_repo_dl, url: modpack.git, onProgress})
        nowUpdating = nowUpdating.filter(v => v != modpack.name)
    }

    this.install = async (modpack) => {
        let dir = path.join(appDir, modpack.name)
        nowUpdating.push(modpack.name)
        await ungit.clone({dir, zip: modpack.git_repo_dl, url: modpack.git, onProgress})
        nowUpdating = nowUpdating.filter(v => v != modpack.name)
    }

    this.acceptElectronDl = (dl) => ungit.acceptElectronDl(dl)

}

module.exports = Git