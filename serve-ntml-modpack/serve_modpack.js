const fs = require('fs')
const express = require('express')
const app = express()
const port = 3000
const modpack_folder = 'modpack'


app.use('/files', express.static(modpack_folder))

function dirStruct(dir) {
    var obj = fs.readdirSync(dir).map(el => (el.split('.').length == 1 ? 'dir:' + el : el))
    for (let d in obj) {
        if (!obj[d].startsWith('dir:')) continue
        let dirName = obj[d].replace('dir:', '')
        obj[d] = {dir: dirName, files: dirStruct(dir + '/' + dirName)}
    }
    return obj
}

function getModpack() {
    const cfg = JSON.parse(fs.readFileSync('./modpack/modpack.json', 'utf-8'))
    cfg.base = '/files/' + cfg.base
    cfg.img = '/files/' + cfg.img
    cfg.mod_path = '/files/mods/'
    cfg.mods = dirStruct('./' + modpack_folder + '/mods/')

    return cfg
}

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(getModpack())
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})