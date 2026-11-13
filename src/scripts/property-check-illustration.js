(function(){
  var fig=document.querySelector('figure.pk');
  if(!fig||!fig.getAnimations)return;
  var mq=window.matchMedia('(prefers-reduced-motion: reduce)');
  var lat=document.getElementById('pk-lat'),lon=document.getElementById('pk-lon');
  var LAT='-8.6491',LON='115.1386',tick=null;
  function r(n){var s='';for(var i=0;i<n;i++)s+=Math.floor(Math.random()*10);return s;}
  function coords(){
    clearInterval(tick);var t0=Date.now();
    tick=setInterval(function(){
      if(Date.now()-t0>1300){clearInterval(tick);lat.textContent=LAT;lon.textContent=LON;return;}
      lat.textContent='-8.'+r(4);lon.textContent='115.'+r(4);
    },60);
  }
  function restart(){
    fig.getAnimations({subtree:true}).forEach(function(a){a.currentTime=0;a.play();});
  }
  function cycle(){
    fig.classList.remove('pk-out');
    if(!mq.matches){restart();coords();}
    setTimeout(function(){if(!mq.matches)fig.classList.add('pk-out');},9550);
    setTimeout(cycle,10000);
  }
  cycle();
})();
