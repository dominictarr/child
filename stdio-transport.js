//stdio-transport

//var messages = require('./messages2')
  var log = require('logger')
    , EventEmitter = require('events').EventEmitter
    , stringify = require('traverser/untangle').stringify
    , parse = require('traverser/untangle').parse
/*    , stringify = JSON.stringify
    , parse = JSON.parse*/


exports.Reciever = Reciever
exports.Sender = Sender
exports.Pipe = Pipe

Pipe.prototype = new EventEmitter()
function Pipe (){
  this.write = function (data){
    this.emit('data',data)
  }
}

function Reciever(desc,ready){
  if(ready)
    process.nextTick(ready)
  var self = this
  self.descriptor = desc || {}
  
  desc.start = '<"' + Math.round(Math.random() * 100000000) + '-'
  desc.end = '-' + Math.round(Math.random() * 100000000) + '">'
  self.pipe = desc.pipe
  
  var x = new RegExp('(.*?)' + desc.start + '(.*?)' + desc.end)
  var soFar = ''
  
  self.pipe.on('data',parseMessage)

  function parseMessage (data){
    soFar += data
    var m = x.exec (soFar)
    if(m){
      self.recieve(parse(m[2]))
      self.noise(m[1])//just the preceding noise
      soFar = soFar.replace(x,'')
  /*
  if a match was found, call parseMessage again with empty input.
  
  just incase two messages have come through at once.
  dont add any more data, but check if there was another
  message.
  Man. I caused a massive weird bug by calling parseMessage(soFar)
  took ages to find it and it was something stupid i did because
  i didn't understand my own code.
  
   ... a valuable lesson for cheap ...
  */
   parseMessage('')

    } 
  }
  self.recieve = function (message){
  //  log("recieved message:" + message)
  }
  self.noise = function (noise){
  //  log("noise:>>>" + JSON.stringify(noise) + "<<<")
  }
}

function Sender (desc){
  var self = this
  self.send = send
  self.pipe = desc.pipe
 
  function send(message){
//    log('send >>>', message ,'<<<')
    self.pipe.write(desc.start + stringify(message) + desc.end)  
  }
}
