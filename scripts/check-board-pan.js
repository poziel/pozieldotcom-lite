// Browser regression check against a local production preview on port 5180.
// Run: npx --package @playwright/cli playwright-cli run-code --filename=scripts/check-board-pan.js
// Only local browser responses are mocked; no notes are published.
async (page) => {
 await page.route('**/functions/v1/notes', route => route.fulfill({json:Array.from({length:120},(_,i)=>({id:`fixture-${i}`,x:(i%12)*65-400,y:Math.floor(i/12)*45-220,message:'Performance fixture note '+i,author:'Preview',color:'butter',angle:0,canEdit:false}))}));
 await page.goto('http://127.0.0.1:5180/notes');
 await page.waitForSelector('.posted-note');
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Performance.enable'); const results=[];
 for(const mobile of [false,true]) {
 await page.setViewportSize(mobile?{width:390,height:844}:{width:1440,height:900});
 await page.reload(); await page.waitForSelector('.posted-note');
 await page.evaluate(()=>{window.panWrites=0;window.panEvents=0; new MutationObserver(ms=>window.panWrites+=ms.filter(m=>m.type==='attributes'&&m.attributeName==='style').length).observe(document.querySelector('.board-viewport'),{subtree:true,attributes:true});document.querySelector('.board-viewport').addEventListener('pointermove',()=>window.panEvents++);});
 const b=await page.locator('.board-viewport').boundingBox(); const x=b.x+b.width/2,y=b.y+b.height/2;
 const before=(await cdp.send('Performance.getMetrics')).metrics;
 if(mobile) await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]}); else {await page.mouse.move(x,y);await page.mouse.down();}
 for(let i=1;i<=40;i++){ if(mobile) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*2,y:y+i}]});else await page.mouse.move(x+i*2,y+i); }
 if(mobile) await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.mouse.up();
 const after=(await cdp.send('Performance.getMetrics')).metrics;
 results.push({mobile,...await page.evaluate(()=>({writes:window.panWrites,events:window.panEvents,camera:document.querySelector('.camera-position').textContent})),metrics:Object.fromEntries(['LayoutCount','LayoutDuration','RecalcStyleCount','TaskDuration'].map(n=>[n,after.find(m=>m.name===n).value-before.find(m=>m.name===n).value]))});
 }
 for (const result of results) {
  if (result.camera !== '-80, -40') throw new Error('Pan lost pointer movement: ' + JSON.stringify(result));
  if (result.writes > 200) throw new Error('Pan is updating individual notes again: ' + JSON.stringify(result));
 }
 await page.unroute('**/functions/v1/notes');
 return results;
}
