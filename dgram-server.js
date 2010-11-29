//dgramServer.js

var dg = require('dgram')
var n = '/tmp/datagram_hello'
var socket = dg.createSocket('unix_dgram',function(x){console.log('' + x)});
socket.bind(n)
//socket.on('message',)

//socket.on('listening',x)
//function x (){
//}
