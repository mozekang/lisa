// Add a release here for every shipped change; keep both languages together.
const releases=[
 {version:'V5',date:'2026-11-15',ja:['床と壁、家具・家電・小物を独立した画像コンポーネントに。','家具にマウスを重ねると白い輪郭を表示。各アイテムを個別に操作できます。','クリックできるバージョン表示と更新履歴を追加。日本語・中国語、1画面表示、BGM2を継続。'],zh:['房基及家具、家电、摆件拆为独立图片组件。','物品悬停显示白色轮廓，每件物品可单独交互。','新增可点击版本标签与更新记录；保留中日文、单屏布局及 BGM2。']},
 {version:'V4',ja:['BGM2のみを使用。アップロードされた部屋画像と「妹のおうち」の見出しを採用。'],zh:['仅保留 BGM2，采用上传的房间背景，标题改为“妹妹的家”。']}
];
function renderReleases(){const zh=document.documentElement.lang==='zh-CN';document.getElementById('version-heading').textContent=zh?'更新说明':'更新履歴';const box=document.getElementById('release-notes');box.replaceChildren();for(const r of releases){const section=document.createElement('section'),h=document.createElement('h3'),ul=document.createElement('ul');h.textContent=r.version+(r.date?' · '+r.date:'');for(const note of r[zh?'zh':'ja']){const li=document.createElement('li');li.textContent=note;ul.append(li)}section.append(h,ul);box.append(section)}}
document.getElementById('version').onclick=()=>{renderReleases();document.getElementById('version-dialog').showModal()};document.getElementById('close-version').onclick=()=>document.getElementById('version-dialog').close();window.addEventListener('languagechange',renderReleases);
