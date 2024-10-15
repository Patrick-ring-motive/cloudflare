const tryError = (fn) => {
  try{
    return fn?.();
  }catch(e){
    return e;
  }
};

const q = (varFn) => {
  try{
    return varFn?.();
  }catch(e){
    if(e.name != 'ReferenceError'){
      throw e;
    }
  }
}