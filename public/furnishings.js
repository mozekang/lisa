// Each object has a separate spec even when artwork is shared.
const flowerTypes=[['roses','バラ'],['tulips','チューリップ'],['sunflowers','ひまわり'],['lilies','ユリ'],['hydrangeas','アジサイ']];
let flowerRequest=0;
function furnishingSpec(id){const specs={
 'wardrobe-two':{actions:[['寝具を整える','おふとんと枕カバーを、きれいに整えた。',-3,8,0],['タオルをたたむ','ふわふわのタオルを、きちんと収納。',-2,6,0]]},
 'pet-bowls':{actions:[['お水を補充する','きれいなお水をボウルに入れた。',0,4,0],['ドッグフードを補充する','わんこのごはんを用意した。',0,5,0]]},
 'penguin':{actions:[['ライトをつける','星の穴から、あたたかな光。',0,2,0,()=>setPenguin(true)],['ライトを消す','ペンギンライトを消した。',0,0,0,()=>setPenguin(false)]]},
 'vase':{actions:[['お水を替える','三つの花瓶のお水を、新しく替えた。',-1,5,0],['お花を替える','好きなお花を選んでね。',0,0,0,openFlowers]]},
 'plant-stand':{actions:[['水やりをする','グリーンたちに、たっぷりお水を。',-2,6,0],['葉のお手入れ','葉っぱのほこりを、やさしく拭いた。',-2,6,0]]},
 'robot':{actions:[['充電を確認する','ロボットはステーションで充電中。',0,0,0],['タンクを洗う','二つのタンクを洗って、すっきり。',-3,5,0]]}
 };return specs[id]||null;}
function setPenguin(on){const button=document.querySelector('[data-object="penguin"]');button.dataset.lit=String(on);button.querySelector('img').src=`/assets/objects/penguin-${on?'on':'off'}.png`;}
function openFlowers(){const dialog=document.getElementById('flowers-dialog');if(!dialog.open)dialog.showModal();}
// Setup after app creates the independent component buttons.
window.addEventListener('DOMContentLoaded',()=>{
 const options=document.getElementById('flower-options');
 for(const [id,label] of flowerTypes){const b=document.createElement('button');b.type='button';b.dataset.flower=id;b.setAttribute('aria-pressed',String(id==='roses'));const image=document.createElement('img');image.src=`/assets/flowers/${id}.png`;image.alt='';const name=document.createElement('span');name.textContent=label;b.append(image,name);b.onclick=async()=>{
  const request=++flowerRequest;document.getElementById('flower-status').textContent='お花を準備中…';
  try{await image.decode();if(request!==flowerRequest)return;const vase=document.querySelector('[data-object="vase"]');vase.querySelector('img').src=image.src;vase.dataset.flowers=id;options.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));document.getElementById('flower-status').textContent=label+'に替えました。';}
  catch{if(request===flowerRequest)document.getElementById('flower-status').textContent='画像を読み込めません。ページを再読み込みしてね。';}
 };options.append(b);}
 document.getElementById('close-flowers').onclick=()=>{++flowerRequest;document.getElementById('flowers-dialog').close()};
 document.getElementById('flowers-dialog').addEventListener('cancel',()=>++flowerRequest);
});
