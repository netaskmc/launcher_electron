const isogit = require('isomorphic-git')
const path = require('path')
const http = require("isomorphic-git/http/node");

const digInObjectPath = (arrPath, obj) => {
    var state = obj
    for (let p of arrPath) { state = state[p] }
    return state
}

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
        let remoteInfo = await isogit.getRemoteInfo({http, fs, url: modpack.git})
        let remoteCommit = digInObjectPath(remoteInfo.HEAD.split('/'), remoteInfo)

        // Get last local commit
        try {
            var localLog = await isogit.log({http, fs, dir, depth: 1})
        } catch (err) {
            if (err.name == "NotFoundError") return "uninstalled"
            throw err
        }
        let localCommit = localLog[0].oid
        
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
        await isogit.clone({http, fs, dir, url: modpack.git, onProgress})
        nowUpdating = nowUpdating.filter(v => v != modpack.name)
    }

    this.init = async (modpack) => {
        let dir = path.join(appDir, modpack.name)
        
        await isogit.init({ fs, dir })
    }

}

module.exports = Git