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

const newQ = (...args) => {
   const fn = args?.shift?.();
   return fn && new fn(...args);
};

