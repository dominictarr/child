//transport.asynct.js

var transport = require ('child/transport')
  , should  = require ('should')

function randomList(n){
  var l = []
  for (var i = 0 ; i < n ; i ++ ) {
    var r = Math.random ()
    if(r < 0.3) {
      l.push(Math.random() * 1000000)
    } else if (r < 0.7){
   //   l.push({list: randomList(2)})
   l.push("sring:" + Math.random() * 1000000)
    } else {
      l.push({list: randomList(1)})
    }
  }

  return l
}

function recieveMessages(messages,test){
  return function (message){
      messages.should.contain(message)
      recieved.push(message)
      if(messages.length == recieved.length){
        messages.should.eql(recieved)
        test.finish()
      }
    }
}

exports ['sends an object through a pipe'] = function (test){

  var messages = randomList(15)//["hello",1,5,23,7,{obj: [1,2,3,'sdfksdf']}]
    , recieved = []
    , reciever = new transport.Reciever()
    , sender = new transport.Sender(reciever.descriptor)//will want to also make reciever first.
  
  reciever.recieve = recieveMessages(messages,test)
  
  messages.forEach(sender.send)
}

exports ['still works if descriptor is serialized'] = function (test){

  var messages = randomList(15)//["hello",1,5,23,7,{obj: [1,2,3,'sdfksdf']}]
    , recieved = []
    , reciever = new transport.Reciever()
    , sender = new transport.Sender (
        JSON.parse (
          JSON.serialize (
            reciever.descriptor ) ) )
  
  reciever.recieve = recieveMessages(messages,test)
  
  messages.forEach(sender.send)
}

/**/
