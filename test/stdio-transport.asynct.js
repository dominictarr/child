//stdio-transport.asynct

var st = require('child/stdio-transport')
  , log = require('logger')
  , EventEmitter = require('events').EventEmitter
  , equals = require('traverser/equals')

Pipe.prototype = new EventEmitter()
function Pipe (){
  this.write = function (data){
    this.emit('data',data)
  }
}

NoisyPipe.prototype = new EventEmitter()
function NoisyPipe (){
  this.write = function (data){
    this.emit('data','asdfj\nlasdjf\n')
    this.emit('data',data)
    this.emit('data','rtj\nioervn\n')
    this.emit('data','sdfasdbad\n' + Math.random())
  }
}
ChunkyPipe.prototype = new EventEmitter()
function ChunkyPipe (){
  this.write = function (data){
    var j = 0
    this.emit('data','asdfjlasdjf\n')
    for(var i = 1; i <= data.length; i += 1){
      this.emit('data',data.slice(j,i))
      j = i
    }
    this.emit('data','dsf' + Math.random())
  }
}
/*what if there is more than one message in a chunk?
*/
LumpyPipe.prototype = new EventEmitter()
function LumpyPipe (){
  var toSend = ''
    , willWrite = false
    , self = this
  self.write = function (data){
    toSend += data    
    writeNext()
  }
  function writeNext(){
    if(willWrite)
      return
    willWrite = true

    process.nextTick(function (){
      self.emit('data',toSend)
      toSend = ''
      willWrite = false
    })
  }
}
function checkMessages(test,pipe,messages,done){
  var d = {pipe: pipe}
    , r = new st.Reciever(d)
    , s = new st.Sender(d)
    , i = 0

  log(d)
    
  r.recieve = check

  messages.forEach(function (message){
    s.send(message)
  });
  
  function check(data){
    log("CHEK DATA:",data)
    test.equal(data,messages[i++])
    if(i == messages.length)
      done()
  }
}


exports['can send messages'] = function (test){
      var d = {pipe: new Pipe()}
    , r = new st.Reciever(d)
    , s = new st.Sender(d)
    , message = "**()&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&?"
    
    r.recieve = check
    s.send(message)
    
    function check(data){
      log(data)
      test.equal(data,message)

      test.finish()
    }
}


var messages = 
      [ "**()&&&&&&&&&&&&\n&&&&&&&&&\n&&&&&&&&&&&&&&&&&&&&&&x"
      , "123\n"
      , 'xxxxxx\nyyyyyy'
      , 'ydydydyd' ]

exports['can multiple messages'] = function (test){
//  throw new Error()
  checkMessages(test,new Pipe(),messages,test.finish)
}
exports['can handle noisy pipe'] = function (test){
  checkMessages(test,new NoisyPipe(),messages,test.finish)
}

exports['can handle chunked pipe'] = function (test){
  checkMessages(test,new ChunkyPipe(),messages,test.finish)
}

exports['can handle lumpy pipe'] = function (test){
  checkMessages(test,new LumpyPipe(),messages,test.finish)
}

/**/
exports['pipe is not obstructed - noise gets through coherently'] = function (test){
  var pipe = new Pipe()
    , d = {pipe: pipe}
    , r = new st.Reciever(d)
    , s = new st.Sender(d)
    , message = "**()&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&?"
    , noiseIn = 'noise1noise2'
    , noiseOut = ''
  r.recieve = check

  r.noise = function (n){
    log('noise:', n)
    noiseOut += n 
//    test.finish()
  }
  pipe.write("noise1")
  s.send(message)
  pipe.write("noise2")
  s.send(message)
   
  function check(data){
    test.equal(data,message)
  }
  process.nextTick(c)
  
  function c (){
    test.equal(noiseOut,noiseIn)
    test.finish()
  }
}

exports ['pipe can send circular structures'] = function (test){

      var d = {pipe: new Pipe()}
    , r = new st.Reciever(d)
    , s = new st.Sender(d)
    , message = [1,2,3]
    message.push(message)
    
    r.recieve = check
    s.send(message)
    
    function check(data){
      test.equal(data[0],1)
      test.equal(data[1],2)
      test.equal(data[2],3)
      test.ok(data[3] === data)

      test.finish()
    }
}
//*//
