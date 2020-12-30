var hastebin = require('hastebin')
module.exports = async (paste) => {
    return await hastebin.createPaste(paste, {
    raw: false,
    contentType: 'text/plain',
    server: 'https://del.dog/'
    }, /* options for the 'got' module here */ {})
}