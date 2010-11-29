/*    var client = require('net').createConnection(8000)
    client.write('hello!fsdafshadkfhsdklfhsdklhsdkghkl')
    client.end()
    client.setKeepAlive(false)
    console.log('sent')

*/

//var desc = JSON.parse(process.argv[2])

var desc = 
    { format: 'tcp'
    , encoding: 'utf-8'
    , port: 8000 }

var Sender = require('./transport').Sender
var s = new Sender(desc)

console.log(s)
s.send('!@#$%^ asdfhlasdjgljglvk dweiofndkfsodithjgvs')
