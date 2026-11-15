// Mechanical export of newly generated art, never crops from the room reference.
// Requires sharp only for this optional authoring step; runtime stays dependency-free.
const sharp=require('sharp');const path=require('node:path');
const root=path.join(__dirname,'..');
const groups=[
 ['furniture.png', [['wardrobe',0,0,590,590],['kitchen',590,0,679,590],['bed',0,590,605,650],['desk',605,590,664,650]]],
 ['appliances.png',[['washer',0,0,634,620],['dryer',634,0,635,620],['fridge',0,620,634,620],['microwave',634,620,635,620]]],
 ['props.png',[['chair',0,0,512,512],['long-table',512,0,512,512],['dog',1024,0,512,512],['vase',0,512,512,512],['robot',512,512,512,512],['wardrobe-two',1024,512,512,512]]]
];
(async()=>{for(const [source,items] of groups)for(const [id,left,top,width,height] of items){
 const {data,info}=await sharp(path.join(root,'art/v6',source)).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // Tight alpha bounds plus a transparent gutter keep CSS outlines on the silhouette.
 let x0=width,y0=height,x1=0,y1=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>32){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
 await sharp(data,{raw:info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).extend({top:4,bottom:4,left:4,right:4,background:'#00000000'}).png().toFile(path.join(root,'public/assets/objects',id+'.png'));
 console.log(id,x1-x0+9,y1-y0+9);
}})().catch(e=>{console.error(e);process.exit(1)});
