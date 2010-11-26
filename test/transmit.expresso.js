
var Reviever = require('transmit').Reciever
  , should = require('should')
exports ['Reciever can register a function'] = function(test){

  function x(){}
  r = new Receiver()
  id = r.register(x)
  id.should.be.typeof('number')
}
