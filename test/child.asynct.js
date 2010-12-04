var child = require('child/child')
  , inspect = require('inspect')
  , describe = require('should').describe

/*

now that this is rewritten I feel much more confidant.

*/

exports ['can load an run an arbitary function'] = function (test){

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

exports ['calls callbacks'] = function (test){

  var calls = ['onTestStart','onTestDone','onSuiteDone','onExit']
  var callbacks = {}
  
  calls.forEach(each)
  
  function each(fName){
    callbacks[fName] = function (status,data){
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
    test.equal(calls.length,0)
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

/**/
