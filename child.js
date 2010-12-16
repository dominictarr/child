//child.js

//master creates slave, and then slave sends messages back.
//call master with callbacks, 
//master goes through callbacks and turns gets the name of each one.
//sends a message to slave of function names.
//slave creates functions with these names, and then calls runSuite with them

var xmit = require('./transmit')
  , xport = require('./transport')
//  , xport = require('./dgram-transport')
  , style = require('style')
  , log = console.log

var describe = require('should').describe
if (module == require.main) {

  log('child process starts')

  process.ARGV.shift()//node
  process.ARGV.shift()//__filename
  json = process.ARGV.shift()


  var xmitSender = new xmit.Sender()
  var payload = xmitSender.parse(json)
  log(payload)
  var it = describe(payload,'child process payload')
  
  it.should.have.property('function')
  it.should.have.property('require')
  it.should.have.property('transport').with.property('format').a('string')
  it.should.have.property('args').instanceof(Array)

  var transport = xport
  var xportSender = new transport.Sender(payload.transport)

  xmitSender.send = function(id,message){ //  pipe xmit.send through xport.
    xportSender.send([id,message])
  }
  
//  if(payload.onExit){
    log('will send exit')
    process.on('exit',function (a,b){
      log('EXIT!')
      console.error("SOFTEXIT")
  //    payload.onExit(a,b)
      }) /* so we know when the process hasn't fatal errored*/
  //}
  adapter = require(payload.require)

  var it = describe(adapter, "module loaded in child process")
    it.should.have.property(payload.function).a('function')

  returned = adapter[payload.function].apply(adapter,payload.args)

  //call the on return method.
  payload.onReturn && payload.onReturn(returned) 
}

spawn = require('child_process').spawn

exports.run = run
function run (options){
  var wasSoftExit = false
    , errorBuffer = ''
    , timer
    , timedout = false
  
  /*function softExit(status,report){
    wasSoftExit = true;
  }*/
     /*
     heh, I don't think my tcp was getting flushed before exiting,
     then i came up with this elegant hack.
     in on('exit',...) write SOFTEXIT to stderr.
     if stderr ends with "SOFTEXIT" it's been a soft exit, so no errors.
     else, it was a fatal error.
     
     of course, this breaks when the change behaviour in later node versions.
     */
  function hardExit(status,report){

     if(/SOFTEXIT$/.exec(errorBuffer.trim())){
//      log("ignoring stderr. >" + errorBuffer.trim() + "<")
     } else if (timedout){
//      log("TIMEOUT after " + options.timeout + " ms!")
      options.onTimeout && options.onTimeout("TIMEOUT");
     } else {
      log("HARD EXIT. >" + errorBuffer.trim() + "<")
      options.onError && options.onError(errorBuffer.trim());
     }
//    }
    xportR.stop()
    options.onExit && options.onExit()
  }
  

  var xportR = new xport.Reciever()
  
  var payload = 
    { args: options.args || [] 
    , require: options.require
    , function: options.function
   // , onExit : softExit //options.onExit 
    , onReturn: options.onReturn
    , transport: xportR.descriptor  }

  /*SETUP TRANPORT*/
  
  xmitR = new xmit.Reciever()
  var json = xmitR.stringify(payload)
  xportR.recieve = 
    function (args){
      log(args)
      xmitR.recieve(args[0],args[1])
    }
  
  child = 
    spawn('node' 
      , [ __filename , json ] )

  if(options.timeout)
    timer = setTimeout(timeout,options.timeout)
  function timeout(){
    timedout = true
    child.kill()
  }

  
  child.stdout.on('data', stdout)

  function stdout(data) {
    log('' + style(data.toString()).yellow )
  }

  child.stderr.on('data', stderr);

  function stderr (data) {
    errorBuffer += data.toString()
    log('', style(data.toString()).red)
  }

  child.stderr.on('close', hardExit)
//  child.on('exit',hardExit)
}

