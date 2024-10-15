const tryError = (fn) => {
  try{
    return fn?.();
  }catch(e){
    return e;
  }
};

const valueError = (fn) => {
  const rtrn = {};
  try{
    rtrn.value = fn?.();
  }catch(e){
    rtrn.error e;
  }
  return rtrn;
};

const tryElse = (tryFn,elseFn) => {
  try{
    return tryFn?.();
  }catch(e){
    return elseFn?.(e);
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

