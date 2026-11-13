(function(){
  if(!window.matchMedia('(max-width:767px)').matches)return;
  var p=document.querySelector('.regulations-page');if(!p)return;
  var faq=p.querySelector('#faq-h');
  if(faq&&faq.textContent.trim()==='Quick answers')faq.textContent='What Bali Property Owners Ask Most Often';
})();
