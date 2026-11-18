'use strict';
const PRICES={basic:90,standard:150,comprehensive:250};
const FIELDS=[['Order ID','order_id'],['Plan','plan'],['Price USD','price_usd'],['Property type','property_type'],['Location','location'],['Google Maps link','map_link'],['Intended use','intended_use'],['Project','project'],['Seller or developer','seller_name'],['Seller type','seller_type'],['Legal company name','legal_company_name'],['NIB','nib'],['Documents','documents'],['Name','name'],['Email','email'],['WhatsApp','whatsapp'],['Status','status']];
const clean=x=>(Array.isArray(x)?x.join(', '):x==null?'':String(x)).replace(/[\r\n]+/g,' ').trim();
function received(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Makassar',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day+' '+p.hour+':'+p.minute;}
async function post(url,data){const c=new AbortController(),timer=setTimeout(()=>c.abort(),8000);try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:c.signal});if(!r.ok)return false;return url.startsWith('https://api.telegram.org/')?(await r.json()).ok===true:true;}finally{clearTimeout(timer);}}
module.exports=async function(req,res){
 if(req.method!=='POST')return res.status(405).setHeader('Allow','POST').json({ok:false});
 if(Number(req.headers['content-length'])>10240)return res.status(413).json({ok:false});
 let b;try{const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(!raw||Buffer.byteLength(raw,'utf8')>10240)return res.status(413).json({ok:false});b=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch(_){return res.status(400).json({ok:false});}
 if(!b||typeof b!=='object'||Array.isArray(b))return res.status(400).json({ok:false});
 if(b.website)return res.status(200).json({ok:true});
 const plan=typeof b.plan==='string'?b.plan.toLowerCase():'';
 if(!/^DD-[A-Z0-9]{6}$/.test(b.order_id||'')||!Object.prototype.hasOwnProperty.call(PRICES,plan)||!['location','name','email','whatsapp'].every(k=>typeof b[k]==='string'&&b[k].trim()))return res.status(400).json({ok:false});
 const o={...b,plan,price_usd:PRICES[plan],status:'New'},stamp=received(),row=[stamp,...FIELDS.map(([,k])=>clean(o[k]))],tasks=[];
 if(process.env.TELEGRAM_BOT_TOKEN&&process.env.TELEGRAM_CHAT_ID){const lines=[['Received (Bali time)',stamp],...FIELDS.map(([label,k])=>[label,clean(o[k])])];tasks.push(post('https://api.telegram.org/bot'+process.env.TELEGRAM_BOT_TOKEN+'/sendMessage',{chat_id:process.env.TELEGRAM_CHAT_ID,text:lines.map(x=>x[0]+': '+x[1]).join('\n')}));}
 if(process.env.SHEETS_WEBHOOK_URL&&process.env.SHEETS_SECRET)tasks.push(post(process.env.SHEETS_WEBHOOK_URL,{secret:process.env.SHEETS_SECRET,row}));
 if(!tasks.length)return res.status(200).json({ok:true});
 const settled=await Promise.allSettled(tasks),ok=settled.some(r=>r.status==='fulfilled'&&r.value===true);return res.status(ok?200:502).json({ok});
};