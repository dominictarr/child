//var net = require('net')

/*
  it's important in this usecase for the child to exit normally
  if there is nothing left to do.
  looks like trick is closing the connection if there isn't more messages going out.
  (it has to close at both ends)
*/

/*  var server = net.Server(
    function (s) { 
      s.on('data',
        function(d){
          console.log("data",d)
          } ) 
      s.on('end',function (e,r){
        console.log('disconnect!',e,r)
        s.end()
        } ) } ).listen(8000,ready)
          
  function ready(){
  
   // var client = net.createConnection(8000)
   // client.write('hello!')
  }
  
*/

var t = require('./transport')
  , spawn = require('child_process').spawn
  , desc = 
    { format: 'tcp'
    , encoding: 'utf-8'
    , port: 8000 }

r = new t.Reciever(desc)
r.recieve = console.log

//var child = spawn('node', ['./send_hello',JSON.stringify(r.descriptor)])

//child.on('data', 
