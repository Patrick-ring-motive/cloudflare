import './zreturn.js';
import './base.js';
import './static.js';
import './injects.js';
import {fuzzyMatch} from './fuzz.js';

export default {
  fetch(request, env, ctx) {
    let response = zonRequest(request, env, ctx);
    ctx.waitUntil(response)
    return response
  },
  async scheduled(event, env, ctx) {
    let response = zonRequest(event, env, ctx);
    ctx?.waitUntil?.(response)
    return response
  },
};

globalThis.hostMap = createHostMap({
  "default": ["developer.mozilla.org", "developer.mozilla.org"],
  "git-tdn.typescripts.org": ["raw.githubusercontent.com","raw.githubusercontent.com"]
});




async function zonRequest(request, env, ctx) {
    try {
      request = await limitResponse(request,ctx,25000);
      return await onRequest(request, env, ctx);
  } catch (e) {
      let code = 569;
      console.log(e);
      const match = fuzzyMatch(e.message);
      if (match[2] >= 2) {
        code = +match[0] || 569;
      }
      return znewResponse(arguments[0]+'\n'+e.message+'\n'+e.stack, {
          status: code,
          statusText: e.message
      });
  }
}

let cacheEnabled = false;
cacheEnabled = true;

async function onRequest(request, env, ctx) {
  let cache = 1;
  if(!cacheEnabled || /cache=false/.test(request.url)||/cache=false/.test(request.headers.get('referer'))){
    cache = new Date().getTime();
  }
  let pathmode = false;
  let refpathmode = false;
  if(`${request.headers.get('referer')}`.includes('path=')){
    refpathmode = true;
  }
  if(request.url.includes('path=')){
    const incomingURL = znewURL(request?.url);
    const path = incomingURL?.searchParams?.get?.('path');
    if(path){
      (incomingURL??{}).pathname = zdecodeURIComponent(path);
      request = znewRequest(`${incomingURL}`,request);
      pathmode = true;
    }
  }
  const requestURL = request.url.split('?')[0].split('#')[0].toLowerCase();
  //console.log(requestURL)
  if(~requestURL.search(/sw\.js$/i)){
    return znewResponse((await zfetch(`https://raw.githubusercontent.com/Patrick-ring-motive/service-worker-example/refs/heads/main/sw.js?${new Date().getTime()}`)).body,{headers:{"Content-Type":"text/javascript"}});
  }
  if(~requestURL.search(/sw\.html$/i)){
    return znewResponse(`<script src="sw.js?${cache}"/>`,{headers:{"Content-Type":"text/html"}});
  }
  if(~requestURL.search(/blackjack\.css/i)){
    return znewResponse((await zfetch(`https://raw.githubusercontent.com/Patrick-ring-motive/mdn/refs/heads/main/blackjack.css?${cache}`)).body,{headers:{"Content-Type":"text/css"}});
  }
  if(~requestURL.search(/hookers\.js/i)){
    return znewResponse((await zfetch(`https://raw.githubusercontent.com/Patrick-ring-motive/mdn/refs/heads/main/hookers.js?${cache}`)).body,{headers:{"Content-Type":"text/javascript"}});
  }
  if(~requestURL.search(/indexFetch\.js/i)){
    return znewResponse((await zfetch(`https://raw.githubusercontent.com/Patrick-ring-motive/mdn/refs/heads/main/files/indexFetch.js?${cache}`)).body,{headers:{"Content-Type":"text/javascript"}});
  }
  if(~requestURL.search(/link-resolver\.js/i)){
    let linkRes = znewResponse((await zfetch(`https://raw.githubusercontent.com/Patrick-ring-motive/mdn/refs/heads/main/files/link-resolver.js?${cache}`)).body,{headers:{"Content-Type":"text/javascript"}});
    if(refpathmode){
      const linkResBody = await zresponseText(linkRes);
      linkRes = znewResponse(linkResBody.replaceAll('a[href','[href'),linkRes);
    }
    return linkRes;
  }
  
  let staticRes = checkStatic(request);
  if(staticRes){return staticRes;}
  let url = new URL(request.url);
  const raw = `https://raw.githubusercontent.com/Patrick-ring-motive/mdn/main/files${`${url.pathname.toLowerCase()}`.replace(/\/docs/i,'')}`;
  const benderPromise = zfetchText(`${raw}/bender.xjs?${cache}`);
  const fryPromise = zfetchText(`${raw}/fry.js?${cache}`);
  let workerHost = url.host;
  if(~request.url.search(/hostname=/i)){
    url.host = zdecodeURIComponent([...request.url.split(/hostname=/i)].pop().split(/\?|#/)[0]);
  }else {
    const referer = String(zheadersGet(request.headers,'referer'));  
    if(!~workerHost.search(/^git-tdn/i) && ~referer.search(/hostname=/i)){
      url.host = zdecodeURIComponent(referer.split(/hostname=/i)[1].split(/\?|#|&/)[0]);
    }else{
      url.host = getNewHost(request);
    }
  }
  let req = znewRequest(url.toString(), request);
  req = addRequestHeaders(url, workerHost, request);
  let res = await zfetch(req);
  res = await limitResponse(res,ctx,25000);
 
  if (res.status > 399) {
    const alturl = `${raw}/index.md`;
    res = await zfetch(alturl);
    let otherResources='';
    if(res.ok){
      let data = JSON.zparse(await zresponseText(res));
      if(data.resources){
        const dataResources = data.resources;
        const resources = [];
        const data_resources_length = data.resources.length;
        for(let i = 0;i !== data_resources_length;i++){
          resources.push(zfetchText(dataResources[i]));
        }
        const allResources = (await Promise.all(resources)).map((x,i)=>[dataResources[i],btoa(zencodeURIComponent(x))]);
        otherResources = `<script type="resources">${JSON.zstringify(allResources)}</script>`;
      }
      if(data.extends){
        res = await zfetch(`https://${url.host}${data.extends}`);
        let text = await zresponseText(res);
        if(data.preplacements){
          for(const x in data.preplacements){
            text = text.replace(x,data.preplacements[x]);
          }
        }
        text = text.replace("<head>",
        `<head>
          <script>
            globalThis.cacheEnabled = ${cacheEnabled};
            globalThis.cache = 1;
            if(!globalThis.cacheEnabled){
              globalThis.cache = new Date().getTime();
            }
            Object.defineProperty(Object.prototype, 'toLowerCase',{value:function toLowerCase(){
              if(!globalThis.LowerCaseBugTriggered){
                console.warn('Someone trying to make a non-string lowercase', this);
                globalThis.LowerCaseBugTriggered = true;
              }
              return '';
            },
              enumerable:false,
              writable:true,
              configurable:true
            });
          </script>
          <script src="/?path=sw.js&${cache}"></script>
          <script src='/?path=indexFetch.js&${cache}'></script>
          <script src="https://patrick-ring-motive.github.io/${new URL(alturl).pathname.replace(/\/Patrick-ring-motive\//i,'').replace(/\/main/i,'').replace(/md$/i,'js')}"></script>
          <link rel="stylesheet" href="https://patrick-ring-motive.github.io/${new URL(alturl).pathname.replace(/\/Patrick-ring-motive\//i,'').replace(/\/main/i,'').replace(/md$/i,'css')}"></link>
        ${otherResources}`);
        console.log(text.length);
        res = znewResponse(text,res);
      }
    }
  }
  res = znewResponse(res.body, res);

  const importCSSURL=`/?path=blackjack.css&${cache}`;
  const importJSURL=`/?path=hookers.js${cache}`;
  if (~`${zheadersGet(res.headers,'content-type')}`.search(/html/i)) {
    res = await htmlInject(res,
      `${makeStyle(importCSSURL)}
       <script src="/?path=hookers.js&${cache}"></script>
       <link rel="icon" href="/favicon.png" ></link>
       <script>
       globalThis.objDoProp = function (obj, prop, def, enm, mut) {
        return Object.defineProperty(obj, prop, {
          value: def,
          writable: mut,
          enumerable: enm,
          configurable: mut
        });
      };
      globalThis.objDefProp=(obj, prop, def) => objDoProp (obj, prop, def, false, true);
      objDefProp(Object.prototype,'toLowerCase',function toLowerCase(){
        if(!globalThis.LowerCaseBugTriggered){
          console.warn('Someone trying to make a non-string lowercase', this);
          globalThis.LowerCaseBugTriggered = true;
        }
        return '';
      });
      </script>
       <script>
       globalThis.cacheEnabled = ${cacheEnabled};
       globalThis.cache = 1;
       if(!globalThis.cacheEnabled){
         globalThis.cache = new Date().getTime();
       }
       if(globalThis.hostTargetList){hostTargetList.push("${url.host}");}
       else{globalThis.hostTargetList=["${url.host}"];}
       </script>
       <script src="/?path=sw.js&${cache}"></script>
       <script src='/?path=/link-resolver.js&${cache}'></script>
       <svg style="display:none;">
       <script>
       ${(await benderPromise).replace('Not Found','')}
       </script>
       </svg>
       <script>${await fryPromise}</script>
       <link rel="stylesheet" href="${raw}/leela.css?${cache}"></link>
       <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css" rel="stylesheet"></link>
       `
      );
  }

  if (~`${zheadersGet(res.headers,'content-type')}`.search(/script/i)) {
    res = await scriptInject(res,
    `globalThis.objDoProp = function (obj, prop, def, enm, mut) {
      return Object.defineProperty(obj, prop, {
        value: def,
        writable: mut,
        enumerable: enm,
        configurable: mut
      });
    };
    globalThis.objDefProp=(obj, prop, def) => objDoProp (obj, prop, def, false, true);
    objDefProp(Object.prototype,'toLowerCase',function toLowerCase(){
      if(!globalThis.LowerCaseBugTriggered){
        console.warn('Someone trying to make a non-string lowercase', this);
        globalThis.LowerCaseBugTriggered = true;
      }
      return '';
    });
    if(globalThis.hostTargetList){hostTargetList.push("${url.host}");}
     else{globalThis.hostTargetList=["${ globalThis.hostMap.get(workerHost)[0]}","${ globalThis.hostMap.get(workerHost)[1]}"];}
     if(!globalThis['${importJSURL}']){
       import('${importJSURL}');
     }
     globalThis['${importJSURL}']='${importJSURL}';
    `);
  }
  const isGitURL = ~workerHost.search(/^git-tdn/i);
  if(~String(url).search(/\.js($|\?\#)/i) && isGitURL){
    const dto = serializeHTTP(res);
    res = znewResponse(res?.zresBody?.()??res.body,dto);
    res.headers.set('content-type','text/javascript; charset=utf-8');
    
  }
  if(isGitURL){
    const dto = serializeHTTP(res);
    res = znewResponse(res?.zresBody?.()??res.body,dto);
  }
  if(request.url.endsWith('?.jsml')){
    res.headers.set('content-type','text/html; charset=utf-8');
  }
  if(request.url.endsWith('?.pdf')){
    res.headers.set('content-type','application/pdf');
  }
  if(request.url.endsWith('?.xhtml')){
    res.headers.set('content-type','application/xhtml+xml; charset=utf-8');
  }
  if(request.url.endsWith('?.mhtml')){
    res.headers.set('content-type','multipart/related');
  }
  if(request.url.endsWith('?.xml')){
    res.headers.set('content-type','application/xml; charset=utf-8');
  }
  if(request.url.endsWith('?.jss')){
    res.headers.set('content-type','text/css; charset=utf-8');
  }
  if(request.url.endsWith('?.docx')){
    res.headers.set('content-type','application/vnd.openxmlformats-officedocument; charset=utf-8');
  }
  if(request.url.endsWith('?.ascii')){
    res.headers.set('content-type','text/html; charset=ascii');
  }
  if(request.url.endsWith('?.16')){
    res.headers.set('content-type','text/html; charset=utf-16');
  }
  if(request.url.endsWith('?.64')){
    res = await transformStream(res,btoaChunk,ctx);
    return addResponseHeaders(url, workerHost,res);
  }
  if(request.url.endsWith('?.bit')){
    res = await transformStream(res,bitChunk,ctx);
    return addResponseHeaders(url, workerHost,res);
  }
  if(request.url.endsWith('?.46')){
    res = await transformStream(res,atobChunk,ctx);
    return addResponseHeaders(url, workerHost,res);
  }
  res = addResponseHeaders(url, workerHost,res);
  res.headers.set('got-from',url);
  return await limitResponse(res,ctx,5000);
}


function btoaChunk(chunk) {
  try{
      chunk = btoa(chunk);
      return {
          value: chunk,
          done: false
      };
  }catch{
    return chunk;
  }
}
function atobChunk(chunk) {
  try{
      chunk = atob(chunk);
      return {
          value: chunk,
          done: false
      };
  }catch{
    return chunk;
  }
}

function bitChunk(chunk) {
  try{
      chunk = zencoder().zencode((chunk));
      chunk = zfromCharCodes(chunk);
      return {
          value: chunk,
          done: false
      };
  }catch{
    return chunk;
  }
}
globalThis.makeScript=function(url){
  return `<script src="${url}" href="${url}" ></script>`;
}

globalThis.makeStyle=function(url){
  return `<link rel="stylesheet" href="${url}"></link>
  <style>@import "${url}";</style>
  <link xmlns="http://www.w3.org/1999/xhtml" rel="stylesheet" href="${url}" type="text/css"></link>`;
}
