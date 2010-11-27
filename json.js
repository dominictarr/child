var log = console.log
  , inspect = require('inspect')
obj = 
  { a: "aaa"
  , b: 123
  , c: function (){} }
  
  var json = JSON.stringify(obj, replacer)
  log(json)
  var obj2 = JSON.parse(json,reviver)
  obj2.c("hello!")
  log(inspect(obj2))

  function replacer (key,value){
    log(key,value,parent)
    if('function' === typeof value){
      //register callbacks with reciever
      return {  '[Function]': key
             ,  id: (Math.random()*100000000000000000) // could use this method for fixing repeats also.
      }
    }
    return value
  }
  
  function reviver (key,value){
    if(value['[Function]'] == key){
      return function (arg){
        //attach to sender
        log(key + value.id + "('" + arg + "')")
      }
    }
    return value
  }
  
  
  
