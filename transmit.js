
//sendAndRecieve

var  assert = require('assert')

exports.Reciever = Reciever
exports.Sender = Sender

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
  var registry = new Hash()
    , self = this  
  self.register = function(func) {
    assert.equal('function',typeof func)
    
    key = registry.keyOf(func)
    if(key) {
      return key
    } else {
      key = Math.round(Math.random()*10000000000000)
      registry[key] = func
     // console.log(registry.keyOf(func),key)
      return 1 * key
    }
  }
  self.recieve = function (id,args){
    assert.ok(registry[id],'registry did not have id=' + id)
    
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

