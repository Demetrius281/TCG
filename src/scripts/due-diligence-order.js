/* ===== Property Check: order form ===== */
(function(){
  var PLANS={
    basic:{name:'Basic',price:90,hours:12,scope:'Plot screening'},
    standard:{name:'Standard',price:150,hours:24,scope:'Property and seller'},
    comprehensive:{name:'Comprehensive',price:250,hours:48,scope:'Off-plan and developer'}
  };
  /* Orders are sent via WhatsApp until online payment is connected */
  var WA_NUMBER='6281337973097';
  var BADUNG=[-8.62,115.17];

  var form=document.getElementById('pc-form');
  if(!form)return;
  var panel=document.getElementById('pc-panel');
  var section=document.getElementById('order');
  var steps=form.querySelectorAll('.pc-step');
  var stageRows=document.querySelectorAll('#order .stage p');
  var bars=document.querySelectorAll('.pc-bar i');
  var current=1,paid=false,done=false;
  var pin=null,pinOk=false,map=null,marker=null,mapState='idle',mapQueue=[],locTimer=null;

  function $(id){return document.getElementById(id);}
  function plan(){var r=form.querySelector('input[name="plan"]:checked');return r?r.value:'standard';}
  function radio(name){var r=form.querySelector('input[name="'+name+'"]:checked');return r?r.value:'';}
  function checks(name){return Array.prototype.map.call(form.querySelectorAll('input[name="'+name+'"]:checked'),function(i){return i.value;});}
  function needsCompany(){return plan()!=='basic';}
  function isCompany(){return radio('seller_type')==='Company';}
  function reduced(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
  function docList(){return checks('docs');}
  function docCount(){return docList().length;}
  function fix(n){return n.toFixed(6).replace(/0+$/,'').replace(/\.$/,'');}

  function setErr(el,errEl,msg){
    errEl.textContent=msg||'';
    if(msg)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');
    return !msg;
  }

  function locText(){
    if(pin)return fix(pin.lat)+', '+fix(pin.lng)+(pinOk?' (confirmed on map)':'');
    return $('pc-loc').value.trim();
  }
  function updateReview(){
    var p=PLANS[plan()],n=docCount();
    $('pc-r-plan').textContent=p.name+' \u00b7 Delivery within '+p.hours+' hours';
    $('pc-r-price').textContent='US$'+p.price;
    $('pc-r-loc').textContent=locText()||'\u2014';
    $('pc-r-docs').textContent=n?docList().join(', ')+' (to send in WhatsApp)':'None';
  }
  function syncPlan(){
    var p=PLANS[plan()];
    $('pc-company-fld').hidden=!needsCompany();
    if(!needsCompany()){setErr($('pc-seller'),$('pc-seller-err'),'');setErr($('pc-stype-set'),$('pc-stype-err'),'');}
    $('os-plan').textContent=p.name+' \u00b7 US$'+p.price;
    $('os-del').textContent=p.scope+', delivery within '+p.hours+' hours';
    updateReview();
  }
  function syncSellerType(){$('pc-legal-fld').hidden=!isCompany();}
  function syncSkip(){$('pc-skip-docs').hidden=docCount()>0;}

  function show(n,focus){
    current=n;
    steps.forEach(function(s){s.hidden=Number(s.dataset.step)!==n;});
    stageRows.forEach(function(r){
      var s=Number(r.dataset.s);
      if(s===n&&!done)r.setAttribute('aria-current','step');else r.removeAttribute('aria-current');
      r.classList.toggle('done',done||s<n);
    });
    bars.forEach(function(b,i){b.classList.toggle('on',done||i<n);});
    if(n===2&&map)setTimeout(function(){map.invalidateSize();if(pin)map.panTo([pin.lat,pin.lng]);},0);
    if(n===3)syncSkip();
    if(n===4)updateReview();
    if(focus){
      var h=form.querySelector('.pc-step[data-step="'+n+'"] h3');
      var top=panel.getBoundingClientRect().top;
      if(top<0||top>window.innerHeight*0.6)panel.scrollIntoView({block:'start'});
      if(h)h.focus({preventScroll:true});
    }
  }

  /* Location: a Google Maps link or decimal GPS coordinates */
  function isMapsUrl(v){return /^(https?:\/\/)?((www\.)?google\.[a-z.]{2,6}\/maps|maps\.google\.[a-z.]{2,6}|maps\.app\.goo\.gl|goo\.gl\/maps)(\/|\?|$)/i.test(v);}
  function inRange(lat,lng){return isFinite(lat)&&isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180;}
  function parseCoords(v){
    var m=v.match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
    if(!m)return null;
    var lat=parseFloat(m[1]),lng=parseFloat(m[2]);
    return inRange(lat,lng)?{lat:lat,lng:lng}:null;
  }
  function validLocation(v){return isMapsUrl(v)||!!parseCoords(v);}
  /* Reads coordinates only when the link itself contains them; short links (maps.app.goo.gl) do not */
  function parseLocation(v){
    var c=parseCoords(v);if(c)return c;
    if(!isMapsUrl(v))return null;
    var u=v;try{u=decodeURIComponent(v);}catch(e){}
    var res=[/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,/[?&](?:q|query|ll|destination|daddr)=(?:loc:)?(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/,/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/];
    for(var i=0;i<res.length;i++){
      var m=u.match(res[i]);
      if(m){var lat=parseFloat(m[1]),lng=parseFloat(m[2]);if(inRange(lat,lng))return {lat:lat,lng:lng};}
    }
    return null;
  }

  /* Map */
  function loadLeaflet(cb){
    if(window.L&&window.L.map){mapState='ready';cb(true);return;}
    if(mapState==='failed'){cb(false);return;}
    mapQueue.push(cb);
    if(mapState==='loading')return;
    mapState='loading';
    function flush(ok){mapState=ok?'ready':'failed';var q=mapQueue;mapQueue=[];q.forEach(function(f){f(ok);});}
    /* Leaflet ships with the site (npm package, built by Astro): no stylesheet or script is injected at run time. */
    var t=setTimeout(function(){if(mapState==='loading')flush(false);},12000);
    import('leaflet').then(function(m){
      clearTimeout(t);
      window.L=m.default||m;
      if(mapState==='loading')flush(!!(window.L&&window.L.map));
    }).catch(function(){clearTimeout(t);if(mapState==='loading')flush(false);});
  }
  function ensureMap(){
    if(map)return;
    map=L.map('pc-map',{scrollWheelZoom:false,zoomControl:true}).setView(BADUNG,11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
    map.on('click',function(e){setPin(e.latlng.lat,e.latlng.lng);mapMsg('Pin moved. Confirm the location once it marks the property.');});
  }
  function mapMsg(t){$('pc-map-msg').textContent=t;}
  function setPinOk(ok){
    pinOk=ok;
    var b=$('pc-pin-ok');
    b.textContent=ok?'Location Confirmed':'Confirm Location';
    b.classList.toggle('ok',ok);
    b.setAttribute('aria-pressed',ok?'true':'false');
    if(ok)setErr($('pc-pin-ok'),$('pc-map-err'),'');
    updateReview();
  }
  function setPin(lat,lng){
    pin={lat:lat,lng:lng};
    if(!marker){
      marker=L.marker([lat,lng],{draggable:true,keyboard:false,icon:L.divIcon({className:'pc-pin-ic',html:'<span class="pc-pin-dot"></span>',iconSize:[22,22],iconAnchor:[11,11]})}).addTo(map);
      marker.on('dragend',function(){var ll=marker.getLatLng();setPin(ll.lat,ll.lng);mapMsg('Pin moved. Confirm the location once it marks the property.');});
    }else marker.setLatLng([lat,lng]);
    $('pc-pin').textContent='Pin: '+fix(lat)+', '+fix(lng);
    $('pc-map-bar').hidden=false;
    setPinOk(false);
  }
  function clearPin(){
    pin=null;
    if(marker&&map){map.removeLayer(marker);}
    marker=null;
    $('pc-map-bar').hidden=true;
    setPinOk(false);
  }
  function onLocChange(){
    var v=$('pc-loc').value.trim(),wrap=$('pc-map-wrap');
    if(!v||!validLocation(v)){
      wrap.hidden=true;
      if(map)clearPin();else{pin=null;setPinOk(false);}
      return;
    }
    wrap.hidden=false;
    setErr($('pc-pin-ok'),$('pc-map-err'),'');
    if(mapState!=='ready')mapMsg('Loading the map\u2026');
    loadLeaflet(function(ok){
      if($('pc-loc').value.trim()!==v)return;
      if(!ok){
        $('pc-map').hidden=true;$('pc-map-bar').hidden=true;pin=null;setPinOk(false);
        mapMsg('The map could not load. The location will be checked from the link or coordinates you entered.');
        return;
      }
      $('pc-map').hidden=false;
      ensureMap();
      map.invalidateSize();
      var c=parseLocation(v);
      if(c){
        setPin(c.lat,c.lng);
        map.setView([c.lat,c.lng],17);
        mapMsg('Check that the pin marks the property. Drag the pin or tap the map to correct it.');
      }else{
        clearPin();
        map.setView(BADUNG,11);
        mapMsg('This link does not include coordinates. Tap the map to place the pin on the property.');
      }
    });
  }
  $('pc-loc').addEventListener('input',function(){clearTimeout(locTimer);locTimer=setTimeout(onLocChange,450);});
  $('pc-loc').addEventListener('change',function(){clearTimeout(locTimer);onLocChange();});
  $('pc-pin-ok').addEventListener('click',function(){
    if(!pin)return;
    setPinOk(true);
    mapMsg('Location confirmed. Move the pin if you need to correct it.');
  });

  function validate2(){
    var first=null;
    if(!setErr($('pc-type-set'),$('pc-type-err'),radio('type')?'':'Select what you are checking.'))first=first||form.querySelector('input[name="type"]');
    var loc=$('pc-loc').value.trim(),msg='';
    if(!loc)msg='Add the property location.';
    else if(!validLocation(loc))msg='Use a Google Maps link or coordinates such as -8.6491, 115.1386.';
    if(!setErr($('pc-loc'),$('pc-loc-err'),msg))first=first||$('pc-loc');
    if(!msg&&mapState!=='failed'){
      var mm='';
      if(mapState!=='ready')mm='Wait for the map to load, then confirm the location.';
      else if(!pin)mm='Tap the map to place the pin on the property.';
      else if(!pinOk)mm='Confirm the pin location on the map.';
      if(!setErr($('pc-pin-ok'),$('pc-map-err'),mm))first=first||(pin?$('pc-pin-ok'):$('pc-loc'));
    }
    if(!setErr($('pc-use-set'),$('pc-use-err'),checks('use').length?'':'Select at least one option.'))first=first||form.querySelector('input[name="use"]');
    if(needsCompany()){
      if(!setErr($('pc-seller'),$('pc-seller-err'),$('pc-seller').value.trim()?'':'Enter the seller or developer name.'))first=first||$('pc-seller');
      if(!setErr($('pc-stype-set'),$('pc-stype-err'),radio('seller_type')?'':'Select an individual or a company.'))first=first||form.querySelector('input[name="seller_type"]');
    }
    var nib=$('pc-nib').value.replace(/\s/g,'');
    if(!setErr($('pc-nib'),$('pc-nib-err'),(!nib||/^\d{13}$/.test(nib))?'':'An NIB has 13 digits.'))first=first||$('pc-nib');
    if(first)first.focus();
    return !first;
  }

  function validate4(){
    var first=null;
    if(!setErr($('pc-name'),$('pc-name-err'),$('pc-name').value.trim()?'':'Enter your full name.'))first=first||$('pc-name');
    var em=$('pc-email').value.trim(),msg='';
    if(!em)msg='Enter your email address.';
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))msg='Enter a valid email address, for example name@example.com.';
    if(!setErr($('pc-email'),$('pc-email-err'),msg))first=first||$('pc-email');
    if(!setErr($('pc-terms-lbl'),$('pc-terms-err'),$('pc-terms').checked?'':'Accept the Terms and Privacy Policy to continue.'))first=first||$('pc-terms');
    if(first)first.focus();
    return !first;
  }

  /* Clear an error as soon as the field is corrected */
  ['pc-loc','pc-seller','pc-nib','pc-name','pc-email'].forEach(function(id){
    $(id).addEventListener('input',function(){if($(id).getAttribute('aria-invalid')==='true')setErr($(id),$(id+'-err'),'');});
  });
  form.querySelectorAll('input[name="type"]').forEach(function(r){r.addEventListener('change',function(){setErr($('pc-type-set'),$('pc-type-err'),'');});});
  form.querySelectorAll('input[name="use"]').forEach(function(r){r.addEventListener('change',function(){if(checks('use').length)setErr($('pc-use-set'),$('pc-use-err'),'');});});
  form.querySelectorAll('input[name="seller_type"]').forEach(function(r){r.addEventListener('change',function(){setErr($('pc-stype-set'),$('pc-stype-err'),'');syncSellerType();});});
  $('pc-terms').addEventListener('change',function(){if(this.checked)setErr($('pc-terms-lbl'),$('pc-terms-err'),'');});
  form.querySelectorAll('input[name="plan"]').forEach(function(r){r.addEventListener('change',syncPlan);});

  form.querySelectorAll('[data-next]').forEach(function(b){
    b.addEventListener('click',function(){
      if(paid)return;
      if(current===2&&!validate2())return;
      show(Number(b.dataset.next),true);
    });
  });
  form.querySelectorAll('[data-back]').forEach(function(b){
    b.addEventListener('click',function(){if(!paid)show(Number(b.dataset.back),true);});
  });
  $('pc-skip-docs').addEventListener('click',function(){if(paid)return;form.querySelectorAll('input[name="docs"]').forEach(function(i){i.checked=false;});updateReview();show(4,true);});
  form.querySelectorAll('input[name="docs"]').forEach(function(i){i.addEventListener('change',function(){syncSkip();updateReview();});});
  form.addEventListener('submit',function(e){e.preventDefault();});
  form.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='checkbox'&&e.target.type!=='file'&&e.target.type!=='radio'){
      e.preventDefault();
      var btn=form.querySelector('.pc-step[data-step="'+current+'"] .ei-btn');
      if(btn)btn.click();
    }
  });

  /* Plan buttons on the pricing cards: preselect the plan, then go to the form */
  document.querySelectorAll('a[data-plan]').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      if(!paid&&!done){
        var r=form.querySelector('input[name="plan"][value="'+a.dataset.plan+'"]');
        if(r){r.checked=true;syncPlan();}
        show(1,false);
      }
      section.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});
      if(history.replaceState)history.replaceState(null,'','#order');
    });
  });

  function orderId(){
    var id='DD-',chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for(var i=0;i<6;i++)id+=chars.charAt(Math.floor(Math.random()*chars.length));
    return id;
  }
  window.tcgPropertyCheckOrder=function(){
    var p=PLANS[plan()];
    return {
      plan:p.name,amount_usd:p.price,delivery_hours:p.hours,
      property_type:radio('type'),location:$('pc-loc').value.trim(),
      pin:pin?{lat:pin.lat,lng:pin.lng,confirmed:pinOk}:null,
      intended_use:checks('use'),project:$('pc-project').value.trim(),
      seller_name:needsCompany()?$('pc-seller').value.trim():'',
      seller_type:needsCompany()?radio('seller_type'):'',
      legal_company_name:needsCompany()&&isCompany()?$('pc-legal').value.trim():'',
      nib:$('pc-nib').value.trim(),name:$('pc-name').value.trim(),email:$('pc-email').value.trim(),
      documents:docList()
    };
  };
  function waMessage(id){
    var o=window.tcgPropertyCheckOrder(),L=[];
    L.push('Hello TCG, I would like to order Preliminary Due Diligence.');
    L.push('');
    L.push('Order: '+id);
    L.push('Plan: '+o.plan+' (US$'+o.amount_usd+', delivery within '+o.delivery_hours+' hours)');
    L.push('Property: '+o.property_type);
    L.push('Location: '+o.location);
    var pc=parseCoords(o.location);
    if(o.pin&&!(pc&&pc.lat===o.pin.lat&&pc.lng===o.pin.lng))L.push('Map pin: '+fix(o.pin.lat)+', '+fix(o.pin.lng)+(o.pin.confirmed?' (confirmed)':''));
    L.push('Intended use: '+o.intended_use.join(', '));
    if(o.project)L.push('Project: '+o.project);
    if(o.seller_name)L.push('Seller or developer: '+o.seller_name+(o.seller_type?' ('+o.seller_type+')':''));
    if(o.legal_company_name)L.push('Legal company name: '+o.legal_company_name);
    if(o.nib)L.push('NIB: '+o.nib);
    L.push('Documents: '+(o.documents.length?o.documents.join(', ')+' (I will send them in this chat)':'None'));
    L.push('');
    L.push('Name: '+o.name);
    L.push('Email for the report: '+o.email);
    return L.join('\n');
  }

  /* Step 4: send the order via WhatsApp */
  $('pc-pay').addEventListener('click',function(){
    if(paid||!validate4())return;
    var id=orderId();
    var url='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(waMessage(id));
    /* ------------------------------------------------------------------
       PAYMENT GATEWAY INTEGRATION POINT (later)
       Online payment is not connected yet. Orders go to WhatsApp.
       When a gateway is added: take payment here, then upload the
       documents with the order ID to the TCG endpoint only.
       ------------------------------------------------------------------ */
    $('pc-wa-link').href=url;
    paid=true;
    if(window.dataLayer)window.dataLayer.push({event:'whatsapp_click',location:'due_diligence_order',plan:plan()});
    var w=window.open(url,'_blank','noopener');
    if(!w){try{window.location.href=url;}catch(e){}}
    finish(id);
  });

  function finish(id){
    var p=PLANS[plan()],n=docCount();
    $('pc-d-id').textContent=id;
    $('pc-d-plan').textContent=p.name;
    $('pc-d-time').textContent='Within '+p.hours+' hours';
    $('pc-d-docs').textContent=n?docList().join(', '):'None';
    $('pc-d-email').textContent=$('pc-email').value.trim();
    done=true;
    form.hidden=true;
    $('pc-done').hidden=false;
    show(4,false);
    var top=panel.getBoundingClientRect().top;
    if(top<0||top>window.innerHeight*0.6)panel.scrollIntoView({block:'start'});
    $('pc-done').querySelector('h3').focus({preventScroll:true});
  }

  syncPlan();
  syncSellerType();
  show(1,false);
})();
