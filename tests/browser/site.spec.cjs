const {test,expect} = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const lesson='c1-signals-and-systems/m1-intro-to-signals-and-systems/01-what-is-a-signal/00-intro/';
const quiz='c1-signals-and-systems/m1-intro-to-signals-and-systems/01-what-is-a-signal/02-quiz/';
const multi='c1-signals-and-systems/m1-intro-to-signals-and-systems/02-signal-properties/09-symmetry-quiz/';
test.beforeEach(async ({page}) => {
  // Keep tests independent of third-party CDN availability.
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.route('https://fonts.gstatic.com/**',r=>r.abort());
});
for (const width of [360,768,1440]) for (const scheme of ['light','dark']) {
  test(`layout and accessibility ${width} ${scheme}`,async ({page}) => {
    await page.setViewportSize({width,height:900}); await page.emulateMedia({colorScheme:scheme});
    for (const path of ['',lesson,quiz,'practice/','c0-test/m1-test/repl/','c0-test/m1-test/plot-demo/']) {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1)).toBeTruthy();
      const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      if (!path) await page.screenshot({path:`/tmp/ve-home-${width}-${scheme}.png`,fullPage:true});
      expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
    }
  });
}
test('explicit completion, reload, continuation, and invalidation',async ({page})=>{
  await page.goto(lesson);
  await expect(page.getByRole('button',{name:'Mark complete',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Mark complete',exact:true}).click();
  await page.reload(); await expect(page.getByRole('button',{name:'Mark incomplete',exact:true})).toBeVisible();
  await page.goto(quiz);
  await expect(page.getByRole('button',{name:'Mark complete',exact:true})).toBeDisabled();
  await page.locator('.mcq').evaluateAll(nodes=>nodes.forEach(q=>{
    q.querySelector(`input[value="${q.dataset.answer}"]`).click();
    q.querySelector('.mcq-check')?.click();
  }));
  const all=page.locator('#quiz-check-all'); if(await all.count()) await all.click();
  await page.getByRole('button',{name:'Mark complete',exact:true}).click();
  await page.reload(); await expect(page.getByRole('button',{name:'Mark incomplete',exact:true})).toBeVisible();
  await page.locator('.mcq input').first().check();
  await expect(page.getByRole('button',{name:'Mark complete',exact:true})).toBeDisabled();
  await page.goto(''); await expect(page.locator('#ve-continue a')).toHaveAttribute('href',new RegExp('02-quiz/$'));
});
test('keyboard quiz controls and stable IDs',async ({page})=>{
  await page.goto(multi);
  const option=page.locator('.mcq input').first(); await option.focus(); await page.keyboard.press('Space'); await expect(option).toBeChecked();
  const id=await page.locator('.mcq').first().getAttribute('data-question-id');
  await page.reload(); await expect(page.locator(`[data-question-id="${id}"] input`).first()).toBeChecked();
  await page.locator('.mcq').evaluateAll(nodes=>nodes[0].parentNode.appendChild(nodes[0]));
  expect(await page.evaluate(id=>VELearning.quiz(id).sel,id)).toBe('a');
});
test('migration preserves legacy records and excludes non-lessons',async ({page})=>{
  await page.goto(lesson); const id=await page.evaluate(()=>VE_SITE.pageId);
  await page.evaluate(({lesson,quiz})=>{
    localStorage.removeItem('ve:learning:v2');
    localStorage.setItem('ve:progress',JSON.stringify({['/vector-engineering/'+lesson]:{done:true},'/vector-engineering/':{done:true}}));
    localStorage.setItem('mcq:/vector-engineering/'+quiz+':0',JSON.stringify({sel:'b',checked:true}));
  },{lesson,quiz});
  await page.reload(); expect(await page.evaluate(id=>VELearning.done(id),id)).toBeTruthy();
  expect(await page.evaluate(()=>localStorage.getItem('ve:progress'))).toContain('done');
  await page.goto(quiz); await expect(page.locator('.mcq').first().locator('input[value="b"]')).toBeChecked();
  expect(await page.evaluate(()=>VELearning.lessons.every(p=>p.kind==='lesson' && !p.url.startsWith('c0-test')))).toBeTruthy();
});
test('blocked storage still permits quizzes',async ({page})=>{
  await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('blocked')};Storage.prototype.getItem=()=>{throw Error('blocked')};});
  await page.goto(quiz); await page.locator('.mcq input').first().check(); await expect(page.locator('.mcq input').first()).toBeChecked();
  await page.goto(''); await expect(page.locator('#ve-progress-panel')).toContainText('storage is unavailable');
});
test('invalid imports are atomic; valid export roundtrip',async ({page})=>{
  await page.goto('');
  const original=await page.evaluate(()=>VELearning.export());
  await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":99}')});
  await expect(page.locator('#ve-progress-panel')).toContainText('Could not import');
  expect(await page.evaluate(()=>VELearning.export())).toBe(original);
  page.on('dialog',d=>d.accept());
  const value=JSON.parse(original); const id=await page.evaluate(()=>VELearning.lessons[0].id);value.lessons[id]={done:true};
  await Promise.all([page.waitForEvent('load'), page.locator('input[type=file]').setInputFiles({name:'good.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))})]);
  await expect.poll(()=>page.evaluate(id=>VELearning.done(id),id)).toBe(true);
});
test('no API means no API requests',async ({page})=>{
  const requests=[];page.on('request',r=>{if(r.url().includes('/api/'))requests.push(r.url());});
  for(const path of ['c0-test/m1-test/demo/','c0-test/m1-test/plot-demo/']){
    await page.goto(path); await expect(page.getByRole('status')).toContainText('no API is configured');
  }
  expect(requests).toEqual([]);
});
test('configured demo keeps errors, retry and last good images',async ({page})=>{
  await page.goto('c0-test/m1-test/demo/');
  await page.evaluate(()=>VE_SITE.apiBaseUrl='https://api.example.test');
  let fail=false;
  await page.route('https://api.example.test/**',route=>fail?route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({detail:'Busy'})}):route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'}));
  await page.evaluate(()=>{
    const host=document.getElementById('edge-demo'),status=document.createElement('p');host.append(status);status.id='test-status';
    let client; const update=()=>client.run([{path:'/api/edge-demo',params:{},img:document.getElementById('edge-image')}]);
    client=VEDemo(host,status,update);window.testUpdate=update;update();
  });
  await expect(page.locator('#test-status')).toHaveText('Updated.');
  const old=await page.locator('#edge-image').getAttribute('src'); fail=true;await page.evaluate(()=>testUpdate());
  await expect(page.locator('#test-status')).toContainText('Busy');await expect(page.locator('#edge-image')).toHaveAttribute('src',old);
  fail=false;await page.getByRole('button',{name:'Retry',exact:true}).click();await expect(page.locator('#test-status')).toHaveText('Updated.');
});
test('reading does not auto-complete or extend a streak',async ({page})=>{
  await page.goto(lesson); await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
  await page.clock.install(); await page.clock.fastForward(10000);
  expect(await page.evaluate(()=>VELearning.done(VE_SITE.pageId))).toBe(false);
  expect(await page.evaluate(()=>VELearning.streak().days)).toBe(0);
  await page.getByRole('button',{name:'Mark complete',exact:true}).click();
  expect(await page.evaluate(()=>VELearning.streak().days)).toBe(1);
});
test('local calendar streak crosses DST and expires after inactivity',async ({page})=>{
  await page.clock.install({time:new Date('2026-03-09T12:00:00')});
  await page.goto('');
  const result=await page.evaluate(()=>{
    const state=JSON.parse(VELearning.export());state.activity=['2026-03-07','2026-03-08'];VELearning.replace(state);
    const active=VELearning.streak();state.activity=['2026-03-01','2026-03-02'];VELearning.replace(state);
    return {active,expired:VELearning.streak()};
  });
  expect(result.active).toEqual({days:2,best:2});expect(result.expired).toEqual({days:0,best:2});
});
test('stale demo responses cannot overwrite the current image',async ({page})=>{
  await page.goto('c0-test/m1-test/demo/');
  await page.evaluate(()=>{
    VE_SITE.apiBaseUrl='https://api.example.test';
    window.pending=[];window.fetch=()=>new Promise(resolve=>pending.push(resolve));
    const status=document.createElement('p');document.body.append(status);status.id='race-status';
    const client=VEDemo(document.body,status,()=>{});
    const request=()=>client.run([{path:'/api/edge-demo',params:{},img:document.getElementById('edge-image')}]);
    request();request();
    pending[1](new Response(new Blob(['new'])));
  });
  await expect(page.locator('#race-status')).toHaveText('Updated.');
  const src=await page.locator('#edge-image').getAttribute('src');
  await page.evaluate(()=>pending[0](new Response(new Blob(['old']))));
  await expect(page.locator('#edge-image')).toHaveAttribute('src',src);
});
test('demo timeout remains visible and can be retried',async ({page})=>{
  await page.goto('c0-test/m1-test/demo/');await page.clock.install();
  await page.evaluate(()=>{
    VE_SITE.apiBaseUrl='https://api.example.test';
    window.fetch=(_,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));
    const status=document.createElement('p');document.body.append(status);status.id='timeout-status';
    const client=VEDemo(document.body,status,()=>{});client.run([{path:'/api/edge-demo',params:{},img:document.getElementById('edge-image')}]);
  });
  await page.clock.fastForward(12001);
  await expect(page.locator('#timeout-status')).toContainText('Request timed out.');
  await expect(page.getByRole('button',{name:'Retry',exact:true})).toBeVisible();
});
test('Python worker stop, reset, load timeout, and execution timeout',async ({page})=>{
  await page.addInitScript(()=>{
    window.Worker=class {
      constructor(){window.pythonWorkers??=[];window.pythonWorkers.push(this);}
      postMessage(message){this.message=message;}
      terminate(){this.terminated=true;}
    };
  });
  await page.goto('c0-test/m1-test/repl/');await page.clock.install();
  await page.getByRole('button',{name:'Run',exact:true}).click();
  await expect(page.getByRole('button',{name:'Stop',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Stop',exact:true}).click();
  expect(await page.evaluate(()=>pythonWorkers.at(-1).terminated)).toBe(true);
  await page.getByRole('button',{name:'Run',exact:true}).click();
  await page.clock.fastForward(60001);await expect(page.locator('#repl-errors')).toContainText('loading timed out');
  await page.getByRole('button',{name:'Run',exact:true}).click();
  await page.evaluate(()=>pythonWorkers.at(-1).onmessage({data:{type:'ready'}}));
  await page.clock.fastForward(20001);await expect(page.locator('#repl-errors')).toContainText('Execution timed out');
  await page.getByRole('button',{name:'Reset Python',exact:true}).click();
  await expect(page.locator('#repl-errors')).toBeEmpty();
});
