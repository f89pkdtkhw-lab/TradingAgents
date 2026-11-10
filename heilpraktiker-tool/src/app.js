(function(){
"use strict";
try{
var D = (window.D || []).slice();
var CATS = window.CATS || {};
var HP = window.HP;
var esc=HP.esc, norm=HP.norm, fmt=HP.fmt, badges=HP.badges, disclaimer=HP.disclaimer;

function $(id){return document.getElementById(id);}
function store(k,v){try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v);}catch(e){return null;}}
D.forEach(function(d){
  d.id=HP.slug(d.n);
  d._s=norm([d.n,d.a,d.d,d.u,d.s,d.l,d.ko,d.dd,d.b,d.nfm,d.bv,(CATS[d.k]||"")].join(" "));
  d._n=norm(d.n+" "+(d.a||""));
  d._l=norm(d.l);
});
D.sort(function(a,b){return a.n.localeCompare(b.n,"de");});
var byId={}; D.forEach(function(d){byId[d.id]=d;});

// ---------- Einstellungen ----------
var fs=parseInt(store("hp_fs")||"17",10); if(!(fs>=13&&fs<=26)) fs=17;
function applyFs(){document.documentElement.style.setProperty("--fs",fs+"px");store("hp_fs",String(fs));}
applyFs();
$("fsPlus").onclick=function(){fs=Math.min(26,fs+1);applyFs();};
$("fsMinus").onclick=function(){fs=Math.max(13,fs-1);applyFs();};
var th=store("hp_theme"); if(th) document.documentElement.setAttribute("data-theme",th);
$("themeBtn").onclick=function(){
  var cur=document.documentElement.getAttribute("data-theme");
  var dark=cur?cur==="dark":(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  var nx=dark?"light":"dark"; document.documentElement.setAttribute("data-theme",nx); store("hp_theme",nx);
};
var favs={}; try{favs=JSON.parse(store("hp_favs")||"{}")||{};}catch(e){favs={};}
function saveFavs(){store("hp_favs",JSON.stringify(favs));}

// ---------- Zustand ----------
var state={tab:"liste",q:"",cat:"",not:false,bv:false,fav:false};

(function(){
  var sel=$("catSel"), counts={};
  D.forEach(function(d){counts[d.k]=(counts[d.k]||0)+1;});
  var h='<option value="">Alle Organsysteme ('+D.length+')</option>';
  Object.keys(CATS).forEach(function(k){ if(counts[k]) h+='<option value="'+k+'">'+esc(CATS[k])+' ('+counts[k]+')</option>';});
  sel.innerHTML=h;
  sel.onchange=function(){state.cat=sel.value;render();};
})();
function toggle(btn,key){btn.onclick=function(){state[key]=!state[key];btn.setAttribute("aria-pressed",state[key]);render();};}
toggle($("fNot"),"not"); toggle($("fBv"),"bv"); toggle($("fFav"),"fav");
var qT; $("q").addEventListener("input",function(e){clearTimeout(qT);qT=setTimeout(function(){state.q=e.target.value;render();},150);});
// Tastatur auf dem Handy nach "Enter" schließen
$("q").addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); e.target.blur(); }});

Array.prototype.forEach.call(document.querySelectorAll(".tab"),function(t){
  t.onclick=function(){setTab(t.getAttribute("data-tab"));};
});
function setTab(tab){
  state.tab=tab;
  Array.prototype.forEach.call(document.querySelectorAll(".tab"),function(t){t.setAttribute("aria-selected",t.getAttribute("data-tab")===tab);});
  $("listControls").style.display=tab==="liste"?"":"none";
  window.scrollTo(0,0); render();
}

function card(d){
  return '<button class="card" data-id="'+d.id+'"><h3>'+(favs[d.id]?"★ ":"")+esc(d.n)+'</h3>'+
    (d.a?'<div class="meta">'+esc(d.a)+'</div>':'')+
    '<div class="badges">'+badges(d,true)+'</div>'+
    (d.l?'<p class="ls">'+esc(d.l)+'</p>':'')+'</button>';
}
// Ein einziger Klick-Handler für alle Karten (zuverlässig auf Touch-Geräten)
$("main").addEventListener("click",function(e){
  var el=e.target.closest?e.target.closest("[data-id],[data-open]"):null;
  if(el && $("main").contains(el)){ openD(el.getAttribute("data-id")||el.getAttribute("data-open")); }
});

