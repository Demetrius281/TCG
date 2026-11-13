(function(){
  var form=document.getElementById('ei-form'); if(!form) return;
  var WA='https://wa.me/6281337973097?text=';
  var sel=document.getElementById('ei-interest');
  var status=document.getElementById('ei-status');
  function syncSel(){sel.classList.toggle('empty',!sel.value);}
  sel.addEventListener('change',syncSel); syncSel();
  var rules=[
    {el:document.getElementById('ei-name'),err:document.getElementById('ei-name-err'),msg:'Enter your full name.'},
    {el:sel,err:document.getElementById('ei-interest-err'),msg:'Select an area of interest.'},
    {el:document.getElementById('ei-contact'),err:document.getElementById('ei-contact-err'),msg:'Enter a WhatsApp number or an email address.',test:function(v){if(v.indexOf('@')>-1)return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);return /^\+?[0-9]{7,15}$/.test(v.replace(/[\s().-]/g,''));}}
  ];
  function setErr(r,on){r.err.textContent=on?r.msg:'';if(on){r.el.setAttribute('aria-invalid','true');}else{r.el.removeAttribute('aria-invalid');}}
  rules.forEach(function(r){
    var ev=r.el.tagName==='SELECT'?'change':'input';
    r.el.addEventListener(ev,function(){if(r.el.getAttribute('aria-invalid')==='true'&&r.el.value.trim())setErr(r,false);});
  });
  function val(id){return document.getElementById(id).value.trim();}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    status.textContent='';
    var first=null;
    rules.forEach(function(r){var v=r.el.value.trim(),bad=!v||(r.test&&!r.test(v));setErr(r,bad);if(bad&&!first)first=r.el;});
    if(first){first.focus();return;}
    var lines=['TCG Property Intelligence & Investments \u2014 Investment Inquiry',''];
    [['Full Name','ei-name'],['Company / Organisation','ei-org'],['Investor Type','ei-role'],['Investment Interest','ei-interest'],['WhatsApp or Email','ei-contact'],['Message','ei-msg']].forEach(function(f){
      var v=val(f[1]); if(v) lines.push(f[0]+': '+v);
    });
    var url=WA+encodeURIComponent(lines.join('\n'));
    var w=window.open(url,'_blank');
    if(w){try{w.opener=null;}catch(_){}}else{window.location.href=url;return;}
    status.innerHTML='';
    status.appendChild(document.createTextNode('WhatsApp opens with your prepared message. It reaches TCG only after you press send in WhatsApp. '));
    var a=document.createElement('a'); a.href=url; a.target='_blank'; a.rel='noopener'; a.textContent='Open WhatsApp again';
    status.appendChild(a);
  });
})();
