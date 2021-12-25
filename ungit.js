const request = require('request')
const fs = require('fs')
const path = require("path")

function Ungit() {

    this.dlzip = async (url) => {
        
    }

    this.unzip = async (path) => {
        
    }

    this.clone = async (opts) => {
        
    }

    this.remoteRefs = (opts) => new Promise((resolve, reject) => {
        request(opts.gitUrl + '/info/refs', {}, (e, r, b) => {
            if (e) reject(e)
            resolve(b)
        })
    })

    this.localRefs = async (opts) => {
        return fs.readFileSync(path.join(opts.dir + ".ungit"), "utf-8")
    }

}