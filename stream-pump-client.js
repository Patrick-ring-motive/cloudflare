(document?.body??{}).textContent = '';

globalThis.streamQueue = [];
globalThis.unmodifiedOutput = '';
setInterval(()=>{
  let output = '';
  while(streamQueue?.length){
   output += streamQueue?.shift?.(); 
  }  
  if(output?.length){
    unmodifiedOutput += output;
    (document?.body??{}).textContent = unmodifiedOutput?.toUpperCase?.();
  }
},100);

void async function test(){
    const testStream = (await zfetch(`${location.href}?${new Date().getTime()}`))?.zbody?.();
    const testReader = testStream?.zgetReader?.();
    while(testReader){
        const chunk = await zread?.(testReader);
        if(chunk?.done){break;}
        const decodedChunk = zdecoder?.()?.zdecode?.(chunk?.value);
        streamQueue?.push?.(decodedChunk); 
    }    
}();
