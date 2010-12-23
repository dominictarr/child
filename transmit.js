
//sendAndRecieve

var  assert = require('assert')
  , inspect = require('inspect')
exports.Reciever = Reciever
exports.Sender = Sender

var number = 0 //number of instances of Receiver in this process.

function Clean(){
  this.__proto__ = null
}

Hash.prototype = new Clean()
function Hash (){

}
Hash.prototype.keyOf = function (value){
  for(key in this){
    if(this[key] === value)
      return key
  }
}

function keyOf(obj,value){
  for(key in obj){
    if(obj[key] === value)
      return key
  }
}

function toArray(obj){
  ary = []
  for(i in obj){
    ary[i] = obj[i]
  }
  return ary
}

function Reciever (){
  var instance = number ++
  if(!(this instanceof Reciever)) return new Reciever
  var registry = new Hash()
    , self = this  
  self.register = function(func) {
    assert.equal('function',typeof func)
    
    key = registry.keyOf(func)
    if(key) {
      return key
    } else {
      key = ('' 
        + (func.name || 'function') 
        + Math.round(Math.random()*1000000)) 
        + ':' + process.pid 
        + ':' + instance
      registry[key] = func
      
      //console.log(registry.keyOf(func),key)
      return key
    }
  }
  self.recieve = function (id,args){
  /*
  WEIRD PROBLEM. getting calls  not registered here.
  from the layer below?
  no. adding info into the key.
  wrong messages are from different instances but have same pid.

  accidental global var causing leak?
  
  YES! it was the xmitR var in child/child_stdout2
  */
  
   assert.ok(registry[id],'registry did not have id=' + id 
     + "\nexpected one of " + Object.keys(registry)
     + "\nargs were:" + inspect(args) )
    if(!registry[id])
      return console.log('registry did not have id=' + id 
        + "\nexpected one of " + Object.keys(registry))
 
    registry[id].apply(null,args)
  }
  
  self.replacer = function (key,value){
    if('function' === typeof value){
      return { '[Function]': self.register(value) }
    } 
    return value
  }
  
  self.stringify = function (obj){
    return JSON.stringify(obj,self.replacer)
  }
}

function Sender (){
  if(!(this instanceof Sender)) return new Sender

  var registry = new Hash()
    , self = this
  self.registered = function (id){
    if(!registry[id]){
      registry[id] = function (){
        self.send(id,toArray(arguments))
      }
    }
    return registry[id]
  }
  
  self.reviver = function (key,value){
    if(value != null)
    if(value['[Function]']){
      return self.registered(value['[Function]'])
    }  
    return value
  }
  self.parse = function (json){
    return JSON.parse(json,self.reviver)
  }

}