// ---------- Liste ----------
var LIMIT_STEP=60, limit=LIMIT_STEP;
function filtered(){
  var terms=norm(state.q).split(/\s+/).filter(Boolean);
  var res=D.filter(function(d){
    if(state.cat && d.k!==state.cat) return false;
    if(state.not && !d.nf) return false;
    if(state.bv && !d.bv) return false;
    if(state.fav && !favs[d.id]) return false;
    for(var i=0;i<terms.length;i++) if(d._s.indexOf(terms[i])<0) return false;
    return true;
  });
  if(terms.length){
    res.sort(function(a,b){
      function sc(x){ if(terms.every(function(t){return x._n.indexOf(t)>=0;})) return 0; if(terms.every(function(t){return x._l.indexOf(t)>=0;})) return 1+(x.nf===2?0:1); return 3; }
      var sa=sc(a), sb=sc(b);
      return sa-sb || a.n.localeCompare(b.n,"de");
    });
  }
  return res;
}
function renderList(keepLimit){
  if(!keepLimit) limit=LIMIT_STEP;
  var r=filtered();
  var h='<p class="count">'+r.length+' von '+D.length+' Erkrankungen'+(state.q?' für „'+esc(state.q)+'“':'')+'</p>';
  if(!r.length) h+='<div class="empty">Nichts gefunden. Anderen Suchbegriff oder weniger Filter versuchen.</div>';
  else h+='<div class="list">'+r.slice(0,limit).map(card).join("")+'</div>';
  if(r.length>limit) h+='<div style="text-align:center;margin:16px 0"><button class="btn" id="more">Weitere anzeigen ('+(r.length-limit)+')</button></div>';
  h+=disclaimer();
  $("main").innerHTML=h;
  if($("more")) $("more").onclick=function(){limit+=LIMIT_STEP*3; var y=window.scrollY; renderList(true); window.scrollTo(0,y);};
}

// ---------- Detail ----------
var listScroll=0;
function openD(id,noPush){
  var d=byId[id]; if(!d) return;
  if(!$("detail").classList.contains("open")) listScroll=window.scrollY;
  $("dTitle").textContent=d.n;
  $("dFav").textContent=favs[d.id]?"★":"☆";
  $("dFav").onclick=function(){ if(favs[d.id]) delete favs[d.id]; else favs[d.id]=1; saveFavs(); $("dFav").textContent=favs[d.id]?"★":"☆"; };
  $("dBody").innerHTML=HP.detailHtml(d)+disclaimer();
  document.body.classList.add("detail-open");
  $("detail").classList.add("open"); window.scrollTo(0,0);
  if(!noPush){ try{history.pushState({d:id},"","#"+id);}catch(e){} }
}
function closeD(){
  if(!$("detail").classList.contains("open")) return;
  $("detail").classList.remove("open"); document.body.classList.remove("detail-open");
  if(state.tab==="liste") renderList(true);
  window.scrollTo(0,listScroll);
}
$("back").onclick=function(){ if(history.state&&history.state.d){ try{history.back(); return;}catch(e){} } closeD(); };
window.addEventListener("popstate",function(e){ if(e.state&&e.state.d) openD(e.state.d,true); else closeD(); });
document.addEventListener("keydown",function(e){ if(e.key==="Escape" && $("detail").classList.contains("open")) $("back").click(); });

// ---------- Notfälle ----------
function renderNotfall(){
  var groups={};
  D.filter(function(d){return d.nf===2;}).forEach(function(d){(groups[d.k]=groups[d.k]||[]).push(d);});
  var h=HP.notfallRegelnHtml()+HP.leitHtml();
  h+='<h3 style="margin:18px 0 4px">Alle Erkrankungen, die immer ein Notfall sind ('+D.filter(function(d){return d.nf===2;}).length+')</h3>';
  Object.keys(CATS).forEach(function(k){
    if(!groups[k]) return;
    h+='<div class="grp">'+esc(CATS[k])+'</div><div class="list">'+groups[k].map(card).join("")+'</div>';
  });
  var n1=D.filter(function(d){return d.nf===1;});
  h+='<h3 style="margin:22px 0 4px">⚠️ Können zum Notfall werden ('+n1.length+')</h3><div class="list">'+n1.map(card).join("")+'</div>';
  h+=disclaimer();
  $("main").innerHTML=h;
}

// ---------- Behandlungsverbote ----------
function renderVerbot(){
  var bv=D.filter(function(d){return d.bv;});
  var h=HP.verbotRechtHtml();
  h+='<h3 style="margin:18px 0 4px">Erkrankungen mit Behandlungsverbot in dieser Sammlung ('+bv.length+')</h3><div class="list">'+bv.map(card).join("")+'</div>';
  h+=disclaimer();
  $("main").innerHTML=h;
}

