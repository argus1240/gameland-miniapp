const tg=window.Telegram?.WebApp; tg?.ready(); tg?.expand();    
// دریافت اطلاعات اولیه کاربر از تلگرام
const telegramUser = tg?.initDataUnsafe?.user;

if (telegramUser) {
    const firstName = telegramUser.first_name || 'قهرمان';

    // نمایش نام کاربر
    document.querySelector('.hero .eyebrow').textContent =
        `خوش اومدی ${firstName} قهرمان!`;

    // نمایش عکس پروفایل، اگر موجود باشد
    const profileBtn = document.getElementById('profileBtn');

    if (telegramUser.photo_url) {
        profileBtn.innerHTML = `
            <img src="${telegramUser.photo_url}"
                 alt="پروفایل"
                 style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
        `;
    }
}
const games=[
 {id:'tic',name:'دوز',desc:'سه‌تا پشت سر هم بچین',emoji:'⭕',color:'#533b8c'},
 {id:'car',name:'ماشین‌سواری',desc:'از موانع فرار کن',emoji:'🏎️',color:'#235b78'},
 {id:'puzzle',name:'پازل',desc:'عددها رو مرتب کن',emoji:'🧩',color:'#76502d'},
 {id:'aim',name:'هدف‌گیری',desc:'هدف‌ها رو لمس کن',emoji:'🎯',color:'#75405e'},
 {id:'rps',name:'سنگ کاغذ قیچی',desc:'حریف رو شکست بده',emoji:'✂️',color:'#395b78'},
 {id:'jump',name:'پرش و مانع',desc:'به‌موقع بپر',emoji:'🦘',color:'#3d654e'},
 {id:'image',name:'حدس تصویر',desc:'تصویر رو تشخیص بده',emoji:'🕵️',color:'#594c83'},
 {id:'football',name:'فوتبال',desc:'ضربه پنالتی بزن',emoji:'⚽',color:'#376b5d'}
];
let coins=Number(localStorage.glCoins||0),xp=Number(localStorage.glXp||0),cleanup=null,current='';
const $=id=>document.getElementById(id);
function updateStats(){ $('coins').textContent=coins.toLocaleString('fa-IR');$('xp').textContent=xp.toLocaleString('fa-IR');$('level').textContent=(1+Math.floor(xp/100)).toLocaleString('fa-IR');localStorage.glCoins=coins;localStorage.glXp=xp;}
function reward(n=5){coins+=n;xp+=n*2;updateStats();}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1800)}
function render(){ $('gamesGrid').innerHTML=games.map(g=>`<button class="game-card" data-id="${g.id}" style="--card:${g.color}"><span class="emoji">${g.emoji}</span><b>${g.name}</b><small>${g.desc}</small><span class="arrow">←</span></button>`).join('');document.querySelectorAll('.game-card').forEach(b=>b.onclick=()=>openGame(b.dataset.id));}
function openGame(id){current=id;if(cleanup){cleanup();cleanup=null}$('gameModal').classList.remove('hidden');const g=games.find(x=>x.id===id);$('gameTitle').textContent=g.name;$('gameCategory').textContent='بازی گیم‌لند';startGame(id)}
function closeGame(){if(cleanup){cleanup();cleanup=null}$('gameModal').classList.add('hidden')}
$('closeGame').onclick=closeGame;$('restartGame').onclick=()=>startGame(current);
function status(s){$('gameStatus').textContent=s}
function area(html){$('gameArea').innerHTML=html}
function win(msg='آفرین! امتیاز گرفتی 🎉'){status(msg);reward(10);toast('+۱۰ سکه و +۲۰ تجربه')}
function startGame(id){if(cleanup){cleanup();cleanup=null}status('بازی شروع شد');({tic,car,puzzle,aim,rps,jump,image,football})[id]();}
function tic(){
  let difficulty='medium', player='❌', ai='⭕', board=Array(9).fill('');
  let finished=false, wins=Number(localStorage.glTicWins||0);
  let losses=Number(localStorage.glTicLosses||0), draws=Number(localStorage.glTicDraws||0);

  function sound(freq=600,duration=.12){
    try{
      const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
      const ctx=new C(),osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=freq;gain.gain.value=.06;
      osc.start();gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);
      osc.stop(ctx.currentTime+duration);osc.onended=()=>ctx.close();
    }catch(e){}
  }
  function menu(){
    area(`<div class="game-note">حالت بازی رو انتخاب کن</div>
    <div class="choice-row" style="flex-wrap:wrap">
    <button class="choice-btn" id="ticAI">🤖 بازی با هوش مصنوعی</button>
    <button class="choice-btn" id="ticFriend">👥 دعوت از دوست</button>
    <button class="choice-btn" id="ticRandom">🎲 حریف تصادفی</button></div>
    <div class="game-note">علامت تو کدوم باشه؟</div>
    <div class="choice-row"><button class="answer-btn" id="ticX">❌ ضربدر</button><button class="answer-btn" id="ticO">⭕ دایره</button></div>
    <div class="game-note">درجه سختی هوش مصنوعی</div>
    <div class="choice-row"><button class="answer-btn" data-level="easy">آسان</button><button class="answer-btn" data-level="medium">متوسط</button><button class="answer-btn" data-level="hard">سخت</button></div>
    <p id="ticInfo" class="game-note">آمار برد و باختت ذخیره می‌شه.</p>
    <div class="choice-row"><span>🏆 برد: ${wins}</span><span>💔 باخت: ${losses}</span><span>🤝 مساوی: ${draws}</span></div>`);
    $('ticX').onclick=()=>{player='❌';ai='⭕';sound(650);};
    $('ticO').onclick=()=>{player='⭕';ai='❌';sound(750);};
    document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{
      difficulty=b.dataset.level;document.querySelectorAll('[data-level]').forEach(x=>x.style.outline='');
      b.style.outline='2px solid #b99cff';$('ticInfo').textContent='سختی انتخاب‌شده: '+({easy:'آسان',medium:'متوسط',hard:'سخت'}[difficulty]);
    });
    $('ticAI').onclick=newRound;
    $('ticFriend').onclick=()=>onlineNotice('دعوت از دوست');
    $('ticRandom').onclick=()=>onlineNotice('حریف تصادفی');
  }
  function onlineNotice(name){
    area(`<div style="font-size:48px;text-align:center">🌐</div><h3 style="text-align:center">${name}</h3>
    <p class="game-note">این بخش بعد از راه‌اندازی سرور آنلاین فعال می‌شه.</p><button class="primary-btn" id="ticBack">بازگشت</button>`);
    $('ticBack').onclick=menu;
  }
  function newRound(){
    board=Array(9).fill('');finished=false;draw();
    if(player==='⭕'){status('تو ⭕ هستی؛ هوش مصنوعی ❌ شروع می‌کنه.');setTimeout(aiMove,400);}
    else status('تو ❌ هستی؛ شروع کن!');
  }
  function winningLine(a){
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.find(q=>a[q[0]]&&a[q[0]]===a[q[1]]&&a[q[1]]===a[q[2]])||null;
  }
  function result(a){const line=winningLine(a);return line?a[line[0]]:(a.every(Boolean)?'draw':null);}
  function draw(line=[]){
    area(`<div class="game-note">تو ${player} · هوش مصنوعی ${ai}</div>
    <div class="choice-row" style="justify-content:center;margin-bottom:12px"><span>🏆 برد: ${wins}</span><span>💔 باخت: ${losses}</span><span>🤝 مساوی: ${draws}</span></div>
    <div class="board" id="ticBoard" style="grid-template-columns:repeat(3,1fr);gap:9px"></div>
    <div class="choice-row" style="margin-top:14px"><button class="action-btn" id="ticAgain">دور جدید ↻</button><button class="answer-btn" id="ticMenu">انتخاب حالت</button></div>`);
    const b=$('ticBoard');
    b.innerHTML=board.map((v,i)=>`<button data-i="${i}" style="font-size:38px;min-height:78px;border-radius:16px;transition:transform .2s,background .2s;${line.includes(i)?'background:linear-gradient(135deg,#6844a8,#b18aff);transform:scale(1.04);box-shadow:0 0 18px #a77cff;':''}">${v}</button>`).join('');
    b.querySelectorAll('button').forEach(x=>x.onclick=()=>humanMove(+x.dataset.i));
    $('ticAgain').onclick=newRound;$('ticMenu').onclick=menu;
  }
  function finish(r){
    finished=true;const line=winningLine(board)||[];
    if(r===player){wins++;localStorage.glTicWins=wins;sound(880,.25);status('تو برنده شدی! 🏆🎉');win('قهرمان دوز شدی!');}
    else if(r===ai){losses++;localStorage.glTicLosses=losses;sound(220,.3);status('این دور رو هوش مصنوعی برد؛ دوباره تلاش کن!');}
    else{draws++;localStorage.glTicDraws=draws;sound(440,.2);status('بازی مساوی شد! 🤝');}
    draw(line);
  }
  function minimax(a,isAI){
    const r=result(a);if(r===ai)return 10;if(r===player)return -10;if(r==='draw')return 0;
    let best=isAI?-Infinity:Infinity;
    for(let i=0;i<9;i++)if(!a[i]){a[i]=isAI?ai:player;const score=minimax(a,!isAI);a[i]='';best=isAI?Math.max(best,score):Math.min(best,score);}
    return best;
  }
  function aiMove(){
    if(finished)return;const options=board.map((v,i)=>v?null:i).filter(v=>v!==null);if(!options.length)return;
    let move;
    if(difficulty==='easy'||(difficulty==='medium'&&Math.random()<.45))move=options[Math.floor(Math.random()*options.length)];
    else{let best=-Infinity;for(const i of options){board[i]=ai;const score=minimax(board,false);board[i]='';if(score>best){best=score;move=i;}}}
    board[move]=ai;sound(420);const r=result(board);if(r){finish(r);return;}draw();status('نوبت توئه!');
  }
  function humanMove(i){
    if(finished||board[i])return;board[i]=player;sound(680);const r=result(board);
    if(r){finish(r);return;}draw();status('هوش مصنوعی در حال فکر کردنه...');setTimeout(aiMove,350);
  }
  menu();
}

  function menu(){
    area(`
      <div class="game-note">روش بازی دوز رو انتخاب کن</div>
      <div class="choice-row" style="flex-wrap:wrap">
        <button class="choice-btn" id="ticAI">🤖 بازی با هوش مصنوعی</button>
        <button class="choice-btn" id="ticFriend">👥 دعوت از دوست</button>
        <button class="choice-btn" id="ticRandom">🎲 حریف تصادفی</button>
      </div>
      <div class="game-note">درجه سختی هوش مصنوعی</div>
      <div class="choice-row">
        <button class="answer-btn" data-level="easy">آسان</button>
        <button class="answer-btn" data-level="medium">متوسط</button>
        <button class="answer-btn" data-level="hard">سخت</button>
      </div>
      <p id="ticInfo" class="game-note">در حالت سخت، هوش مصنوعی بهترین حرکت را انتخاب می‌کند.</p>
    `);
    document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{
      difficulty=b.dataset.level;
      document.querySelectorAll('[data-level]').forEach(x=>x.style.outline='');
      b.style.outline='2px solid #b99cff';
      $('ticInfo').textContent='درجه سختی انتخاب شد: '+({easy:'آسان',medium:'متوسط',hard:'سخت'}[difficulty]);
    });
    $('ticAI').onclick=newRound;
    $('ticFriend').onclick=()=>onlineNotice('دعوت از دوست');
    $('ticRandom').onclick=()=>onlineNotice('حریف تصادفی');
  }

  function onlineNotice(name){
    area(`<div style="font-size:48px;text-align:center">🌐</div>
      <h3 style="text-align:center">${name}</h3>
      <p class="game-note">این بخش بعد از راه‌اندازی سرور آنلاین فعال می‌شود. فعلاً بازی واقعی از دو گوشی ممکن نیست.</p>
      <button class="primary-btn" id="ticBack">بازگشت</button>`);
    $('ticBack').onclick=menu;
  }

  function newRound(){
    board=Array(9).fill(''); finished=false; draw(); status('تو ❌ هستی؛ شروع کن!');
  }

  function draw(){
    area(`<div class="game-note">تو ❌ هستی و هوش مصنوعی ⭕ است.</div>
      <div class="choice-row" style="justify-content:center;margin-bottom:12px">
        <span>برد: ${wins}</span><span>باخت: ${losses}</span><span>مساوی: ${draws}</span>
      </div>
      <div class="board" id="ticBoard" style="grid-template-columns:repeat(3,1fr)"></div>
      <div class="choice-row" style="margin-top:14px">
        <button class="action-btn" id="ticAgain">دور جدید ↻</button>
        <button class="answer-btn" id="ticMenu">انتخاب حالت</button>
      </div>`);
    const b=$('ticBoard');
    b.innerHTML=board.map((v,i)=>`<button data-i="${i}" style="font-size:34px;min-height:76px">${v}</button>`).join('');
    b.querySelectorAll('button').forEach(x=>x.onclick=()=>humanMove(+x.dataset.i));
    $('ticAgain').onclick=newRound; $('ticMenu').onclick=menu;
  }

  function winner(a){
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const q of lines) if(a[q[0]]&&a[q[0]]===a[q[1]]&&a[q[1]]===a[q[2]]) return a[q[0]];
    return a.every(Boolean)?'draw':null;
  }

  function finish(r){
    finished=true;
    if(r==='❌'){wins++;status('تو بردی! 🏆');win('دوز رو بردی! 🎉')}
    else if(r==='⭕'){losses++;status('هوش مصنوعی این دور رو برد؛ دوباره تلاش کن!')}
    else {draws++;status('بازی مساوی شد!')}
    draw();
  }

  function humanMove(i){
    if(finished||board[i])return;
    board[i]='❌'; let r=winner(board);
    if(r){finish(r);return}
    draw(); status('هوش مصنوعی در حال فکر کردنه...');
    setTimeout(aiMove,350);
  }

  function minimax(a,aiTurn){
    const r=winner(a);
    if(r==='⭕')return 10; if(r==='❌')return -10; if(r==='draw')return 0;
    let best=aiTurn?-Infinity:Infinity;
    for(let i=0;i<9;i++)if(!a[i]){
      a[i]=aiTurn?'⭕':'❌'; const s=minimax(a,!aiTurn); a[i]='';
      best=aiTurn?Math.max(best,s):Math.min(best,s);
    }
    return best;
  }

  function aiMove(){
    if(finished)return;
    const options=board.map((v,i)=>v?null:i).filter(v=>v!==null);
    if(!options.length)return;
    let move;
    if(difficulty==='easy'||(difficulty==='medium'&&Math.random()<0.45)){
      move=options[Math.floor(Math.random()*options.length)];
    }else{
      let best=-Infinity;
      for(const i of options){
        board[i]='⭕'; const s=minimax(board,false); board[i]='';
        if(s>best){best=s;move=i}
      }
    }
    board[move]='⭕'; const r=winner(board);
    if(r){finish(r);return}
    draw(); status('نوبت توئه!');
  }

  menu();
}
function car(){area('<div class="game-note">با دکمه‌های چپ و راست از ماشین‌ها دوری کن. ۲۰ ثانیه دوام بیار!</div><div class="track" id="track"><div class="lane"></div><div class="player" id="player">🏎️</div></div><div class="choice-row"><button class="action-btn" id="left">⬅️</button><button class="action-btn" id="right">➡️</button></div>');let lane=1,obs=[],score=0,track=$('track'),p=$('player'),alive=true;function move(d){lane=Math.max(0,Math.min(2,lane+d));p.style.left=`calc(${(lane+0.5)*33.333}% - 18px)`}$('left').onclick=()=>move(-1);$('right').onclick=()=>move(1);let t=setInterval(()=>{if(!alive)return;score++;let o=document.createElement('span');o.className='obstacle';o.textContent='🚧';o.style.left=(Math.floor(Math.random()*3)*33+8)+'%';track.append(o);obs.push({el:o,y:-40,lane:Math.round((parseFloat(o.style.left)-8)/33)});obs.forEach(x=>{x.y+=7;x.el.style.top=x.y+'px';if(x.y>160&&x.y<215&&x.lane===lane)finish(false);if(x.y>245)x.el.remove()});obs=obs.filter(x=>x.y<250);if(score>=200)finish(true)},100);function finish(ok){if(!alive)return;alive=false;clearInterval(t);status(ok?'رکورد عالی!':'برخورد کردی! امتیاز: '+score);if(ok)win()}cleanup=()=>{alive=false;clearInterval(t)};}
function puzzle(){let a=[1,2,3,4,5,6,7,8,0];for(let i=0;i<35;i++){let z=a.indexOf(0),opts=[z-3,z+3,...(z%3?[z-1]:[]),...(z%3<2?[z+1]:[])].filter(n=>n>=0&&n<9&&Math.abs(Math.floor(n/3)-Math.floor(z/3))+Math.abs(n%3-z%3)===1),n=opts[Math.floor(Math.random()*opts.length)];[a[z],a[n]]=[a[n],a[z]]}area('<p class="game-note">عددها رو از ۱ تا ۸ مرتب کن.</p><div class="puzzle" id="puzzle"></div>');let el=$('puzzle');function draw(){el.innerHTML=a.map((v,i)=>`<button class="${v?'':'blank'}" data-i="${i}">${v||''}</button>`).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{let i=+b.dataset.i,z=a.indexOf(0);if([z-3,z+3,z-1,z+1].includes(i)&&Math.abs(Math.floor(i/3)-Math.floor(z/3))+Math.abs(i%3-z%3)===1){[a[z],a[i]]=[a[i],a[z]];draw();if(a.join(',')==='1,2,3,4,5,6,7,8,0')win('پازل حل شد!')}})}draw();}
function aim(){let score=0,time=15;area('<p class="game-note">هرچندتا هدف می‌تونی در ۱۵ ثانیه لمس کن!</p><div class="meter"><div id="timebar"></div></div><button class="target" id="target" style="width:110px;height:110px;border-radius:50%;font-size:48px">🎯</button><b id="aimScore">۰</b>');let target=$('target');target.onclick=()=>{score++;$('aimScore').textContent=score.toLocaleString('fa-IR');target.style.marginRight=Math.random()*100-50+'px';target.style.marginTop=Math.random()*30+'px'};let t=setInterval(()=>{time--;$('timebar').style.width=(time/15*100)+'%';if(time<=0){clearInterval(t);status('تعداد هدف: '+score);if(score>=5)win()}},1000);cleanup=()=>clearInterval(t);}
function rps(){let choices=['سنگ','کاغذ','قیچی'],em=['✊','✋','✌️'];area('<p class="game-note">انتخاب کن؛ ببین می‌تونی ربات رو ببری؟</p><div class="choice-row">'+choices.map((c,i)=>`<button class="choice-btn" data-v="${i}">${em[i]}<small style="display:block;font-size:11px">${c}</small></button>`).join('')+'</div><h3 id="rpsResult">🤖 منتظر انتخاب توام</h3>');document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{let u=+b.dataset.v,v=Math.floor(Math.random()*3),r=u===v?'مساوی!':(u-v+3)%3===1?'تو بردی! 🎉':'این بار ربات برد!';$('rpsResult').textContent=`تو ${em[u]} | ربات ${em[v]} — ${r}`;status(r);if(r.startsWith('تو بردی'))win()});}
function jump(){area('<p class="game-note">برای پریدن روی دکمه بزن؛ از مانع رد شو.</p><div class="track" id="jumpTrack"><div class="player" id="jumper">🏃</div><span class="obstacle" id="jumpObs" style="left:75%;top:175px">🪨</span></div><button class="action-btn" id="jumpBtn">بپر! ⬆️</button>');let score=0,over=false,obs=$('jumpObs'),p=$('jumper');$('jumpBtn').onclick=()=>{if(over)return;p.style.bottom='100px';setTimeout(()=>p.style.bottom='18px',400);score++;status('پرش: '+score);if(score>=8){over=true;win('مرحله رو رد کردی!')}};let t=setInterval(()=>{if(over)return;obs.style.left=(10+Math.random()*75)+'%';},800);cleanup=()=>{over=true;clearInterval(t)};}
function image(){let qs=[['🐼','پاندا'],['🍕','پیتزا'],['🚀','موشک'],['🦁','شیر'],['🎸','گیتار']];let q=qs[Math.floor(Math.random()*qs.length)];area(`<p class="game-note">این تصویر چیه؟</p><div style="font-size:100px">${q[0]}</div><div class="choice-row">${[q[1],...qs.filter(x=>x!==q).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1])].sort(()=>Math.random()-.5).map(x=>`<button class="answer-btn" style="font-size:14px;padding:10px 13px">${x}</button>`).join('')}</div>`);document.querySelectorAll('.answer-btn').forEach(b=>b.onclick=()=>{if(b.textContent===q[1])win('درست حدس زدی!');else status('اشتباه بود؛ دوباره تلاش کن')});}
function football(){let goals=0,kicks=0;area('<p class="game-note">جهت ضربه رو انتخاب کن و به دروازه گل بزن!</p><div style="font-size:100px">🥅</div><div class="choice-row"><button class="choice-btn" data-side="چپ">⬅️</button><button class="choice-btn" data-side="وسط">⬆️</button><button class="choice-btn" data-side="راست">➡️</button></div><h3 id="footResult">گل‌ها: ۰ از ۵</h3>');document.querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>{if(kicks>=5)return;kicks++;let goal=Math.random()>.38;goals+=goal?1:0;$('footResult').textContent=(goal?'⚽ گل شد!':'🧤 دروازه‌بان گرفت!')+` گل‌ها: ${goals} از ۵`;status('ضربه '+kicks+' از ۵');if(kicks===5&&goals>=3)win('پنالتی رو بردی!')});}
$('dailyBtn').onclick=()=>{let day=new Date().toDateString();if(localStorage.glDaily===day){toast('جایزه امروز رو قبلاً گرفتی!');return}localStorage.glDaily=day;coins+=25;xp+=10;updateStats();toast('۲۵ سکه و ۱۰ تجربه گرفتی! 🎁')};
$('profileBtn').onclick=()=>toast('پروفایل: سطح '+(1+Math.floor(xp/100))+' | '+coins+' سکه');
updateStats();render();
