//transport
var net = require('net')
var dg = require('dgram')
var log = console.log
function makeSocket(desc){
  return ;
}

exports.Reciever = Reciever
function Reciever (desc,ready){
  var self = this
  self.descriptor = 
    desc ||
    { format: 'child/dgram-transport'
    , encoding: 'utf-8'
    , socket: '/tmp/dgram-transport-' + Math.round(1000 + Math.random() * 40000 ) }

  var socket = dg.createSocket('unix_dgram')
  socket.bind(self.descriptor.socket)

  socket.on('message',data)
  log("Reciever")
  log(self.descriptor)
  if(ready)
    socket.on('listening',ready)
  
  socket.on('close',function (){
//    log("CLOSED!")
  })
  
  function data (m){
    m = '' + m
//    log("data >'"+m.toString('utf-8')+"'")
    if(''+m == 'END'){
//      log('CLOSE!!!')
      return socket.close()
    }

    m.split('\n').forEach(line)
    
    function line (e){
      if(e !== null){
//      log("line >'"+e.toString('utf-8')+"'")
//        log(e)
        var parsed = JSON.parse(e.toString('utf-8'))
        self.recieve(parsed)
        } } }

  self.recieve = function (message){
    log("recieved message:" + message)
  }
}

exports.Sender = Sender
function Sender (desc){
  var self = this
  self.descriptor = desc
  var queue = []  
  log("Sender")
  log(self.descriptor)

  var socket = dg.createSocket('unix_dgram')

  var sending = null
  var ended = false
  function send (){
      if(sending)
        return
      
      sending = [queue.shift()]
      if(sending == '')
        return
      var message = sending.map(function(c){return JSON.stringify(c)}).join('\n')
      var b = new Buffer("" + message)

      socket.send(b,0,b.length,self.descriptor.socket, c)

      function c(err,bytes){
        if(!bytes){
          queue.unshift(sending[0])
          sending = null
          return process.nextTick(send)
        }
        if(err) throw err
        sending = null
        if(queue.length == 0 & !ended){
            sending = ["END"]
            ended = true
            var b = new Buffer("END")
            socket.send(b,0,b.length,self.descriptor.socket, c)
        }
      }
  }

  self.send = function (message){
    queue.push(message)
    process.nextTick(send)
  }
}

