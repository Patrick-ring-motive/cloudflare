globalThis.TryCatch = function TryCatch(...fns) {
  const errors = [];
  for (let fn of fns) {
    try {
      return fn?.(errors);
    } catch (err) {
      errors.push(err);
    }
  }
  return { errors };
};

globalThis.znewRequest = function znewRequest(input, options) {
  let res;
  TryCatch((e)=>{
      if(!options){
        try{
          res = new Response(body);
        }catch{
          res = new Response(`${body}`);
        }
      }else{
        TryCatch(()=>{
          res = new Response(body,options);
        },()=>{
          res = new Response(`${body}`,options);
        },()=>{
          res = new Response(`${body}`);
        });
      } 
    },
    (e) => {new Request(input)},
    
    // If that fails, check if input is an object and serialize it
    (errors) => {
      input = typeof input === 'string' ? input : serializeHTTP(input);
      input.body = errors[errors.length - 1].message; // Use the latest error message as body
      return new Request(input);
    },

    // If options are provided but fail, try serializing options and retry
    (errors) => {
      options = serializeHTTP(options);
      options.body = errors[errors.length - 1].message; // Use the latest error message as body
      return new Request(input, options);
    },

    // Final fallback: create a request with error information in headers
    (errors) => {
      const url = input.url || input;
      return new Request(url, {
        headers: {
          "error-message": errors[errors.length - 1].message,
          redirect: "follow",
        },
        redirect: "follow",
      });
    }
  );

  // If TryCatch returns an object containing errors, log or handle them
  if (result?.errors) {
    console.log('Errors encountered:', result.errors);
    // Optionally return the last error-handled request or throw
    return new Request(input.url || input, { headers: { "error-message": result.lastError.message } });
  }

  return result;
};

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

