//stdio-transport.asynct

var st = require('child/stdio-transport')
  , log = require('logger')
  , EventEmitter = require('events').EventEmitter
  , equals = require('traverser/equals')

Pipe.prototype = EventEmitter.prototype
function Pipe (){
  this.write = function (data){
    this.emit('data',data)
  }
}

NoisyPipe.prototype = EventEmitter.prototype
function NoisyPipe (){
  this.write = function (data){
    this.emit('data','asdfj\nlasdjf\n')
    this.emit('data',data)
    this.emit('data','rtj\nioervn\n')
    this.emit('data','sdfasdbad\n' + Math.random())
  }
}
NoisyChunkyPipe.prototype = EventEmitter.prototype
function NoisyChunkyPipe (){
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
ChunkyPipe.prototype = EventEmitter.prototype
function ChunkyPipe (){
  this.write = function (data){
    var j = 0
    for(var i = 1; i <= data.length; i += 1){
      this.emit('data',data.slice(j,i))
      j = i
    }
  }
}
/*what if there is more than one message in a chunk?
*/
NoisyLumpyPipe.prototype = EventEmitter.prototype
function NoisyLumpyPipe (){
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
      var s = toSend
      toSend = ''
      willWrite = false
      self.emit('data',s)
    })
  }
}
function checkMessages(test,pipe,messages,done){
  var d = {pipe: pipe}
    , r = new st.Reciever(d)
    , s = new st.Sender(d)
    , i = 0

  r.recieve = check

  messages.forEach(function (message){
    s.send(message)
  });
  
  function check(data){
    log("CHECK DATA:", data)
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
  checkMessages(test,new Pipe(),messages,test.finish)
}
exports['can handle noisy pipe'] = function (test){
  checkMessages(test,new NoisyPipe(),messages,test.finish)
}
exports['can handle chunked pipe'] = function (test){
  checkMessages(test,new NoisyChunkyPipe(),messages,test.finish)
}

exports['can handle lumpy pipe'] = function (test){
  checkMessages(test,new NoisyLumpyPipe(),messages,test.finish)
}

/**/
function checkNoise(test,pipe,message,noises,done){
  var d = {pipe: pipe}
    , r = new st.Reciever(d)
    , s = new st.Sender(d)
    , noiseIn = noises.join('')
    , noiseOut = ''

  r.recieve = check

  r.noise = function (n){
    log('noise:', n)
    noiseOut += n 
//    test.finish()
  }
  pipe.write(noises.shift())
  s.send(message)
  pipe.write(noises.shift())
  s.send(message)

  function check(data){
    test.equal(data,message)
  }
  process.nextTick(c)
  
  function c (){
    test.equal(noiseOut,noiseIn)
    done()
  }

}

exports['pipe is not obstructed - noise gets through coherently'] = function (test){
  var message = "**()&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&?"

  checkNoise(test,new Pipe(),message,['noise1','noise2'],c)
  function c(){
    checkNoise(test,new ChunkyPipe(),message,['noise1\nY','noise\n2X'],test.finish)
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
