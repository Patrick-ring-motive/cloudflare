const tryError = (fn) => {
  try{
    return fn?.();
  }catch(e){
    return e;
  }
};