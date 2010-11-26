/*
this is passing, although it feels quite complicated.

the format to serialize the callbacks should be taken out,
also, the messaging format should be passed though, so it's pluggable.



*/

if (module == require.main) {
  return require('async_testing').run(process.ARGV);
}

var child = require('child')
  , inspect = require('inspect')
  , should = require('should')

exports ['can run a simple test'] = function(test){

  child.runFile('meta-test/test/examples/asynct/test-all_passing',{onSuiteDone: suiteDone})

  function suiteDone(status,report){
    test.equal(status,'complete')
    test.finish()
  }
}

exports ['can make callbacks into message and back'] = function(test){

  var message = 'asdfhasdflsdlf'
  var masterCallbacks = {
    send: function(m){
      test.equal(m,message)
      test.finish()
    }
  }

  var mm = child.makeMessage(masterCallbacks)
  
  cb = child.makeCallbacks(mm,recieve)
 
  cb.send(message)
  function recieve(message){
    child.parseMessage(message,masterCallbacks)
  }
}

var example1 = {}
  example1.callbacks = 
    { send1: function(m){
//        test.equal(m,message.shift())
      }
    , send2: function(m){
  /*      test.equal(m,message.shift())
        test.finish()    */
      }
    , obj: {send3:
        function (m){/*
          test.equal(m,message.shift())
          test.equal(message.length,0)
          test.finish()*/    
      } }
  }

  example1.expected  = {
      send1:{ '[Function]': ["send1"] } 
    , send2:{ '[Function]': ["send2"] } 
    , obj:  { send3: {  '[Function]': ["obj", "send3"]  } }
    }

exports ['can make callbacks into message'] = function(test){

  var mm = child.makeMessage(example1.callbacks)
  console.log("MESSAGES", inspect(mm))


  test.deepEqual(mm,example1.expected, 
      "expected: \n" + inspect(example1.expected)
    + "\n but got: \n" + inspect(mm))

test.finish()
}

exports ['makeMessage perserve collection type'] = function (test){
  var mm1 = child.makeMessage([])
  mm1.should.be.instanceof(Array)
  var mm2 = child.makeMessage({})

  mm2.should.not.be.instanceof(Array)
  mm2.should.be.instanceof(Object)

  test.finish()
}

exports ['makeCallbacks perserve collection type'] = function (test){
  var mm1 = child.makeCallbacks([])
  mm1.should.be.instanceof(Array)
  var mm2 = child.makeCallbacks({})

  mm2.should.not.be.instanceof(Array)
  mm2.should.be.instanceof(Object)

  test.finish()
}


exports ['can make message into callbacks'] = function (test){

  cb = child.makeCallbacks(example1.expected,sender)
  console.log("CALLBACKS")
  console.log(inspect(cb))
  
  test.equal(typeof cb.send1, 'function')
  test.equal(typeof cb.send2, 'function')
  test.equal(typeof cb.obj.send3, 'function')
  
  var funcs = 
    [ [ 'send1' ]
    , [ 'send2' ]
    , [ 'obj','send3' ] ]
  var messages = ['hello','message2','js']
  
  function sender(args){
    test.deepEqual(funcs.shift(),args[0])
    test.deepEqual([messages.shift()],args[1])
  }
  cb.send1("hello")
  cb.send2("message2")
  cb.obj.send3("js")

  test.finish()
}

/*
  testing too much here, it's a head fuck.


*/
exports ['parseMessage can call nested callbacks'] = function (test){

  obj = {test: test}  
  child.parseMessage([['ok'],[true]],test)
  child.parseMessage([['test','finish'],[]],obj)
}


exports ['can make callbacks into message and back, at any depth'] = function(test){


  var message = ['asdfhasdflsdlf' ,'sdfghuvnrowef' , 'dfjkmlknmlfgmb']
    , sending = [].concat(message)
  var masterCallbacks = 
    { send1: function(m){
        test.equal(m,message.shift())
      }
    , send2: function(m){
        test.equal(m,message.shift())
      }
    , obj: {send3:
        function (m){
          test.equal(m,message.shift())
          test.equal(message.length,0)
          test.finish()    
      } }
  }

  mm = child.makeMessage(masterCallbacks)
  console.log("MESSAGES", inspect(mm))
  
  cb = child.makeCallbacks(mm,recieve)

  console.log("CALLBACKS", inspect(cb))

  test.equal(typeof cb.send1,'function')
  test.equal(typeof cb.send2,'function')
  test.equal(typeof cb.obj.send3,'function')

  cb.send1(sending[0])
  cb.send2(sending[1])
  cb.obj.send3(sending[2])
  function recieve(message){
    console.log('recieve message:' + inspect(message))
    child.parseMessage(message,masterCallbacks)
  }
}


exports ['accepts test adapter'] = function (test){
  var calls = ['onTestStart','onTestDone','onSuiteDone','onExit']
  var callbacks = { adapter: "child/test/lib/dummy_test_adapter" }
  
  calls.forEach(each)
  
  function each(fName){
    callbacks[fName] = function (status,data){
      thisCall = calls.shift()
      console.log("dummy test adapter called: " + thisCall + " expected:" + fName)
      test.equal(thisCall,fName)
      test.equal(status,fName)
      test.deepEqual(data , {test: "dummy_test_adapter: " + fName, object: {magicNumber: 123471947194 } } )
      
      if (calls.length == 0) {
        test.finish()
      }
    }
  }

  child.runFile("child/test/lib/magic_number" ,callbacks)
}

exports ['calls onSuiteDone(\'loadError\') if child did not exit properly.'
            + ' example: syntax error'] = function (test) {
            
  var callbacks = 
      { adapter: "child/test/lib/dummy_test_adapter" 
      , onSuiteDone: done }
      
  function done(loadError,data){
    test.equal(loadError,'loadError')
    test.finish()
  }

  child.runFile("child/test/lib/test-error_syntax" ,callbacks)
}

exports ['calls onSuiteDone(\'loadError\') does not confuse stderr with real loadError.'] = function (test) {

  var callbacks = 
      { adapter: "child/test/lib/dummy_test_adapter" 
      , onSuiteDone: done }
      
  function done(onSuiteDone,data){
    test.equal(onSuiteDone,'onSuiteDone')
    process.nextTick(test.finish)
  }

  child.runFile("child/test/lib/stderr" ,callbacks)
}

exports ['calls onSuiteDone(\'loadError\') does not confuse stderr with real loadError.2'] = function (test) {

  var callbacks = 
      { adapter: "child/test/lib/dummy_test_adapter" 
      , onSuiteDone: done }
      
  function done(onSuiteDone,data){
    test.equal(onSuiteDone,'onSuiteDone')
    process.nextTick(test.finish)
  }

  child.runFile("child/test/lib/stderr" ,callbacks)
}
/*
*/


exports ['can load an run an arbitary function'] = function (test){

  var rand = Math.random()
  child.run(
    { require: 'child/test/example/callback'
    , function: 'returnArg'
    , args: [rand]
    , onReturn: returned } )
  //run(require,function,[args],return)
  function returned (r){
    test.equal(r,rand)
    test.finish()
  }
}


/**/

