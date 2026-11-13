(function(){
  var fig=document.querySelector('figure.rg');
  if(!fig||!fig.getAnimations)return;
  var mq=window.matchMedia('(prefers-reduced-motion: reduce)');
  function restart(){
    fig.getAnimations({subtree:true}).forEach(function(a){a.currentTime=0;a.play();});
  }
  function cycle(){
    fig.classList.remove('rg-out');
    if(!mq.matches)restart();
    setTimeout(function(){if(!mq.matches)fig.classList.add('rg-out');},9550);
    setTimeout(cycle,10000);
  }
  cycle();
})();
