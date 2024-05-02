document.body.textContent='';

globalThis.streamQueue=[];
globalThis.unmodifiedOutput='';
setInterval(function(){
  let output='';
  while(streamQueue.length){
   output += streamQueue.shift(); 
  }  
  if(output.length){
    unmodifiedOutput = unmodifiedOutput + output;
    document.body.textContent = unmodifiedOutput.toUpperCase();
  }
},100);

void async function test(){
    let testStream = (await zfetch(`${location.href}?${new Date().getTime()}`)).zbody();
    let testReader = testStream.zgetReader();
    while(true){
        const chunk = await zread(testReader);
        if(chunk.done){break;}
        let decodedChunk = zdecoder().zdecode(chunk.value);
        streamQueue.push(decodedChunk); 
    }    
}();
