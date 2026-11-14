(() => {
  const player=document.getElementById('bgm');
  const toggle=document.getElementById('bgm-enabled');
  const track=document.getElementById('bgm-track');
  const volume=document.getElementById('bgm-volume');
  const status=document.getElementById('bgm-status');
  const toolbar=document.getElementById('sound');
  let preferences={track:'BGM1',volume:35,enabled:false};
  try {
    const saved=JSON.parse(localStorage.getItem('lisa-music'));
    if(saved){
      if(['BGM1','BGM2'].includes(saved.track))preferences.track=saved.track;
      if(Number.isFinite(saved.volume))preferences.volume=Math.max(0,Math.min(100,saved.volume));
      if(typeof saved.enabled==='boolean')preferences.enabled=saved.enabled;
    }
  } catch {}
  function save(){try{localStorage.setItem('lisa-music',JSON.stringify(preferences))}catch{}}
  function sync(){
    toggle.checked=preferences.enabled;
    sound=preferences.enabled;
    toolbar.setAttribute('aria-label',sound?'サウンドをオフにする':'サウンドをオンにする');
    toolbar.setAttribute('aria-pressed',String(sound));
    toolbar.style.opacity=sound?'1':'.5';
    track.value=preferences.track;
    volume.value=preferences.volume;
    player.volume=preferences.volume/100;
    document.getElementById('bgm-volume-value').textContent=preferences.volume+'%';
  }
  async function play(){
    if(!preferences.enabled)return;
    status.textContent='読み込み中…';
    try {await player.play();if(preferences.enabled)status.textContent='再生中'}
    catch(error){if(error.name==='AbortError')return;if(preferences.enabled)status.textContent=error.name==='NotAllowedError'?'クリックして音楽を再生':'音楽を読み込めません。曲を選び直してね。'}
  }
  function enable(enabled){preferences.enabled=enabled;sync();save();if(enabled)play();else{player.pause();status.textContent='停止中'}}
  toggle.addEventListener('change',()=>enable(toggle.checked));
  toolbar.onclick=()=>enable(!preferences.enabled);
  track.addEventListener('change',()=>{
    preferences.track=track.value;
    player.src='/assets/audio/'+preferences.track+'.mp3';
    sync();save();
    if(preferences.enabled)play();else status.textContent='停止中';
  });
  volume.addEventListener('input',()=>{preferences.volume=Number(volume.value);sync();save()});
  // Browser autoplay policy may require a fresh gesture after restoration.
  document.addEventListener('pointerdown',()=>{if(preferences.enabled&&player.paused&&!player.error)play()});
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&preferences.enabled&&player.paused&&!player.error)play()});
  player.addEventListener('error',()=>{status.textContent='音楽を読み込めません。曲を選び直してね。'});
  player.src='/assets/audio/'+preferences.track+'.mp3';
  sync();if(preferences.enabled)play();
})();
