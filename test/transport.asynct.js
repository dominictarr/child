//transport.asynct.js

/*
  TEST FOR REALLY BIG MESSAGES. (that will get chunked!)


  okay, I have two modules which pass this test.

  I suspect that i've gone a little far in incorperating
  the startup and closing into the same modules.
  
  that kinda wants to be seperated. 
  
  on start, it polls until it makes a connection,
  then it queues messages to give a more linear interface.
  
  then when it's finished it closes again.
  
  this is exactly what I need for running tests.
  
  ---okay, now plug this back into the other child stuff?
*/

var format = 'child/transport' //tcp
//var format = 'child/dgram-transport' // datagrams
var transport = require (format)
//var transport = require ('child/dgram-transport')
  , describe  = require ('should').describe

function randomList(n){
  var l = []
  for (var i = 0 ; i < n ; i ++ ) {
    var r = Math.random ()
    if(r < 0.3) {
      l.push(Math.random() * 1000000)
    } else if (r < 0.7){

   l.push("sring:" + Math.random() * 1000000)
    } else {
      l.push({list: randomList(1)})
    }
  }

  return l
}

function recieveMessages(messages,test,recieved){
  return function (message){
      var found 
      messages.forEach(function(e){
        if('' + e == '' + message)
          found = true
      })
      var it = 
        describe(found,"whether '" + message + "' was recieved") 
          it.should.be.ok

      recieved.push(message)
//      console.log(messages.length,recieved.length)
      if(messages.length == recieved.length){
        messages.should.eql(recieved)
        test.finish()
      }
    }
}
/*
exports ['sends an object through a pipe'] = function (test){
  console.log('sends an object through a pipe')
  var messages = randomList(150)//["hello",1,5,23,7,{obj: [1,2,3,'sdfksdf']}]
    , recieved = []
    , reciever = new transport.Reciever()
    , sender = null
    
//  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&:" + reciever)

  function ready(){
    sender = new transport.Sender(reciever.descriptor)//will want to also make reciever first.
   
    reciever.recieve = recieveMessages(messages,test,recieved)
  
    messages.forEach(sender.send)
    console.log("sending done!")
  }
}/**/

exports ['still works if descriptor is serialized'] = function (test){

  var messages = randomList(100)//["hello",1,5,23,7,{obj: [1,2,3,'sdfksdf']}]
    , recieved = []
    , reciever = new transport.Reciever()
    , sender = new transport.Sender (
        JSON.parse (
          JSON.stringify (
            reciever.descriptor ) ) )
  
  reciever.recieve = recieveMessages(messages,test,recieved)
  
  messages.forEach(sender.send)
}

exports ['description.format is the module to use'] = function (test){
  var r = new transport.Reciever()

  var it = 
    describe(r,"a new tranport reciever object")
  it.should.have.property('descriptor')
  var it = 
    describe(r.descriptor,"transport descriptor")
  it.should.have.property('format')
  var it = 
    describe(require.resolve(r.descriptor.format),"require.resolve(transport format)")
  it.should.eql(require.resolve(format))

  test.finish()
}

/**/

exports ['can stop Reciever'] = function (test){

  var messages = randomList(1)//["hello",1,5,23,7,{obj: [1,2,3,'sdfksdf']}]
    , recieved = []
    , reciever = new transport.Reciever()
    , sender = new transport.Sender (
        JSON.parse (
          JSON.stringify (
            reciever.descriptor ) ) )
  
  reciever.recieve = recieveMessages(messages,test,recieved)
  reciever.stop()
  test.uncaughtExceptionHandler = function (error){
    var it = describe(error,"thrown when transport reciver is stopped, and a message is sent to it.")
    it.should.be.instanceof(Error)
    test.finish()
  }
  messages.forEach(sender.send)

}
/**/
