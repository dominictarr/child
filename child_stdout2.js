//child.js

//master creates slave, and then slave sends messages back.
//call master with callbacks, 
//master goes through callbacks and turns gets the name of each one.
//sends a message to slave of function names.
//slave creates functions with these names, and then calls runSuite with them

/*
  how to seperate stuff which sorts out the messaging from other stuff?
  layers which wrap each others events?

  often i need to get the child process to do strange stuff.
  need a common interface for setting up special stuff to happen on the child's side.
  
  having 'require', 'function' and onReturn isn't general enough,
    if i'm planning on interferring with behaviour of require...
*/

var xmit = require('./transmit')
  , xport = require('./stdio-transport')
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
//  log(payload)
  var it = describe(payload,'child process payload')
  
//  it.should.have.property('function')
  it.should.have.property('require')
  it.should.have.property('transport')
  it.should.have.property('args').instanceof(Array)

  var Remapper = require('remap/remapper')
    , r = new Remapper(module,payload.remap)
//    var r = {require: require}  
    log(payload.remap)

  var transport = xport

  payload.transport.pipe = process.stdout

  var xportSender = new transport.Sender(payload.transport)

  xmitSender.send = function(id,message){ //  pipe xmit.send through xport.
    xportSender.send([id,message])
  }
  
    process.on('exit',function (a,b){
      var report = 
        { loaded: r.loaded
        , depends: r.depends        
        }
      payload.remapReport && payload.remapReport(report) 
      console.error("SOFTEXIT")
      }) /* so we know when the process hasn't fatal errored - Stderr with end with SOFTEXIT*/

  adapter = r.require(payload.require)

  if(payload.function){
    var it = describe(adapter, "module loaded in child process")
      it.should.have.property(payload.function).a('function')

    returned = adapter[payload.function].apply(adapter,payload.args)

    //call the on return method.
    payload.onReturn && payload.onReturn(returned) 
  }
}

spawn = require('child_process').spawn

exports.run = run
function run (options){
  var wasSoftExit = false
    , errorBuffer = ''
    , timer
    , timedout = false
  
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
        ;
     } else if (timedout){

      options.onTimeout && options.onTimeout("TIMEOUT");
     } else {
//      log("HARD EXIT. >" + errorBuffer.trim() + "<")
      options.onError && options.onError(errorBuffer.trim());
     }

    options.onExit && options.onExit()
  }
  
  var pipe = new xport.Pipe()
  var xportR = new xport.Reciever({pipe: pipe})
  
  var payload = 
    { args: options.args || [] 
    , require: options.require
    , remap: options.remap
    , function: options.function
    , onReturn: options.onReturn
    , remapReport: options.remapReport
    , transport: xportR.descriptor }

  /*SETUP TRANPORT*/
  
  var xmitR = new xmit.Reciever()
  var json = xmitR.stringify(payload)
  xportR.recieve = 
    function (args){
      xmitR.recieve(args[0],args[1])
    }
  
  var child = 
    spawn('node' 
      , [ __filename , json ] )

//  child.stdout.on('data',function (x){ log('' + x)})

  if(options.timeout)
    timer = setTimeout(timeout,options.timeout)
  function timeout(){
    timedout = true
    child.kill()
  }

  
  child.stdout.on('data', stdout)

  xportR.noise = function (noise){
    process.stdout.write(style(noise.toString()).yellow.to_s)
  }
  function stdout(data) {
//    process.stdout.write(style(data.toString()).yellow.to_s)
    pipe.write(data)
  }

  child.stderr.on('data', stderr);

  function stderr (data) {
    errorBuffer += data.toString()
//    log(style(data.toString()).red.to_s)
  }

  child.stderr.on('close', hardExit)
//  child.on('exit',hardExit)
}

