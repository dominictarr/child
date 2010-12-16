//stdio-transport

var messages = require('./messages2')

exports.Reciever = Reciever

function Reciever(desc,ready){
  process.nextTick(ready)
  var self = this

  self.descriptor = desc || {}

  self.magic = desc ? messages(desc.start,desc.end) : messages()

/*
  write stdio-transport which uses only stdio.
*/

  self.recieve = function (message){
    log("recieved message:" + message)
  }
}
