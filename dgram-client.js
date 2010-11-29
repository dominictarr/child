
var dg = require('dgram')
var n = '/tmp/datagram_hello'
var socket = dg.createSocket('unix_dgram');

  var buffer = new Buffer("dasflasdjflajsglkjavilnserivno65344526$E^@*^*(&^$*sei afuihsdic basdihu83r9236g45f2456r")
  socket.send(buffer, 0, buffer.length, n,function (err, bytes) {
      if (err) {
        throw err;
      }
      console.log("Wrote " + bytes + " bytes to socket.");
    } )

