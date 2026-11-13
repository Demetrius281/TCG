(function(){
  var page=document.querySelector('.regulations-page');
  if(!page||!window.matchMedia('(max-width:767px)').matches)return;
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e}
  function details(title,body){
    var d=el('details','mobile-reg-disclosure'),s=el('summary','',title),b=el('div','mobile-reg-body');
    b.appendChild(body);d.append(s,b);return d;
  }
  function mobileOnly(node){node.classList.add('reg-mobile-only');return node}
  // A single mobile-only link, matching the existing hero's question anchor.
  var original=document.querySelector('section[aria-labelledby="page-title"] a[href="#guide-index"]');
  if(original){original.classList.add('reg-hero-arrow');original.innerHTML='Choose Your Question <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v17m-7-7 7 7 7-7" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';}
  // Common scenarios: keep the problem visible, reveal the two detailed columns.
  var sc=document.querySelector('#scenarios + .tbl-wrap');
  if(sc){
    var group=mobileOnly(el('div','reg-mobile-group'));
    sc.querySelectorAll('tbody tr').forEach(function(tr){
      var cells=tr.querySelectorAll('th,td');
      if(cells.length<3)return;
      var b=el('div');
      [1,2].forEach(function(i){var p=el('p');var label=el('strong','',cells[i].getAttribute('data-label')+': ');p.append(label,document.createTextNode(cells[i].textContent.trim()));b.append(p)});
      group.appendChild(details(cells[0].textContent.trim(),b));
    });
    sc.after(group);
  }
  // 2026 updates: titles and legal statuses remain visible; explanation on demand.
  var updates=document.querySelector('#changes-2026 .tl');
  if(updates){
    var u=mobileOnly(el('div','reg-mobile-group'));
    updates.querySelectorAll(':scope > li').forEach(function(li){
      var title=li.querySelector('h3'),body=el('div');
      var meta=li.querySelector('.meta'),p=li.querySelector('p');
      if(meta)body.appendChild(meta.cloneNode(true));
      if(p)body.appendChild(p.cloneNode(true));
      if(title)u.appendChild(details(title.textContent.trim(),body));
    });
    updates.after(u);
  }
  // Audit: show all groups in an overview and reveal each group's original checks.
  var audit=document.querySelector('#audit .audit-t');
  if(audit){
    var a=mobileOnly(el('div','reg-mobile-group'));
    audit.querySelectorAll('tbody').forEach(function(tb){
      var name=tb.querySelector('.grp th');if(!name)return;
      var b=el('div');
      tb.querySelectorAll('tr:not(.grp)').forEach(function(tr){
        var th=tr.querySelector('th'),td=tr.querySelector('td');if(!th||!td)return;
        var p=el('p');p.append(el('strong','',th.textContent.trim()+': '),document.createTextNode(td.textContent.trim()));b.appendChild(p);
      });
      a.appendChild(details(name.textContent.trim(),b));
    });
    audit.after(a);
  }
  var path=document.querySelector('#legalization-steps + .path');
  if(path){var hint=mobileOnly(el('p','mobile-reg-hint','Swipe sideways to follow all 6 steps →'));path.after(hint)}
  if(sc&&updates&&audit)page.classList.add('reg-mobile-enhanced');
})();