// ---------- Lernkarten ----------
var lern={cat:"",only:"",cur:null,shown:{}};
function pickCard(){
  var pool=D.filter(function(d){
    if(lern.cat&&d.k!==lern.cat) return false;
    if(lern.only==="nf"&&!d.nf) return false;
    if(lern.only==="bv"&&!d.bv) return false;
    if(lern.only==="fav"&&!favs[d.id]) return false;
    return true;
  });
  if(!pool.length){lern.cur=null;return;}
  var c; do{c=pool[Math.floor(Math.random()*pool.length)];}while(pool.length>1&&lern.cur&&c.id===lern.cur.id);
  lern.cur=c; lern.shown={};
}
function renderLern(){
  if(!lern.cur) pickCard();
  var catOpts='<option value="">Alle Organsysteme</option>'+Object.keys(CATS).map(function(k){return '<option value="'+k+'"'+(lern.cat===k?" selected":"")+'>'+esc(CATS[k])+'</option>';}).join("");
  var h='<div class="filters"><select class="cat" id="lCat">'+catOpts+'</select>'+
    '<select class="cat" id="lOnly"><option value="">Alle Karten</option><option value="nf"'+(lern.only==="nf"?" selected":"")+'>Nur Notfälle</option><option value="bv"'+(lern.only==="bv"?" selected":"")+'>Nur Behandlungsverbote</option><option value="fav"'+(lern.only==="fav"?" selected":"")+'>Nur Gemerkte</option></select></div>';
  var c=lern.cur;
  if(!c){h+='<div class="empty">Keine Karten für diese Auswahl.</div>';}
  else{
    h+='<div class="flash"><div class="meta" style="color:var(--muted);font-size:.85rem">'+esc(CATS[c.k])+'</div><h3>'+esc(c.n)+'</h3>'+
      '<p style="color:var(--muted);margin:4px 0 0">Was weißt du dazu? Tippe auf einen Punkt zum Aufdecken.</p><div class="revbtns">';
    var items=[["d","Definition"],["u","Ursachen"],["s","Symptome"],["l","Leitsymptom"],["ko","Komplikationen"],["dd","DD"],["b","Labor"],["nf","Notfall?"],["bv","Behandlungsverbot?"]];
    items.forEach(function(it){ h+='<button class="btn ghost" data-rev="'+it[0]+'"'+(lern.shown[it[0]]?' style="opacity:.55"':'')+'>'+it[1]+'</button>'; });
    h+='<button class="btn ghost" data-rev="all">Alles</button></div>';
    items.forEach(function(it){
      if(!lern.shown[it[0]]) return;
      var v;
      if(it[0]==="nf") v=c.nf===2?"JA – immer Notfall. "+(c.nfm||""):c.nf===1?"Kann zum Notfall werden. "+(c.nfm||""):"Kein typischer Notfall.";
      else if(it[0]==="bv") v=c.bv?"JA – "+c.bv:"Kein Behandlungsverbot nach IfSG (Sorgfaltspflicht beachten).";
      else v=c[it[0]];
      h+='<div class="sec"><h4>'+it[1]+'</h4>'+fmt(v)+'</div>';
    });
    h+='<div class="revbtns"><button class="btn" id="lNext">Nächste Karte →</button><button class="btn ghost" data-open="'+c.id+'">Ganze Seite öffnen</button></div></div>';
  }
  $("main").innerHTML=h;
  $("lCat").onchange=function(e){lern.cat=e.target.value;lern.cur=null;renderLern();};
  $("lOnly").onchange=function(e){lern.only=e.target.value;lern.cur=null;renderLern();};
  if($("lNext")) $("lNext").onclick=function(){pickCard();renderLern();window.scrollTo(0,0);};
  Array.prototype.forEach.call($("main").querySelectorAll("[data-rev]"),function(b){b.onclick=function(){
    var r=b.getAttribute("data-rev"); if(r==="all"){["d","u","s","l","ko","dd","b","nf","bv"].forEach(function(x){lern.shown[x]=1;});} else lern.shown[r]=1; renderLern();
  };});
}

function renderLabor(){ $("main").innerHTML=HP.laborHtml()+disclaimer(); }

function render(){
  if(state.tab==="liste") renderList();
  else if(state.tab==="notfall") renderNotfall();
  else if(state.tab==="verbot") renderVerbot();
  else if(state.tab==="lern") renderLern();
  else if(state.tab==="labor") renderLabor();
}

// Nach-oben-Knopf
var topBtn=$("toTop");
window.addEventListener("scroll",function(){ topBtn.style.display=window.scrollY>600?"block":"none"; },{passive:true});
topBtn.onclick=function(){window.scrollTo(0,0);};

render();
// statische Ansicht entfernen (spart Speicher), interaktive Ansicht anzeigen
var st=$("static"); if(st&&st.parentNode) st.parentNode.removeChild(st);
var h0=location.hash.replace("#",""); if(h0&&byId[h0]){ try{history.replaceState(null,"",location.pathname);}catch(e){} openD(h0); }
}catch(err){
  // Falls etwas schiefgeht: einfache (statische) Ansicht zeigen
  document.documentElement.className=document.documentElement.className.replace(/\bjs\b/,"");
  if(window.console) console.error(err);
}
})();
