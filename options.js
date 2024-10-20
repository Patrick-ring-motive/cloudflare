globalThis.tryCatch = function tryCatch(...fns) {
  const errors = [];
  const fns_length = fns.length;
  const last = fns_length-1;
  for (let i = 0; i !== fns_length; i++) {
    try {
      return fns[i]?.(errors);
    } catch (err) {
      errors.push(err);
      if(i === last){
        throw err;
      }
    }
  }
  return errors;
};

globalThis.znewRequest = function znewRequest(input,options){
    let req;
    try{
        if(!options){
            if(typeof input == 'string'){
                req = new Request(input);
            }else{
                try{
                    req = new Request(input);
                }catch(e){
                    input = serializeHTTP(input);
                    input.body = e.message;
                    req = new Request(input);
                }
            }
        }else{
            tryCatch(()=>{
               req = new Request(input,options);
            },()=>{
               req = new Request(input);
            },(e)=>{
                options = serializeHTTP(options);
                options.body = e?.[0]?.message;
                req = new Request(input,options);
            }
        }
    }catch(e){
        const url = input.url||input;
        req = new Request(url,{headers:{"error-message":e.message,redirect:"follow"},redirect:"follow"});
    }
    return req;
  }
  
  
  
const flattenError = (e)=>{
  const err = {};
  for(const key in e){err[key]=e[key]};
  Object.getOwnPropertyNames(e).forEach(x=>{err[x]=e[x]});
  return err;
};



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
    rtrn.error = e;
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

const callQ = (...args) => args?.[0]?.call?.(...args);

const ifTry = (bool, then, elseThen) => {
  try {
    if (callQ(bool) ?? bool) {
      return then?.();
    } else {
      return elseThen?.();
    }
  } catch (e) {
    return elseThen?.(e);
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

