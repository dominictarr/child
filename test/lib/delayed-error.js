

exports.delayedError = function (){

  process.nextTick(function (){
    throw new Error("INTENSIONAL ERROR!")
  })
  
  return true
}
