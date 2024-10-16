import {fuzzyMatch} from './fuzz.js';

globalThis. objDoProp = function (obj, prop, def, enm, mut) {
  return Object.defineProperty(obj, prop, {
    value: def,
    writable: mut,
    enumerable: enm,
    configurable: mut,
  });
};
globalThis. objDefProp = (obj, prop, def) => objDoProp(obj, prop, def, false, true);
globalThis. objDefEnum = (obj, prop, def) => objDoProp(obj, prop, def, true, true);
globalThis. objFrzProp = (obj, prop, def) => objDoProp(obj, prop, def, false, false);
globalThis. objFrzEnum = (obj, prop, def) => objDoProp(obj, prop, def, true, false);
globalThis. objectNames = (x) => Object.getOwnPropertyNames(x);
globalThis. objectSymbols = function () {
  return Object.getOwnPropertySymbols(...arguments);
};
globalThis. objGetProto = function () {
  return Object.getPrototypeOf(...arguments);
};
globalThis. objSetProto = function () {
  return Object.setPrototypeOf(...arguments);
};
globalThis.create = (proto) => Object.create(proto);

fetch.prototype ??= (fetch.constructor = fetch);
globalThis.newFetch = function newFetch(init) {
  return Object.assign(Object.create(fetch.prototype), init)
}
globalThis.serializeHTTP ??= function serializeHTTP(re) {
  const reDTO = newFetch({
    headers: Object.fromEntries(re.headers)
  });
  for(const a in re) {
    if(re[a] == null || typeof re[a] === 'function') {
      continue;
    }
    if(~String(a).search(/headers|fetcher|signal/)) {
      continue;
    }
    reDTO[a] = re[a];
  }
  return reDTO;
}
globalThis.newArrayBuffer = function(input) {
  const buf = new ArrayBuffer(input.length * 2);
  const bufView = new Uint16Array(buf);
  for(let i = 0, inputLen = bufView.length; i !== inputLen; i++) {
    bufView[i] = input?.charCodeAt?.(i) || +input[i];
  }
  return buf;
}
globalThis.znewArrayBuffer = function(input) {
  try {
    const buf = new ArrayBuffer(input.length * 2);
    const bufView = new Uint16Array(buf);
    for(let i = 0, inputLen = bufView.length; i !== inputLen; i++) {
      try {
        bufView[i] = input?.charCodeAt?.(i) || +input[i];
      } catch {
        continue;
      }
    }
    return buf;
  } catch (e) {
    return newArrayBuffer(e.message);
  }
}
globalThis.responseText = async function responseText(response) {
  return await response.text();
};
globalThis.zresponseText = async function zresponseText(response) {
  try {
    return await responseText(response.clone());
  } catch (e) {
    return e.message;
  }
};
globalThis.responseArrayBuffer = async function responseArrayBuffer(response) {
  return await response.arrayBuffer();
};
globalThis.zresponseArrayBuffer = async function zresponseArrayBuffer(response) {
  try {
    return await responseArrayBuffer(response.clone());
  } catch (e) {
    return znewArrayBuffer(e.message);
  }
};
globalThis.appendZResponseMethods = function(res) {
  res = res || new Response(`${res}`);
  res.zbody = function() {
    res.body = res?.body || znewReadableStream(`${res?.body}`);
    if(!res.body.zgetReader) {
      res.body.zgetReader = function() {
        try {
          let r = Object.create(null);
          r.reader = res.body.getReader();
          r.almostDone = false;
          return r;
        } catch (e) {
          let r = Object.create(null);
          r.reader = znewReadableStream(e.message).getReader();
          r.almostDone = false;
          return r;
        }
      }
    }
    return res.body
  }
  res.ztext = async function ztext() {
    try {
      const resText = await res.text();
      res.zresBody = () => resText;
      return resText;
    } catch (e) {
      if(res.zresBody) {
        return res.zresBody();
      }
      res.zresBody = () => e.message;
      return e.message;
    }
  }
  res.zarrayBuffer = async function() {
    try {
      const resArrayBuffer = await res.arrayBuffer();
      res.zresBody = () => resArrayBuffer;
      return resArrayBuffer;
    } catch (e) {
      if(res.zresBody) {
        return res.zresBody();
      }
      const zab = znewArrayBuffer(e.message);
      res.zresBody = () => zab;
      return zab;
    }
  }
  return res;
}
globalThis.zfetch = async function() {
  try {
    return (await fetch.apply(this, arguments));
  } catch (e) {
    let code = 569;
    try {
      return (await fetch.call(this, arguments[0]));
    } catch {
      console.log(e);
      const match = fuzzyMatch(e.message);
      if(match[2] >= 2) {
        code = +match[0] || 569;
      }
      return (znewResponse(arguments[0] + '\n' + e.message + '\n' + e.stack, {
        status: code,
        statusText: e.message,
        headers: {
          "Content-Type": "text/html"
        }
      }));
    }
  }
};
globalThis.znewRequest = function(input, options) {
  let req;
  try {
    if(!options) {
      if(typeof input == 'string') {
        req = new Request(input);
      } else {
        try {
          req = new Request(input);
        } catch (e) {
          input = serializeHTTP(input);
          input.body = e.message;
          req = new Request(input);
        }
      }
    } else {
      try {
        req = new Request(input, options);
      } catch (e) {
        try {
          req = new Request(input);
        } catch (r) {
          options = serializeHTTP(options);
          options.body = e.message;
          req = new Request(input, options);
        }
      }
    }
  } catch (e) {
    const url = input.url || input;
    req = new Request(url, {
      headers: {
        "error-message": e.message,
        redirect: "follow",
        "Content-Type": "text/html"
      },
      redirect: "follow"
    });
  }
  return req;
}
globalThis.znewResponse = function(body, options) {
  let res;
  try {
    if(!options) {
      try {
        res = new Response(znewReadbleStream(body));
      } catch (e) {
        res = new Response(`${body}`);
      }
    } else {
      try {
        res = new Response(znewReadableStream(body), options);
      } catch (e) {
        try {
          res = new Response(`${body}`, options);
        } catch (e) {
          try {
            console.log(e);
            res = znewResponse(`${body}`, {
              headers: {
                "error-message": e.message,
                redirect: "follow",
                "Content-Type": "text/html"
              },
              redirect: "follow"
            });
          } catch (e) {
            console.log(e, ...arguments);
          }
        }
      }
    }
  } catch (e) {
    res = new Response(e.message, {
      status: 569,
      statusText: e.message,
      headers: {
        "error-message": e.message,
        redirect: "follow",
        "Content-Type": "text/html"
      }
    });
  }
  res.contentLength = options?.contentLength ?? body?.length
  return (res);
}
globalThis.znewURL = function znewURL() {
  try {
    return new URL(...arguments);
  } catch (e) {
    try {
      return new URL(arguments[0]);
    } catch {
      try {
        return new URL(`https://${arguments[0]}`);
      } catch {
        return new URL(`${e.name}://`);
      }
    }
  }
}
globalThis.zfetchText = async function() {
  try {
    let res = await fetch.apply(this, arguments);
    if(res.status > 399) {
      return res.statusText;
    }
    const resText = await res.text();
    res.zresBody = () => resText;
    return resText;
  } catch (e) {
    return e.message;
  }
}
globalThis.toCharCodes = function toCharCodes(str) {
  const charCodeArr = [];
  const str_length = str.length;
  for(let i = 0; i < str_length; i++) {
    const code = str.charCodeAt(i);
    charCodeArr.push(code);
  }
  return new Uint8Array(charCodeArr);
}
globalThis.ztoCharCodes = function ztoCharCodes(strng) {
  const str = String(strng);
  const charCodeArr = [];
  const str_length = str.length;
  for(let i = 0; i < str_length; i++) {
    try {
      const code = str.charCodeAt(i);
      charCodeArr.push(code);
    } catch {
      continue;
    }
  }
  return new Uint8Array(charCodeArr);
}
globalThis.fromCharCodes = function fromCharCodes(arr) {
  const charArr = [];
  const arr_length = arr.length;
  for(let i = 0; i < arr_length; i++) {
    const char = String.fromCharCode(arr[i]);
    charArr.push(char);
  }
  return charArr.join``;
}
globalThis.zfromCharCodes = function zfromCharCodes(arr) {
  try {
    arr = [...arr]
  } catch {
    arr = [...arguments]
  }
  const charArr = [];
  const arr_length = arr.length;
  for(let i = 0; i < arr_length; i++) {
    try {
      const char = String.fromCharCode(arr[i]);
      charArr.push(char);
    } catch {
      continue;
    }
  }
  return charArr.join``;
}
globalThis.newReadableStream = function(input) {
  const stream = new Response(input).body;
  stream.getReader().releaseLock();
  return stream;
}
globalThis.znewReadableStream = function znewReadableStream() {
  try {
  	const type = String(arguments?.[0]?.constructor?.name);
  	if(type === 'ReadableStream'){
  		return arguments?.[0].tee()[1];
  	}
  	if(/Blob|ArrayBuffer|.+Array|DataView|FormData|URLSearchParams|String/.test(type)){
  		return newReadableStream(...arguments);
  	}
  	try{
  		return newReadableStream(new Int8Array([...arguments[0]]));
  	}catch(e){
  		return new ReadableStream(...arguments);
  	}
  } catch (e) {
    return newReadableStream(e.message);
  }
}
globalThis.zdecoder = function zdecoder() {
  if(!globalThis.decoder) {
    globalThis.decoder = new TextDecoder();
    globalThis.decoder.zdecode = function zdecode(raw) {
      try {
        return globalThis.decoder.decode(raw);
      } catch (e) {
        try {
          return zfromCharCodes(raw);
        } catch {
          return e.message;
        }
      }
    }
  }
  return globalThis.decoder;
}
globalThis.zencoder = function zencoder() {
  if(!globalThis.encoder) {
    globalThis.encoder = new TextEncoder();
    globalThis.encoder.zencode = function zencode(str) {
      try {
        return globalThis.encoder.encode(str);
      } catch (e) {
        try {
          return ztoCharCodes(str);
        } catch {
          return ztoCharCodes(e.message);
        }
      }
    }
  }
  return globalThis.encoder;
}
globalThis.getReader = function getReader(stream) {
  const r = Object.create(null);
  r.reader = stream.getReader();
  r.almostDone = false;
  return r;
}
globalThis.zgetReader = function zgetReader(stream) {
  try {
    return getReader(stream);
  } catch (e) {
    try{
      return getReader(znewReadableStream(stream));
    }catch{
      return getReader(znewReadableStream(e.message));
    }
  }
}
globalThis.zread = async function zread(reader) {
  if(reader.almostDone) {
    try {
      reader.reader.releaseLock();
    } catch (e) {}
    return {
      value: undefined,
      done: true
    };
  }
  try {
    const rtrn = await reader.reader.read();
    if(rtrn.done) {
      try {
        reader.reader.releaseLock();
      } catch (e) {}
    }
    return rtrn;
  } catch (e) {
    reader.almostDone = true;
    return {
      value: e.message,
      done: false
    };
  }
};
globalThis.zcontrollerClose = function zcontrollerClose(controller) {
  try {
    return controller.close();
  } catch (e) {
    console.log(e);
    return controller;
  }
}
globalThis.transformStream = async function transformStream(res, transform, ctx, options = {}) {
  const req = res instanceof Request;
  res = res.clone();
  try {
    options.timeout ??= 25000;
    options.encode ??= true;
    options.passthrough ??= false;
    let reader = zgetReader(res.body);
    let resolveStreamProcessed, timeoutHandle;
    const streamProcessed = new Promise(resolve => resolveStreamProcessed = resolve);
    const stream = znewReadableStream({
      async start(controller) {
        let modifiedChunk = {
          value: "",
          done: false
        };
        timeoutHandle = setTimeout(() => {
          console.log(`Stream timed out after ${options.timeout}ms`);
          zcontrollerClose(controller);
          resolveStreamProcessed();
        }, options.timeout);
        while(true) {
          try {
            const chunk = await (zread(reader));
            if(chunk.done) {
              break;
            }
            let encodedChunk;
            if(!modifiedChunk.done && !options.passthrough) {
              let decodedChunk = options.encode ? zdecoder().zdecode(chunk.value) : chunk.value;
              modifiedChunk = transform(decodedChunk);
              encodedChunk = options.encode ? zencoder().zencode(modifiedChunk.value) : modifiedChunk;
            } else {
              encodedChunk = chunk.value;
            }
            controller.enqueue(encodedChunk);
          } catch (e) {
            try {
              console.log(e.message);
              controller.enqueue(zencoder().zencode(e.message));
              break;
            } catch {
              break;
            }
          }
        }
        zcontrollerClose(controller);
        resolveStreamProcessed();
      }
    });
    streamProcessed.then(() => {
      tryReleaseLock(stream,reader.reader);
      clearTimeout(timeoutHandle);
    });
    ctx?.waitUntil?.(streamProcessed);
    res = req ? new Request(res, {
      body: stream
    }) : new Response(stream, res);
    return res;
  } catch (e) {
    return res;
  }
}
globalThis.limitResponse = async function limitResponse(res, ctx, timeout) {
  return await transformStream(res, null, ctx, {
    timeout: timeout,
    passthrough: true
  });
}
globalThis.zatob = function(str) {
  str = `${str}`;
  try {
    return atob(str);
  } catch (e) {
    try {
      return btoa(str)
    } catch (e) {
      return str;
    }
  }
}
JSON.zparse = function zparse() {
  try {
    return JSON.parse(...arguments);
  } catch (e) {
    return e;
  }
}
JSON.zstringify = function zparse() {
  try {
    return JSON.stringify(...arguments);
  } catch (e) {
    const a = Object.getOwnPropertyNames(e);
    const obj = {};
    for(const x of a) {
      obj[x] = e[x];
    }
    return JSON.stringify(obj);
  }
}
globalThis.tryReleaseLock = function(stream, reader) {
  if(stream?.locked) {
    try {
      reader.releaseLock();
    } catch (e) {
      console.log(e.message);
    }
  }
}
globalThis.zdecodeURIComponent = function zdecodeURIComponent(txt) {
  try {
    return decodeURIComponent(txt);
  } catch {
    try {
      return decodeURI(txt);
    } catch {
      return txt;
    }
  }
}
globalThis.zencodeURIComponent = function zencodeURIComponent(txt) {
  try {
    return encodeURIComponent(txt);
  } catch {
    try {
      return encodeURI(txt);
    } catch {
      return txt;
    }
  }
}
globalThis.zheadersSet = function zheadersSet(headers, key, val) {
  try {
    return headers.set(key, val);
  } catch (e) {
    try {
      return headers.set(String(key).replace(/[^a-zA-Z-]/g, ''), String(val));
    } catch {
      console.log(e);
    }
  }
}
globalThis.zheadersGet = function zheadersGet(headers, key) {
  try {
    return headers.get(key);
  } catch (e) {
    try {
      return headers.get(String(key).replace(/[^a-zA-Z-]/g, ''));
    } catch {
      console.log(e);
    }
  }
}
