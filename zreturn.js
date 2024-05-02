if(!globalThis.serializeHTTP){
    globalThis.serializeHTTP=function(re){
        let reDTO=Object.create(null);
        reDTO.headers={};
        for(let a in re){
          if((re[a]===null)||(a=='headers')||(a=='fetcher')||(a=='signal')){continue;}
          reDTO[a]=re[a];
          if(typeof a == 'function'){continue;}
        }
        let reHeaders=(new Map(re.headers));
        for(let h of reHeaders){
          if(typeof h == 'function'){continue;}
          reDTO.headers[`${h}`.replace(/[^a-zA-Z]+/g,'-').replace(/[-]$/,'')] = reHeaders[`${h}`];
        }
        re.headers.forEach((value, key) => {
            reDTO.headers[`${key}`.replace(/[^a-zA-Z]+/g,'-').replace(/[-]$/,'')]=`${value}`;
        });
      return reDTO;
    }
}
globalThis.appendZResponseMethods=function(res){
    return res;
}
globalThis.zfetch = async function() {
    try {
        return await fetch.apply(this,arguments);
    } catch (e) {
        try{
            return await fetch.call(this,arguments[0]);
        }catch(r){
        console.log(e);
        return new Response(arguments[0]+'\n'+e.message+'\n'+e.stack, {
            status: 569,
            statusText: e.message
        });
    }
    }
  };

  globalThis.znewRequest=function(input,options){
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
                }catch(r){
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

  globalThis.znewResponse=function(body,options){
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
            }catch(e){
                try{
                    res = new Response(`${body}`,options);
                }catch(e){
                    res = new Response(`${body}`);
                }
            }
        } 
    }catch(e){
            res = new Response(e.message,{status:569,statusText:e.message});   
    }
    return res;
  }

  globalThis.zfetchText = async function(){
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
    if (!globalThis.decoder) {
        globalThis.decoder = new TextDecoder();
        globalThis.decoder.zdecode = function(raw) {
            try {
                return globalThis.decoder.decode(raw);
            } catch (e) {
                return e.message;
            }
        }
    }
    return globalThis.decoder;
}

globalThis.zencoder = function() {
    if (!globalThis.encoder) {
        globalThis.encoder = new TextEncoder();
        globalThis.encoder.zencode = function(str) {
            try {
                return globalThis.encoder.encode(str);
            } catch (e) {
                return e.message.toCharCodes();
            }
        }
    }
    return globalThis.encoder;
}

globalThis.zgetReader = function(stream) {
    if (!stream) {
        return;
    }
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
