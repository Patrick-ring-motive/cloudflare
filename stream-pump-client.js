document.body='';

globalThis.streamQueue=[];

setInterval(function(){
  while(streamQueue.length){
   output = streamQueue.shift(); 
  }
  if(output.lengh){
    body.textContent=body.textContent+output;
  }
},100);

void async function test(){
    let testStream = (await zfetch(location.href)).zbody();
    let testReader = testStream.zgetReader();
    while(true){
        const chunk = await zread(testReader);
        if(chunk.done){break;}
        let decodedChunk = zdecoder().zdecode(chunk.value);
        streamQueue.push(decodedChunk); 
    }    
}();
