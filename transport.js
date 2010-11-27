//transport


exports.Reciever = Reciever
function Reciever (desc){
  var self = this
  self.descriptor = self
  self.recieve = function (message){
    console.log("recieved message:" + message)
  }
}


exports.Sender = Sender
function Sender (desc){
  var self = this
  self.descriptor = desc
  self.send = function (message){
    process.nextTick(function (){
      self.descriptor.recieve(message)
    })
  }
}

