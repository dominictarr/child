
var Reciever = require('child/transmit').Reciever
  , Sender = require('child/transmit').Sender
  , should = require('should')


exports ['Reciever can register a function'] = function(test){

  function x(){}
  r = new Reciever()
  id = r.register(x)
  should.ok(id)
  id.should.be.a('number')
  id.should.eql(r.register(x)) //same function can't be registered twice

  should.throws(function (){
    r.register({})//throws if register a non object
  })

  test.finish() 
}

exports ['Reciever can recieve a registered function'] = function (test){

  should.ok(r.recieve)
  
  var val = {x:1241,hdsfd:12398}
  
  id = r.register(function(arg){
    arg.should.eql(val)
    test.finish()
  })
  
  should.throws(function (){
    r.recieve(23423,[]) //there is no 23423
  })

  test.finish();
}

exports ['Sender can create a function around a registered function'] = function (test){

  var id = 123467890
    , args = [1,23,5,345,{fasdf:23424}]
    , s = new Sender()
    , fn = s.registered(id)
    
    should.ok(fn)
    fn.should.be.a('function')
    
    should.throws(function (){
      fn('calling without setting send should throw')
    })
    function send (_id,_args){
      _id.should.eql(id)
      _args.should.eql(args)
      test.finish()
    }
    s.send = send
    fn.apply(null,args)
}

exports ['connect sender and reciever directly together'] = function (test){

  var s = new Sender()
    , r = new Reciever()
    
    s.send = r.recieve
    
    id = r.register(test.finish)
    fn = s.registered(id)

    fn()
}

exports ['Reciever provide JSON replacer function'] = function (test){
  var r = new Reciever()
    , rep = r.replacer('',function (){})// key,value
    
    rep.should.be.a('object')

    /*var obj = {a: function (){test.finish}}
    
    JSON.stringify(obj,r.replacer)*/
    
  test.finish()
}

exports ['Sender provide JSON reviver function'] = function (test){
  var s = new Sender()
    , id = 1234567890
    , obj = {'[Function]': id}
    , func = s.reviver('',obj)// key,value

    func.should.be.a('function')
    
    s.send = function (_id,args){
    
      _id.should.eql(id)
      test.finish()
    }

    func()
    
    /*var obj = {a: function (){test.finish}}
    
    JSON.stringify(obj,r.replacer)*/

    //  test.finish()
}

exports ['can connect sender to reciever with json'] = function (test){
  var args = [23,324,5,435345]
    , r = new Reciever()
    , s = new Sender()
    s.send = r.recieve
  function x(a){
    a.should.eql(args)
    test.finish()
  }
  x_json = JSON.stringify(x,r.replacer)
  _x = JSON.parse(x_json,s.reviver)
  _x(args)
}

exports ['provide convienient API'] = function (test){
  var args = [23,435,'sdafah',324,5,435345]
    , r = new Reciever()
    , s = new Sender()
    s.send = r.recieve
  function x(a){
    a.should.eql(args)
    test.finish()
  }
  _x = s.parse(r.stringify(x))
  _x(args)
}

/*
OKAY, this is way better!

then a seperate module which handles actually transporting the messages.

this could also be extended to handle circular references...

and functions with properties.

Transmit isn't the right name.

translate? callcallback?


---------- next :

transport layer. writes to a reads from a temp file, or tcp?


so the important thing about the transport layer, is that i need to create
each end of it in a seperate process. i.e. 
it should create some sort of descriptor, 
which contains all the information needed to setup the other end

Reciever.setup (parameters)
inst = Reciever.instructions

okay, I can't  imagine this well enough, so i'll have to make some demos.

*/

