// Cancellable action lifecycle. Normal walking always resumes from a safe floor point.
let roomActivity=null;
const actionAsset=(name,i)=>`/assets/actions/${name}-${i}.png`;
const activityAssets=[...['jump','sleep','eat'].flatMap(name=>Array.from({length:4},(_,i)=>actionAsset(name,i))),'/assets/actions/dinner-desk.png'];
const decodedAssets=Promise.all(activityAssets.map(src=>{const img=new Image();img.src=src;return img.decode()}));
// Avoid an unhandled rejection if an asset fails before the first interaction.
decodedAssets.catch(()=>{});
const objectImage=id=>document.querySelector(`[data-object="${id}"] img`);
const pose=document.createElement('img');pose.className='activity-sprite';pose.alt='';pose.src=actionAsset('jump',0);pose.hidden=true;character.append(pose);
function appendActivityActions(menu,z){
 const actions=[];
 if(z.id==='bed')actions.push(['ベッドで眠る','sleep',()=>startRoomActivity('sleep')]);
 if(['desk','chair','kitchen'].includes(z.id))actions.push(['ごはんを食べる','eat',()=>startRoomActivity('eat')]);
 if(z.id==='desk')actions.push(['今夜の献立','dinner',openDinner]);
 for(const [label,id,run] of actions){const b=document.createElement('button');b.textContent=label+'  ›';b.dataset.action=id;b.onclick=()=>{$('menu').hidden=true;run()};menu.append(b)}
}
function openDinner(){if(!$('dinner-dialog').open)$('dinner-dialog').showModal();$('dinner-eat').disabled=roomActivity?.kind==='eat';}
$('close-dinner').onclick=()=>$('dinner-dialog').close();
$('dinner-eat').onclick=()=>{$('dinner-dialog').close();if(roomActivity?.kind==='eat')return;startRoomActivity('eat');};
// While set for dinner, the table itself opens the menu without ending the meal.
document.querySelector('[data-object="desk"]').addEventListener('click',e=>{if(roomActivity?.kind==='eat'){e.stopImmediatePropagation();openDinner()}},true);
function phase(a,value){a.phase=value;room.dataset.activity=value;}
function frame(a,name,index){pose.src=actionAsset(name,index);pose.dataset.frame=String(index);}
function sequence(a,name,indices,ms,onComplete){let i=0;const next=()=>{if(roomActivity!==a)return;if(i>=indices.length){onComplete?.();return}if(name==='sleep')objectImage('bed').src=actionAsset(name,indices[i]);else frame(a,name,indices[i]);i++;a.timer=setTimeout(next,ms)};next()}
async function animate(a,frames,options){const animation=character.animate(frames,options);a.animation=animation;try{await animation.finished}catch{return false}if(roomActivity!==a)return false;a.animation=null;return true}
async function startRoomActivity(kind){
 stopRoomActivity(false);const a={kind,phase:'loading',origin:{...position},timer:null,animation:null};roomActivity=a;route=[];selected=null;$('menu').hidden=true;$('destination').hidden=true;character.classList.remove('running');phase(a,'loading');
 try{await decodedAssets}catch{if(roomActivity===a){stopRoomActivity(false);toast('画像を読み込めません。ページを再読み込みしてね。')}return}
 if(roomActivity!==a)return;
 $('activity-bar').hidden=false;$('activity-label').textContent=kind==='sleep'?'おやすみの時間':'いただきます';$('finish-activity').textContent=kind==='sleep'?'起きる':'ごちそうさま';$('finish-activity').disabled=true;
 if(kind==='sleep'){
  phase(a,'jumping');character.classList.add('acting','jumping');pose.hidden=false;sequence(a,'jump',[0,1,2,3],230);
  const from={left:position.x+'%',top:position.y+'%'},end={left:'20%',top:'80%'};
  if(!await animate(a,[from,{left:'28%',top:'63%',offset:.35},{left:'23%',top:'60%',offset:.65},end],{duration:920,easing:'ease-in-out'}))return;
  character.hidden=true;pose.hidden=true;phase(a,'settling');sequence(a,'sleep',[0,1,2,3],420,()=>{phase(a,'sleeping');$('status').textContent='すやすや、おやすみ';$('finish-activity').disabled=false;sequenceLoop(a,'sleep',[2,3],1500)});
 }else{
  phase(a,'approaching');const approach=pathTo({x:41,y:74});if(!approach){stopRoomActivity(false);toast('ここには行けないみたい。空いている床を選んでね。');return}
  route=approach;character.classList.add('running');$('status').textContent='食卓へ移動中';
  if(!await new Promise(resolve=>{a.arriveResolve=resolve;if(!route.length){a.arriveResolve=null;resolve(true)}}))return;
  if(roomActivity!==a)return;a.origin={...position};
  phase(a,'seating');$('status').textContent='椅子に座る';character.classList.add('running');
  // Approach below the desktop; the final short movement seats Lisa into the chair.
  if(!await animate(a,[{left:position.x+'%',top:position.y+'%'},{left:'46%',top:'74%',offset:.65},{left:'50%',top:'75%'}],{duration:700,easing:'ease-in-out'}))return;
  character.style.left='50%';character.style.top='75%';character.classList.remove('running');character.classList.add('acting','eating');pose.hidden=false;objectImage('desk').src='/assets/actions/dinner-desk.png';phase(a,'eating');$('status').textContent='もぐもぐ、ごはんの時間';$('finish-activity').disabled=false;sequenceLoop(a,'eat',[0,1,2,3],550);
 }
}
function sequenceLoop(a,name,indices,ms){sequence(a,name,indices,ms,()=>sequenceLoop(a,name,indices,ms))}
function stopRoomActivity(reward=false){const a=roomActivity;if(!a)return;roomActivity=null;clearTimeout(a.timer);a.arriveResolve?.(false);route=[];a.animation?.cancel();character.hidden=false;pose.hidden=true;character.classList.remove('acting','jumping','eating','running');objectImage('bed').src='/assets/objects/bed.png';objectImage('desk').src='/assets/objects/desk.png';position={...a.origin};place();delete room.dataset.activity;$('activity-bar').hidden=true;$('dinner-eat').disabled=false;if(reward){applyStats(a.kind==='sleep'?[30,8,-5]:[-3,12,30]);toast(a.kind==='sleep'?'ぐっすり眠って、元気いっぱい。':'ごちそうさま！おなかいっぱい。')}$('status').textContent='おへやでのんびり';}
window.onRoomActivityArrive=()=>{const resolve=roomActivity?.arriveResolve;if(!resolve)return false;roomActivity.arriveResolve=null;resolve(true);return true};
window.stopRoomActivity=stopRoomActivity;
$('finish-activity').onclick=()=>stopRoomActivity(true);
