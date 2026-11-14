import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('public');
http.createServer(async(req,res)=>{try{const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!p.startsWith(root+path.sep)&&p!==root)throw Error();const file=p===root?path.join(root,'index.html'):p;const data=await readFile(file);res.setHeader('Content-Type',({'html':'text/html; charset=utf-8','css':'text/css','js':'text/javascript','png':'image/png','svg':'image/svg+xml','webp':'image/webp'})[file.split('.').pop()]||'application/octet-stream');res.end(data)}catch{res.writeHead(404);res.end('Not found')}}).listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Lisa’s room listening on port '+(process.env.PORT||3000)));
