var child = require('child/child_stdout2')
//var child = require('child/child_stdio')
//var child = require('child/child')
  , inspect = require('inspect')
  , describe = require('should').describe
  , log = require('logger')
  , helper = require('async_helper')
/*

now that this is rewritten I feel much more confidant.

*/

exports ['can load and run an arbitary function'] = function (test){

  var rand = Math.random()
  child.run(
    { require: 'child/test/lib/callback'
    , function: 'returnArg'
    , args: [rand]
    , onReturn: returned } )
  //run(require,function,[args],return)
  function returned (r){
    var it = 
      describe(r,'returned value from require(\'child/test/example/callback\').returnArg(' + rand + ')')
    it.should.eql(rand)
    test.finish()
  }
}

exports ['does not call anything if .function undefined'] = function (test){

  var rand = Math.random()
    , isCalled = helper.callChecker(1000,test.finish)
  child.run(
    { require: 'child/test/lib/callback'
    , args: [rand]
    , onReturn: isCalled(function returned (){}).times(0)
    , onError: isCalled(function error (){}).times(0)
    , onExit: isCalled(function exit (){})
     } )
}


/*
  throw an error
  call call backs
*/

exports ['calls onError if there is an error'] = function (test){

  var rand = Math.random()
  child.run(
    { require: 'child/test/lib/syntax_error'
    , function: 'returnArg'
    , args: [rand]
    , onError: error } )

  function error (r){
    var it = 
      describe(r,"syntax error in required module in child process")
    it.should.include.string('SyntaxError')
    test.finish()
  }
}
exports ['calls onError if there is an error, async'] = function (test){

  var rand = Math.random()
  child.run(
    { require: 'child/test/lib/delayed-syntax-error'
    , function: 'delayedError'
    , args: [rand]
    , onError: error } )

  function error (r){
    var it = 
      describe(r,"syntax error in required module in child process")
    it.should.include.string('SyntaxError')
    test.finish()
  }
}

exports ['calls callbacks'] = function (test){

  var calls = ['onTestStart','onTestDone','onSuiteDone','onExit']
  var callbacks = {}
  
  calls.forEach(each)
  
  function each(fName){
    callbacks[fName] = function (status,data){
      log('CALLBACK:',status,data) 
      thisCall = calls.shift()
      test.equal(thisCall,fName)
      test.equal(status,fName)
      test.deepEqual(data , {test: "dummy_test_adapter: " + fName, object: {magicNumber: 123471947194 } } )
      
    }
  }

  child.run(
    { require: "child/test/lib/dummy_test_adapter"
    , function: 'runTest'
    , args: ["child/test/lib/magic_number" ,callbacks]
    , onError:error 
    , onExit: exit} )
    
  function error(error){
    console.log("error! >>>" + error + "<<<")
    test.ok(false,"did not expect an error! >" + error + "<")
  }
  
  function exit(){
    log('DUMMY TEST ADAPTER EXIT')
    log('calls was:',calls)
    test.equal(calls.length,0,"expected calls.length == 0, calls was:" + inspect(calls))
    test.finish()
  }
}
/*
  I did all this stuff with child processes
  because i needed to remap require within tests running in another child process.

*/

function timeout(test,time){
    return setTimeout(function(){
      console.log("TIMEOUT!")
        test.ok(false,"expected test to finish within " + time + ' milliseconds\n'
          + 'child process did not stop properly')
      },time)

 /* test.finish = function(){
    clearTimeout(timer)
    _finish.call(test) // call finish on test.
  }*/
}


exports ['stops normally after a delayed error'] = function (test){
  var rand = Math.random()
    , theError = null
    , timer = timeout(test,2000)

  child.run(
    { require: 'child/test/lib/delayed-error'
    , function: 'delayedError'
    , args: [rand]
    , onError: error
    , onExit: exit } )

  function error (err){
    theError = err
    console.log(err)
  }

  function exit (r){
    clearTimeout(timer)
    console.log("EXIT!")

    describe("" + theError,"the error thrown by \'child/test/lib/delayed-error\'")
      .should.include.string("INTENSIONAL ERROR")

    test.finish()
  }
}


exports ['can set a timeout for the the child to live'] = function (test){

    var timer = setTimeout(assertTimeout,2000)
      , timeoutCalled = false
  child.run(
    { require: 'child/test/lib/hang'
    , function: 'hang'
    , args: []
    , onError: error
    , onExit: exit 
    , onTimeout: timeout
    , timeout: 1000 } )
    
    function exit(){
      test.ok(timeoutCalled,'onTimeout callback should get called')
      test.finish()
    }
    function error(err){
      test.ifError(err)
      throw err
    }
    function timeout(time){
      timeoutCalled = true
      clearTimeout(timer)
    }
    function assertTimeout(){
      test.ok(false,"expected child to be stopped within 1000 ms")
    }
}
/**/
