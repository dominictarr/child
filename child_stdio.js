/*
  I got this piping over stdio, but immediately felt it was too klugey 
  so decided to rewrite it.
*/


var messages = require('./messages2')
  , assert = require('assert')
  , inspect = require('inspect')    
  , util = require('util')
  , log = console.log

if (module == require.main) {
  log("CHILD VIA STDIO")

  process.ARGV.shift()//node
  process.ARGV.shift()//__filename
  json = process.ARGV.shift()

  var opts = JSON.parse(json)

  assert.ok(opts.start  ,"expected .start : ~magic number~")
  assert.ok(opts.end    ,"expected .end : ~magic number~")
  assert.ok('object' === typeof opts.payload   ,"expected .payload : object")
  assert.ok('string' === typeof opts.require   ,"expected .require : string")

  /*
    okay, rework this, to load and call anything in another process.
    
    pass the module to require, the function to call and the arguments.
    
    messages will need to be upgraded find functions at each level of nesting.  
  */

  var messager = messages.useMagicNumbers(opts.start,opts.end)
    , func = opts.function
    , payload = makeCallbacks(opts.payload,send)
//    log("PAYLOAD:" + inspect(opts.payload))

//  process.on('exit',payload.onExit)
  process.on('exit',function (){
    console.error("SOFTEXIT")
  })

  function send(message){
    log(messager.messageEncode(message))
  }

  adapter = require(opts.require)

  //  adapter = require(options.adapter || 'async_testing/lib/asynct_adapter')

  assert.equal(typeof adapter[func],'function', 'expected: require(\'' + opts.require + '\')[\'' + func + '\']')
  returned = adapter[func].apply(adapter,payload.args)
  payload.onReturn && payload.onReturn(returned)
  
  //  throw Error("!")
}

spawn = require('child_process').spawn

//master creates slave, and then slave sends messages back.
//call master with callbacks, 
//master goes through callbacks and turns gets the name of each one.
//sends a message to slave of function names.
//slave creates functions with these names, and then calls runSuite with them

exports.run = run
function run (options){
  var normalExit = false
    //, oldOnExit = options.onExit
    , timer
    , timedout = false
    , exited = false
    , errorBuffer = ''

  function childExit(status,report){
      log("child EXIT. >" + errorBuffer.trim() + "<")
     if(/SOFTEXIT$/.exec(errorBuffer.trim())){
     } else if (timedout){
      options.onTimeout && options.onTimeout("TIMEOUT");
     } else {
      log("HARD EXIT. >" + errorBuffer.trim() + "<")
      options.onError && options.onError(errorBuffer.trim());
     }

      log("EXIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! >" + errorBuffer.trim() + "<")
     options.onExit && options.onExit()
  }

  magic = messages.magicNumbers
  child = 
    spawn('node' 
      , [ __filename
        , json = JSON.stringify (
          { start: magic.start
          , end: magic.end
          , function: options.function
          , require: options.require
          , payload: makeMessage(
            { args: options.args || [] 
            , onReturn: options.onReturn
              } ) } ) ] )

  child.on('exit',childExit)

  if(options.timeout)
    timer = setTimeout(timeout,options.timeout)

  function timeout(){
    timedout = true
    child.kill()
  }

  var buffer = ''
    , messager = messages.useMagicNumbers(magic.start,magic.end)
  child.stdout.on('data', function(data) {
    data = data.toString();

    var lines = data.split('\n');

    log(data)
    lines[0] = buffer + lines[0];
    buffer = lines.pop();

    lines = messager.messageDecode(lines);

    lines.forEach(function (message){
      if(message)
        parseMessage(message,options)
    })
  })
  child.stderr.on('data', function(data) {
    errorBuffer += data.toString();
  });

}

exports.runFile = runFile
function runFile (file,options) {
  var req = options.adapter || 'async_testing/lib/asynct_adapter'

  run({ require: req
      , function: 'runTest'
      , args: [file, options]
      , onError: errorToSuiteDone })
      
 function errorToSuiteDone(error){
  options.onSuiteDone && options.onSuiteDone('loadError', 
  { suite: file
  , filename: file
  , status: 'loadError'
  , error: error
  
  })
 }
}

function eachKey(obj,func){
  for(i in obj){
    func(obj[i],i)
  }
}

exports.makeMessage = makeMessage
function makeMessage(callbacks,path){
  path = path || []
  var message = (callbacks instanceof Array) ? [] : {} 
  
  eachKey(callbacks,function(cb,i){
    if(({object: 1, function:1})[typeof cb]) {
      if('function' === typeof cb) {
        message[i] = 
          {'[Function]': [].concat(path).concat([i])}
      } else {
        var m =  makeMessage(cb,[].concat(path).concat([i]))
        message[i] = m
      }
    } else {
      
      message[i] = cb
    }
  })
  log("returning :", inspect(message))
  return message  
}

exports.makeCallbacks = makeCallbacks

function makeCallbacks(message,sender){
  var callbacks = (message instanceof Array) ? [] : {} 

  for(i in message){
    (function (j){
      var path
      if (message[j])
        path = message[j]['[Function]']
      if(path){
        callbacks[j] = function (){
          args = []
          for(i in arguments){
            args[i] = arguments[i]
          }
          sender.call(null,[path,args])
        }
      } else if ('object' == typeof message[j]){
        callbacks[j] = makeCallbacks(message[j],sender)
      } else {
        callbacks[j] = message[j]
      }
    })(i)
  }
  return callbacks
}

exports.parseMessage = parseMessage
function parseMessage (message,callbacks){
  console.log('call [' + message[0].join(',') + '](' + message[1].join(',') + ')')
  var cb = callbacks
  message[0].forEach(function (key){
    cb = cb[key]
  })
  if(!cb){
    throw new Error(["expected: ", inspect(callbacks),
      "to have a function at", message[0].join('.')].join(' '))
  }
  cb.apply(callbacks,message[1])
}


