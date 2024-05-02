document.body.textContent='';

globalThis.streamQueue=[];
globalThis.runningTotal='';
setInterval(function(){
  let output='';
  while(streamQueue.length){
   output += streamQueue.shift(); 
  }  
  if(output.length){
    runningTotal = runningTotal + output;
    document.body.textContent = runningTotal.replace(/<head.*\/head>/gi,'HEAD').replace(/<script.*script>/gi,'SCRIPT').replace(/<style.*style>/gi,'STYLE').replace(/<[^>]*>/g,' ');
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
