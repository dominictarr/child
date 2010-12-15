

exports.delayedError = function (){

  process.nextTick(function (){
//    throw new Error("INTENSIONAL ERROR!")
    require('./syntax_error')
  })
  
  return true
}
