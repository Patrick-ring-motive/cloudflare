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

const ifTry = (bool, then, elseThen) => {
         if (bool) {
             try {
                 if ((typeof bool) == 'function') {
                     if (bool()) {
                         return then();
                     } else {
                         return elseThen();
                     }
                 } else {
                     return then();
                 }
             } catch (e) {
                 if (elseThen) {
                     return elseThen(e);
                 } else {
                     return;
                 }
             }
         } else {
             if (elseThen) {
                 return elseThen(e);
             } else {
                 return;
             }
         }
     }

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

