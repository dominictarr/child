//transport
var net = require('net')
  , log = console.log
  , curry = require('curry')
    
exports.Reciever = Reciever
function Reciever (desc,ready){
  var self = this
  self.descriptor = desc ||
    { format: 'child/std-transport' }

  var server = net.Server(
    function (s) { 
      s.setEncoding(self.descriptor.encoding)
      var cur = ''
      s.on('data',
        function(d){
          //not optimal, but easy. room for improvement later.
          d.split('').forEach(function (e){
            cur += e
            if(e === '\n'){

              self.recieve(JSON.parse(cur))
              cur = ''
            } } ) } ) 
      s.on('end',function(){
        s.end()
        } ) } )
  server.listen(self.descriptor.port,ready)
  
  self.recieve = function (message){
    log("recieved message:" + message)
  }

  self.stop = //curry(server.close,server)
    function (){
      server.close()
    }
}

exports.Sender = Sender
function Sender (desc){
  var self = this
  self.descriptor = desc
  var connection = null
  var tries = 0
  var queue = []  
  
  function connect (){
    if(connection)
      return
    try{
    connection  = net.createConnection(self.descriptor.port)
    connection.setEncoding(self.descriptor.encoding)

    } catch (err){
      tries ++ 
      if(tried > 10)
        throw err
      process.nextTick(connect)
    }
  }
//  self.stop = disconnect
  function disconnect (){

    if(connection){
      connection.end()
      connection = null
    }
  }

  var waiting = false

  function send (){

    if(!connection){
      process.nextTick(send)
      return process.nextTick(connect)
    }
    while(queue.length > 0) {
      var message = queue.shift()
      connection.write(JSON.stringify(message) + '\n',self.descriptor.encoding)
    }
    setTimeout(disconnect,200)
  }

  self.send = function (message){
    queue.push(message)
    
    process.nextTick(send)
  }
}

