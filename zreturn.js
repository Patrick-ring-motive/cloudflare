
globalThis.serializeHTTP ??= function serializeHTTP(re){
  const reDTO = {};
  reDTO.headers = {};
  for(const a in re){
      if((re[a]==null)||(a=='headers')||(a=='fetcher')||(a=='signal')){continue;}
      if(typeof re[a] == 'function'){continue;}
      reDTO[a] = re[a];
  }
  const reHeaders = re.headers;
  const reHeadersKeys = reHeaders.keys();
  for(const key of reHeadersKeys){
      reDTO[key] = reHeaders.get(key);
  }
return reDTO;
}

function serializeHTTP(re){
  const reDTO = Object.create(re);
  reDTO.headers = Object.fromEntries(re.headers);;
  return reDTO;
}


globalThis.newReadableStream = function newReadableStream(input){
    return new Response(input).body;
}

globalThis.znewReadableStream = function znewReadableStream(input){
    try{
        return newReadableStream(input);
    }catch(e){
        return newReadableStream(e.message);
    }
}

globalThis.newArrayBuffer = function newArrayBuffer(input) {
  const buf = new ArrayBuffer(input.length*2);
  const bufView = new Uint16Array(buf);
  const inputLen=input.length;
  for (let i=0; i !== inputLen; i++) {try{
    bufView[i] = input?.charCodeAt?.(i)||+input[i];
  }catch{continue;}}
  return buf;
}

globalThis.znewArrayBuffer = function znewArrayBuffer(input){
    try{
        return newArrayBuffer(input);
    }catch(e){
        return newArrayBuffer(e.message);
    }
}

globalThis.responseText = async function responseText(res){
    return await Response.prototype.text.apply(res);
};

globalThis.zresponseText = async function zresponseText(re){
    try{
        return await responseText(re);
    }catch(e){
        return e.message;
    }
}

globalThis.responseArrayBuffer = async function responseArrayBuffer(res){
    return await Response.prototype.arrayBuffer.apply(res);
};

globalThis.zresponseArrayBuffer = async function zresponseArrayBuffer(re){
    try{
        return await responseArrayBuffer(re);
    }catch(e){
        return znewArrayBuffer(e.message);
    }
}


globalThis.appendZResponseMethods = function appendZResponseMethods(res){
    res ??= new Response(`${res}`);
    res.zbody = function zbody(){
        res.body ??= znewReadableStream(`${res?.body}`);
            res.body.zgetReader ??= function zgetReader(){
                try{
                    const r = Object.create(null);
                    r.reader = res.body.getReader();
                    r.almostDone = false;
                    return r;
                }catch(e){
                    const r = Object.create(null);
                    r.reader = znewReadableStream(e.message).getReader();
                    r.almostDone = false;
                    return r;
                }
            }
        return res.body
    }
    res.ztext = async function ztext(){
        try{
            return await res.text();
        }catch(e){
            return e.message;
        }
    }
    res.zarrayBuffer = async function zarrayBuffer(){
        try{
            return await res.arrayBuffer();
        }catch(e){
            return znewArrayBuffer(e.message);
        }
    }
    return res;
}
globalThis.zfetch = async function zfetch() {
    let res;
    try {
        return appendZResponseMethods(await fetch.apply(this,arguments));
    } catch (e) {
        try{
            return appendZResponseMethods(await fetch.call(this,arguments[0]));
        }catch(_){
        console.log(e);
        return appendZResponseMethods(new Response(arguments[0]+'\n'+e.message+'\n'+e.stack, {
            status: 569,
            statusText: e.message
        }));
    }
    }
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
            try{
                req = new Request(input,options);
            }catch(e){
                try{
                    req = new Request(input);
                }catch(_){
                options = serializeHTTP(options);
                options.body = e.message;
                req = new Request(input,options);
                }
            }
        }
    }catch(e){
        const url = input.url||input;
        req = new Request(url,{headers:{"error-message":e.message,redirect:"follow"},redirect:"follow"});
    }
    return req;
  }

  globalThis.znewResponse = function znewResponse(body,options){
    let res;
    try{
        if(!options){
                try{
                    res = new Response(body);
                }catch(e){
                    res = new Response(`${body}`);
                }
        }else{
            try{
                res = new Response(body,options);
            }catch(_){
                try{
                    res = new Response(`${body}`,options);
                }catch(_){
                    res = new Response(`${body}`);
                }
            }
        } 
    }catch(e){
            res = new Response(e.message,{status:569,statusText:e.message});   
    }
    return appendZResponseMethods(res);
  }

  globalThis.zfetchText = async function zfetchText(){
    try{
        let res = await fetch.apply(this,arguments);
        if(res.status > 399){
            return res.statusText;
        }
        return await res.text();
    }catch(e){
        return e.message;
    }
}



globalThis.zdecoder = function() {
        globalThis.decoder ??= new TextDecoder();
        globalThis.decoder.zdecode ??= function(raw) {
            try {
                return globalThis.decoder.decode(raw);
            } catch (e) {
                return e.message;
            }
        }
    return globalThis.decoder;
}

globalThis.zencoder = function() {
        globalThis.encoder ??= new TextEncoder();
        globalThis.encoder.zencode ??= function(str) {
            try {
                return globalThis.encoder.encode(str);
            } catch (e) {
                return e.message.toCharCodes();
            }
        }
    return globalThis.encoder;
}

globalThis.zgetReader = function(stream) {
    if (!stream) {return;  }
    let r = Object.create(null);
    r.reader = stream.getReader();
    r.almostDone = false;
    return r;
}

globalThis.zread = async function(reader) {
    if (reader?.almostDone) {
        try {
            reader.reader.releaseLock();
        } catch (e) {}
        return {
            value: undefined,
            done: true
        };
    }
    try {
        let rtrn = await reader.reader.read();
        if (rtrn.done) {
            try {
                reader.reader.releaseLock();
            } catch (e) {}
        }
        return rtrn;
    } catch (e) {
        if(reader){
            reader.almostDone = true;
        }
        return {
            value: e.message,
            done: false
        };
    }
};

globalThis.zatob=function(str){
  str=`${str}`;
  try{
    return atob(str);
  }catch(e){
    try{
      return btoa(str)
    }catch(e){
      return str;
    }
  }
}
