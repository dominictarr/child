//transport.asynct.js

/*
  more complications, problem is flushing at end of process.
  
  need to use STDIO to get the last message through, 
  but i've kinda boxed myself in wih this test
  because i've made it so that it doesn't matter whether your in the same
  process or not. but using STDIO it does matter.
  
  
*/

//var format = 'child/transport' //tcp
var format = 'child/dgram-transport' // datagrams
var transport = require (format)
//var transport = require ('child/dgram-transport')
  , describe  = require ('should').describe
  , curry = require('curry')
  , inspect = require('inspect')

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

function recieveMessages(messages,recieved,test,done){
  return function (message){
      var found 
      messages.forEach(function(e){
        if('' + e == '' + message)
          found = true
      })
      console.log('done:' + inspect(message))
      var it = 
        describe(found,"whether '" + message + "' was recieved") 
          it.should.be.ok
          

      recieved.push(message)
//      console.log(messages.length,recieved.length)
      if(messages.length == recieved.length){
        messages.should.eql(recieved)
        if(done){
          return done()
          
          }
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
    
  function ready(){
    sender = new transport.Sender(reciever.descriptor)//will want to also make reciever first.
   
    reciever.recieve = recieveMessages(messages,recieved,test)
  
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
  
  reciever.recieve = recieveMessages(messages,recieved,test)
  
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
  
  reciever.recieve = recieveMessages(messages,recieved,test)
  reciever.stop()
  test.uncaughtExceptionHandler = function (error){
    var it = describe(error,"thrown when transport reciver is stopped, and a message is sent to it.")
    it.should.be.instanceof(Error)
    test.finish()
  }
  messages.forEach(sender.send)

}

/**/
/*
exports ['can send long messages'] = function (test){

  var messages = [randomList(100),randomList(200),randomList(500)]//["hello",1,5,23,7,{obj: [1,2,3,'sdfksdf']}]
    , recieved = []
    , reciever = new transport.Reciever()
    , sender = new transport.Sender (
        JSON.parse (
          JSON.stringify (
            reciever.descriptor ) ) )
  
  reciever.recieve = recieveMessages(messages,recieved,test)

  messages.forEach(sender.send)
}*/

function setup(messages,test,done){
//  console.log('setup - done:' + inspect(arguments))
  
  var recieved = []
    , reciever = new transport.Reciever()
    , sender = new transport.Sender (
        JSON.parse (
          JSON.stringify (
            reciever.descriptor ) ) )

  reciever.recieve = recieveMessages(messages,recieved,test,done)
  messages.forEach(sender.send)
}

exports ['multiple connections at once'] = function (test){

  var messages = [randomList(100),randomList(100),randomList(100),randomList(100),randomList(100)]
    , lists = 0

  
  function done(){
    lists ++
    if(lists == messages.length)
      test.finish()
  }
  messages.forEach(function(x){setup(x,test,done)})

}

exports ['can send null values'] = function (test){
  function timeout(){
    test.ok(false,'expected test to have finished by now')
  }
  var timer = setTimeout(timeout,1000)
  var messages = [{obj: null},1,null,123,42,"asdfasdgfasdg"]
    , lists = 0

  setup(messages,test,done)
  function done(){
    clearTimeout(timer)
      test.finish();
  }

}
