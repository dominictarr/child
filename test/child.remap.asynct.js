//child.remap.asynct.js
/*
  I need child to use remap, so that I can control what modules are loaded in tests.

  start child with remaps
  just before it calls back onExit,
  callback remapReport
*/
var child = require('child/child_stdout2')
  , helper = require('async_helper')
  , log = require('logger')
  , describe = require('should').describe
  , assert = require('c-assert')    
  , remapHelp = require('remap/test/.helper/remap-helper')

exports ['can replace modules in child loading'] = function (test){

  var isCalled = helper.callChecker(2000,test.finish)

  child.run
    ({ require: 'remap/test/.examples/a'
    , function: 'a'
    , remapReport: isCalled(report,"remap report") 
    , onReturn: isCalled(returned) })

  
  function returned (r){
    test.equal(r,"A is for Apple")
  }

  function report (report){
    //the report should say what was loaded,
    //and what the dependencies are.
    //is the circular structure gonna go through?
    //start with just the loaded modules.
  var loadedIds = Object.keys(report.loaded)

    var it = 
      describe(loadedIds,"modules loaded in child process")
    it.should.be.instanceof(Array)
    it.should.eql(['remap/test/.examples/a'])

    log(report)
  }
}


exports ['can replace modules in child loading, more complex'] = function (test){

  var isCalled = helper.callChecker(2000,test.finish)

  child.run
    ({ require: 'remap/test/.examples/e'
    , function: 'hello'
    , remapReport: isCalled(report,"remap report") 
    , onReturn: isCalled(returned) })

  
  function returned (r){
    test.equal(r,"hello")
  }

  function report (report){
    //the report should say what was loaded,
    //and what the dependencies are.
    //is the circular structure gonna go through?
    //start with just the loaded modules.

  var loadedIds = Object.keys(report.loaded)

    var it = 
      describe(loadedIds,"modules loaded in child process")
    it.should.be.instanceof(Array)
    it.should.eql
      ( [ 'remap/test/.examples/e'
        , 'remap/test/.examples/a'
        , 'remap/test/.examples/d'
        , 'remap/test/.examples/b'
        , 'remap/test/.examples/c' ] )

    log(report)
  }
}

exports ['can replace modules in child loading, more complex'] = function (test){

  var isCalled = helper.callChecker(2000,test.finish)

  child.run
    ( { require: 'remap/test/.examples/e'
      , function: 'hello'
      , remap: { './a': './a2' } // i'll be wanting this to work with full ids too.
      , remapReport: isCalled(report) 
      , onReturn: isCalled(returned) } )

  
  function returned (r){
    test.equal(r,"hello")
  }

  function report (report){
    //the report should say what was loaded,
    //and what the dependencies are.
    //is the circular structure gonna go through?
    //start with just the loaded modules.
  var expected
      = [ 'remap/test/.examples/e'
        , 'remap/test/.examples/a2'
        , 'remap/test/.examples/d'
        , 'remap/test/.examples/b'
        , 'remap/test/.examples/c' ]

  var loadedIds = Object.keys(report.loaded)

    assert.deepEqual(loadedIds,expected)

    var it = 
      describe(loadedIds,"modules loaded in child process")
    it.should.be.instanceof(Array)
    it.should.eql (expected)

    log(report)
  }
}

function doRemapChild (root,remaps,depends,cb){
  
  child.run
    ( { require: root
//      , function: 'hello'
      , remap: remaps // i'll be wanting this to work with full ids too.
      , remapReport: report } )  

  function report(report){
    remapHelp.shouldRemap(report,root,remaps,depends)
    cb()
  }
}

/*
  check all tests from remapper!
*/

exports ['can remap remapper examples'] = function (test){
  var examples = Object.keys(remapHelp.examples)
  next()
  function next (){
    var example = remapHelp.examples[examples.pop()]
    if(!example)
      return test.finish()
    doRemapChild(example.root,example.remaps,example.depends,next)
  }
}
