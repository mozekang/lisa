const $=id=>document.getElementById(id);
const zones=[
{id:'bed',name:'ベッド',icon:'☾',emoji:'🛏️',sub:'ふわふわ、ひとやすみ',x:21,y:67,tx:31,ty:64,actions:[['ひとやすみする','げんきが回復したよ。',20,5,0],['おひるねする','いい夢を見られたかな？',30,8,-5]]},
{id:'kitchen',name:'キッチン',icon:'♧',emoji:'🍳',sub:'おいしい時間をつくろう',x:79,y:23,tx:73,ty:43,actions:[['ごはんをつくる','できたてのごはん、おいしいね。',-5,8,25],['お茶をいれる','ほっとする、やさしい時間。',5,10,5]]},
{id:'desk',name:'デスク',icon:'✎',emoji:'📖',sub:'小さな「好き」を楽しむ',x:51,y:58,tx:41,ty:68,actions:[['日記を書く','今日の思い出を、日記に。',-5,15,0],['本を読む','物語の世界へ、ちょっとおでかけ。',-3,12,0]]},
{id:'wardrobe',name:'クローゼット',icon:'♧',emoji:'🎀',sub:'今日の気分は、どんな色？',x:20,y:23,tx:32,ty:42,actions:[['お洋服を選ぶ','お気に入りのコーデを見つけた！',-3,12,0],['おかたづけする','すっきりすると、気持ちも晴れるね。',-8,10,0]]},
{id:'dog',name:'わんこ',icon:'♡',emoji:'🐾',sub:'もふもふの、たいせつな家族',x:35,y:78,tx:39,ty:79,actions:[['なでなでする','わんこもうれしそう！',0,20,0],['いっしょに遊ぶ','たくさん遊んで、なかよしに。',-10,25,-5]]}
];
let position={x:57,y:43},route=[],selected=null,last=0,stats=[82,90,68],toastTimer,sound=false,audio;
const room=$('room'),character=$('character');
character.dataset.direction='down';
function place(){character.style.left=position.x+'%';character.style.top=position.y+'%'}place();
// Obstacles are furniture footprints in normalized floor-plan coordinates.
const blocks=[[3,2,33,29],[34,2,96,30],[4,44,29,96],[43,53,60,84],[63,60,98,98],[95,33,99,61]];
function blocked(x,y){return x<4||x>96||y<32||y>94||blocks.some(([a,b,c,d])=>x>=a&&x<=c&&y>=b&&y<=d)}
function pathTo(target){const step=2,key=(x,y)=>x+','+y,snap=v=>Math.round(v/step)*step;let sx=snap(position.x),sy=snap(position.y),gx=snap(target.x),gy=snap(target.y);if(blocked(gx,gy))return null;const queue=[[sx,sy]],seen=new Set([key(sx,sy)]),prev=new Map();for(let i=0;i<queue.length;i++){const [x,y]=queue[i];if(x===gx&&y===gy){let p=[{x:gx,y:gy}],k=key(x,y);while(prev.has(k)){const n=prev.get(k);p.push({x:n[0],y:n[1]});k=key(...n)}return p.reverse().slice(1).concat([target])}for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(!seen.has(k)&&!blocked(nx,ny)){seen.add(k);prev.set(k,[x,y]);queue.push([nx,ny])}}}return null}
// Each image has its own button, identity, action and accessible name.
const objects=[
 ['wardrobe',4,3,13,28,'クローゼット',32,42],
 ['wardrobe-two',17,3,13,28,'クローゼット 2',32,42],
 ['vase',31,11,5,17,'花瓶',38,42],
 ['robot',44,22,5,10,'ロボット掃除機',46,42],
 ['fridge',51,9,6,22,'冷蔵庫',56,42],
 ['microwave',51,3,6,8,'電子レンジ',56,42],
 ['dryer',57,8,6,23,'乾燥機',60,42],
 ['washer',63,8,6,23,'洗濯機',66,42],
 ['kitchen',69,3,29,28,'キッチン',73,43],
 ['long-table',4,45,6,49,'ロングテーブル',32,64],
 ['bed',10,45,19,49,'ベッド',31,64],
 ['desk',43,52,16,19,'デスク',41,68],
 ['chair',47,68,7,18,'椅子',41,72],
 ['dog',32,70,8,16,'わんこ',39,79]
];
for(const [id,x,y,w,h,name,tx,ty] of objects){
 const original=zones.find(z=>z.id===id)||(id==='wardrobe-two'?zones.find(z=>z.id==='wardrobe'):null);
 const z=original?{...original,id,name,tx,ty}:{id,name,tx,ty,emoji:'✧',actions:[['調べる','お気に入りの家具を眺めた。',0,3,0]]};
 const b=document.createElement('button');b.className='room-object';b.dataset.zone=id;b.dataset.object=id;b.setAttribute('aria-label',name);b.title=name;
 Object.assign(b.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
 const img=document.createElement('img');img.src='/assets/objects/'+id+'.png';img.alt='';img.draggable=false;b.append(img);
 b.onclick=e=>{e.stopPropagation();room.dispatchEvent(new CustomEvent('objectactivate',{detail:{id}}));go(z)};
 $('objects').append(b);
}

function go(z,target){if(window.stopRoomActivity)window.stopRoomActivity(false);const t=target||{x:z.tx,y:z.ty},p=pathTo(t);if(!p){toast('ここには行けないみたい。空いている床を選んでね。');return}selected=z;route=p;$('menu').hidden=true;document.querySelectorAll('.active').forEach(el=>el.classList.remove('active'));if(z){document.querySelector(`[data-zone="${z.id}"]`).classList.add('active')}$('destination').hidden=false;$('destination').style.left=t.x+'%';$('destination').style.top=t.y+'%';$('status').textContent=z?z.name+'へおでかけ中':'てくてく、おさんぽ';character.classList.add('running');chime()}
function tick(now){const dt=Math.min((now-last)/1000,.05);last=now;if(route.length){const t=route[0],dx=t.x-position.x,dy=t.y-position.y,aspect=room.clientWidth/room.clientHeight,dist=Math.hypot(dx,dy/aspect),speed=20*dt;if(dist>.001){const horizontal=Math.abs(dx)>Math.abs(dy/aspect);character.dataset.direction=horizontal?(dx>0?'right':'left'):(dy>0?'down':'up')}if(dist<=speed){position={...t};route.shift();if(!route.length)arrive()}else{position.x+=dx/dist*speed;position.y+=dy/dist*speed}place()}requestAnimationFrame(tick)}requestAnimationFrame(tick);
function arrive(){character.classList.remove('running');$('destination').hidden=true;$('status').textContent=selected?selected.name+'でのんびり':'おへやでのんびり';if(window.onRoomActivityArrive?.())return;if(selected)showMenu(selected)}
function showMenu(z){const menu=$('menu');menu.innerHTML=`<button class="close" aria-label="閉じる">×</button><h3>${z.emoji} ${z.name}</h3><p>なにをしよう？</p>`;menu.querySelector('.close').onclick=()=>menu.hidden=true;z.actions.forEach(a=>{const b=document.createElement('button');b.textContent=a[0]+'  ›';b.onclick=()=>{applyStats(a.slice(2,5));$('status').textContent=a[0];menu.hidden=true;toast(a[1]);chime()};menu.append(b)});appendActivityActions(menu,z);menu.hidden=false;const width=menu.offsetWidth/room.clientWidth*100,height=menu.offsetHeight/room.clientHeight*100;menu.style.left=Math.max(width/2+2,Math.min(98-width/2,position.x))+'%';menu.style.top=Math.max(height+2,position.y-18)+'%'}
room.addEventListener('click',e=>{if(e.target.closest('.action-menu,.room-object'))return;const r=room.getBoundingClientRect();go(null,{x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100})});
function toast(t){clearTimeout(toastTimer);$('toast').textContent=t;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200)}
function clock(){const n=new Date();$('date').textContent=new Intl.DateTimeFormat(window.lisaLocale||'ja-JP',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'short'}).format(n);$('time').textContent=new Intl.DateTimeFormat(window.lisaLocale||'ja-JP',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false}).format(n)}clock();setInterval(clock,10000);
function chime(){if(!sound)return;audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(660,audio.currentTime);o.frequency.exponentialRampToValueAtTime(880,audio.currentTime+.12);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.3);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.3)}
$('help').onclick=()=>$('help-dialog').showModal();$('close-help').onclick=$('start-playing').onclick=()=>$('help-dialog').close();document.addEventListener('keydown',e=>{if(e.key==='Escape')$('menu').hidden=true});

window.addEventListener('languagechange',clock);

window.addEventListener('resize',()=>{if(selected&&!$('menu').hidden)showMenu(selected)});

function applyStats(delta){stats=stats.map((v,i)=>Math.max(0,Math.min(100,v+delta[i])));['energy','mood','food'].forEach((id,i)=>{$(id).style.width=stats[i]+'%';$(id+'-value').textContent=stats[i]+' / 100'});}
