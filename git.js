const path = require('path')
const Ungit = require('./ungit')
const ungit = new Ungit()


function Git(fs, appDir) {

    var onProgress = () => {}


    this.setProgressCb = (cb) => {
        onProgress = cb
    }

    var nowUpdating = []

    this.checkUpdate = async (modpack) => {
        
        let dir = path.join(appDir, modpack.name)
        if (nowUpdating.includes(modpack.name)) return "updating"

        if (modpack.git == undefined) return null
        // Get last remote commit
        let remoteCommit = await ungit.remoteRefs({http, fs, url: modpack.git})

        // Get last local commit
        try {
            var localCommit = await ungit.localRefs({http, fs, dir, depth: 1})
        } catch (err) {
            //if (err.name == "NotFoundError") return "uninstalled"
            throw err
        }
        
        // Comparing the two
        if (remoteCommit == localCommit) return "installed"
        else return "updateable"
    }

    this.update = async (modpack) => {
        let dir = path.join(appDir, modpack.name)

        nowUpdating.push(modpack.name)
        await isogit.pull({http, fs, dir, url: modpack.git, onProgress, author: {name: 'ntml'}})
        nowUpdating = nowUpdating.filter(v => v != modpack.name)
    }

    this.install = async (modpack) => {
        let dir = path.join(appDir, modpack.name)
        nowUpdating.push(modpack.name)
        await ungit.clone({http, fs, dir, url: modpack.git, onProgress})
        nowUpdating = nowUpdating.filter(v => v != modpack.name)
    }


}

module.exports = Git