(function(){
"use strict";
var D = (window.D || []).slice();
var CATS = window.CATS || {};

// ---------- Hilfsfunktionen ----------
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function norm(s){return String(s||"").toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").normalize("NFD").replace(/[̀-ͯ]/g,"");}
function slug(s){return norm(s).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function store(k,v){try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v);}catch(e){return null;}}
// Text mit " • " als Aufzählung darstellen
function fmt(s){
  if(!s) return "<p>–</p>";
  var parts=String(s).split(" • ");
  if(parts.length>1) return "<ul>"+parts.map(function(p){return "<li>"+esc(p)+"</li>";}).join("")+"</ul>";
  return "<p>"+esc(s)+"</p>";
}
D.forEach(function(d){
  d.id=slug(d.n);
  d._s=norm([d.n,d.a,d.d,d.u,d.s,d.l,d.ko,d.dd,d.b,d.nfm,d.bv,(CATS[d.k]||"")].join(" "));
  d._n=norm(d.n+" "+(d.a||""));
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
  var dark=cur?cur==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;
  var nx=dark?"light":"dark"; document.documentElement.setAttribute("data-theme",nx); store("hp_theme",nx);
};
var favs={}; try{favs=JSON.parse(store("hp_favs")||"{}")||{};}catch(e){favs={};}
function saveFavs(){store("hp_favs",JSON.stringify(favs));}

// ---------- Zustand ----------
var state={tab:"liste",q:"",cat:"",not:false,bv:false,fav:false};

// Kategorie-Auswahl
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
var qT; $("q").addEventListener("input",function(e){clearTimeout(qT);qT=setTimeout(function(){state.q=e.target.value;render();},120);});

document.querySelectorAll(".tab").forEach(function(t){
  t.onclick=function(){setTab(t.dataset.tab);};
});
function setTab(tab){
  state.tab=tab;
  document.querySelectorAll(".tab").forEach(function(t){t.setAttribute("aria-selected",t.dataset.tab===tab);});
  $("listControls").style.display=tab==="liste"?"":"none";
  window.scrollTo(0,0); render();
}

// ---------- Badges ----------
function badges(d,withCat){
  var h="";
  if(withCat) h+='<span class="badge b-cat">'+esc(CATS[d.k]||d.k)+'</span>';
  if(d.nf===2) h+='<span class="badge b-red">🚨 NOTFALL</span>';
  else if(d.nf===1) h+='<span class="badge b-amber">⚠️ kann Notfall werden</span>';
  if(d.bv) h+='<span class="badge b-violet">⛔ Behandlungsverbot</span>';
  return h;
}
function card(d){
  return '<button class="card" data-id="'+d.id+'"><h3>'+(favs[d.id]?"★ ":"")+esc(d.n)+'</h3>'+
    (d.a?'<div class="meta">'+esc(d.a)+'</div>':'')+
    '<div class="badges">'+badges(d,true)+'</div>'+
    (d.l?'<p class="ls">'+esc(d.l)+'</p>':'')+'</button>';
}
function bindCards(root){
  root.querySelectorAll(".card,[data-open]").forEach(function(el){
    el.addEventListener("click",function(){openD(el.dataset.id||el.dataset.open);});
  });
}

// ---------- Liste ----------
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
      var sa=terms.every(function(t){return a._n.indexOf(t)>=0;})?0:1;
      var sb=terms.every(function(t){return b._n.indexOf(t)>=0;})?0:1;
      return sa-sb || a.n.localeCompare(b.n,"de");
    });
  }
  return res;
}
function renderList(){
  var r=filtered();
  var h='<p class="count">'+r.length+' von '+D.length+' Erkrankungen'+(state.q?' für „'+esc(state.q)+'“':'')+'</p>';
  if(!r.length) h+='<div class="empty">Nichts gefunden. Anderen Suchbegriff oder weniger Filter versuchen.</div>';
  else h+='<div class="list">'+r.map(card).join("")+'</div>';
  h+=disclaimer();
  $("main").innerHTML=h; bindCards($("main"));
}

// ---------- Detail ----------
var SECS=[
  ["d","1","Kurze Definition / Erklärung"],
  ["k","2","Kategorie / Organsystem"],
  ["u","3","Ursachen / Pathophysiologie"],
  ["s","4","Symptome / Leitsymptome"],
  ["ko","5","Komplikationen"],
  ["dd","6","Differentialdiagnosen"],
  ["b","7","Blutwerte / Labor / Diagnostik"]
];
function openD(id,noPush){
  var d=byId[id]; if(!d) return;
  $("dTitle").textContent=d.n;
  $("dFav").textContent=favs[d.id]?"★":"☆";
  $("dFav").onclick=function(){ if(favs[d.id]) delete favs[d.id]; else favs[d.id]=1; saveFavs(); $("dFav").textContent=favs[d.id]?"★":"☆"; };
  var h="";
  if(d.a) h+='<p class="alias">Auch: '+esc(d.a)+'</p>';
  h+='<div class="badges" style="margin-bottom:6px">'+badges(d,false)+'</div>';
  if(d.nf) h+='<div class="alert '+(d.nf===2?"red":"amber")+'"><h4>'+(d.nf===2?"🚨 NOTFALL – sofort 112 / Notarzt":"⚠️ Kann zum Notfall werden")+'</h4>'+fmt(d.nfm||"Bei Verschlechterung sofort Notruf 112.")+'</div>';
  if(d.bv) h+='<div class="alert violet"><h4>⛔ Behandlungsverbot für Heilpraktiker</h4>'+fmt(d.bv)+'</div>';
  SECS.forEach(function(s){
    var v=s[0]==="k"?(CATS[d.k]||d.k):d[s[0]];
    h+='<div class="sec"><h4><span class="num">'+s[1]+'.</span> '+s[2]+'</h4>'+fmt(v)+
      (s[0]==="s"&&d.l?'<div class="ls-box">Leitsymptom(e): '+esc(d.l)+'</div>':'')+'</div>';
  });
  h+=disclaimer();
  $("dBody").innerHTML=h;
  $("detail").classList.add("open"); $("detail").scrollTop=0;
  document.body.style.overflow="hidden";
  if(!noPush){ try{history.pushState({d:id},"","#"+id);}catch(e){} }
}
function closeD(){ $("detail").classList.remove("open"); document.body.style.overflow=""; if(state.tab==="liste") renderList(); }
$("back").onclick=function(){ if(history.state&&history.state.d) history.back(); else closeD(); };
window.addEventListener("popstate",function(e){ if(e.state&&e.state.d) openD(e.state.d,true); else closeD(); });
document.addEventListener("keydown",function(e){ if(e.key==="Escape" && $("detail").classList.contains("open")) $("back").click(); });

function disclaimer(){
  return '<p class="disc">Lern- und Nachschlagehilfe zur Vorbereitung auf die Heilpraktikerprüfung – ersetzt kein Lehrbuch, keine ärztliche Diagnose und nicht den aktuellen Gesetzestext. Laborwerte sind Richtwerte (laborabhängig). Rechtsstand: IfSG, HeilprG, AMG, BtMG, ZHG, HebG – bei Zweifel den aktuellen Gesetzestext prüfen.</p>';
}

// ---------- Notfälle ----------
var LEIT=[
  ["Akuter Brustschmerz","Herzinfarkt, instabile Angina pectoris, Lungenembolie, Aortendissektion, Spannungspneumothorax, Perikarditis/Perikardtamponade, Ösophagusruptur"],
  ["Akute Atemnot","Lungenembolie, Lungenödem, Status asthmaticus, Pneumothorax, Anaphylaxie, Epiglottitis/Pseudokrupp, Fremdkörperaspiration, Pneumonie (schwer)"],
  ["Akuter Bauchschmerz (akutes Abdomen)","Perforation, Ileus, Appendizitis, Mesenterialinfarkt, akute Pankreatitis, rupturiertes Aortenaneurysma, Extrauteringravidität, Gallen-/Nierenkolik, Hodentorsion/Ovarialtorsion"],
  ["Plötzlicher „Vernichtungskopfschmerz“","Subarachnoidalblutung, Hirnblutung, Meningitis, akutes Glaukom, hypertensiver Notfall, Sinusvenenthrombose"],
  ["Lähmung, Sprach-/Sehstörung, hängender Mundwinkel","Schlaganfall/TIA (FAST-Test!), Hirnblutung, Hypoglykämie (DD!)"],
  ["Fieber + Nackensteife + Petechien","Meningokokken-Meningitis / -Sepsis (Waterhouse-Friderichsen) – Behandlungsverbot + Notfall"],
  ["Bewusstseinsstörung / Koma","Hypoglykämie, Ketoazidose, hyperosmolares Koma, Schlaganfall, Vergiftung, Leber-/urämisches Koma, Addison-Krise, Myxödemkoma, Krampfanfall"],
  ["Krampfanfall > 5 Minuten","Status epilepticus, Eklampsie, Hypoglykämie, Meningitis/Enzephalitis"],
  ["Schock (Puls ↑, RR ↓, kaltschweißig)","Blutung, Anaphylaxie, Sepsis, Herzinfarkt (kardiogen), Lungenembolie, Dehydratation"],
  ["Bluterbrechen / Teerstuhl","Ösophagusvarizenblutung, Ulkusblutung, Mallory-Weiss-Syndrom"],
  ["Kaltes, blasses, pulsloses Bein","Akuter arterieller Verschluss (6 P nach Pratt)"],
  ["Geschwollenes, blau-rotes, schmerzhaftes Bein","Tiefe Beinvenenthrombose (Lungenemboliegefahr!), Phlegmasia coerulea dolens"],
  ["Rotes, hartes, schmerzhaftes Auge + Übelkeit","Akuter Glaukomanfall"],
  ["Plötzlicher schmerzloser Sehverlust","Zentralarterienverschluss, Netzhautablösung, Riesenzellarteriitis"],
  ["Akuter Hodenschmerz (junger Mann)","Hodentorsion (OP binnen 4–6 Std.)"],
  ["Schwangere mit Kopfschmerz, Sehstörung, Oberbauchschmerz","Präeklampsie/Eklampsie, HELLP-Syndrom"],
  ["Unterbauchschmerz + ausbleibende Regel","Extrauteringravidität (Tubarruptur → Schock)"],
  ["Suizidgedanken mit konkretem Plan","Akute Suizidalität → nicht allein lassen, 112"],
  ["Rückenschmerz + Taubheit im Reithosenbereich + Blasenstörung","Cauda-equina-Syndrom (Notfall-OP)"]
];
function renderNotfall(){
  var groups={};
  D.filter(function(d){return d.nf===2;}).forEach(function(d){(groups[d.k]=groups[d.k]||[]).push(d);});
  var h='<div class="panel" style="border-color:var(--red)"><h3>🚑 Grundregeln im Notfall</h3>'+
  '<p><span class="big112">112</span> &nbsp;Notruf – Feuerwehr/Rettungsdienst (europaweit)</p>'+
  '<ol><li><b>Eigenschutz</b>, Situation erfassen.</li>'+
  '<li><b>Bewusstsein</b> prüfen (ansprechen, anfassen, Schmerzreiz).</li>'+
  '<li><b>Atmung</b> prüfen (Kopf überstrecken, max. 10 Sek. sehen–hören–fühlen).</li>'+
  '<li><b>Keine normale Atmung → 112 + Herzdruckmassage</b> 30:2 (100–120/min, 5–6 cm tief), AED holen lassen.</li>'+
  '<li>Bewusstlos mit Atmung → <b>stabile Seitenlage</b>, ständig Atmung kontrollieren.</li>'+
  '<li>Notruf: <b>Wo? Was? Wie viele? Welche Verletzungen/Symptome? Warten auf Rückfragen.</b></li>'+
  '<li>Vitalzeichen überwachen (Puls, RR, Atmung, Bewusstsein, BZ), beim Patienten bleiben, beruhigen, Wärmeerhalt, <b>nichts essen/trinken</b>.</li>'+
  '<li><b>ABCDE</b>: Airway – Breathing – Circulation – Disability (Neuro, BZ) – Exposure.</li>'+
  '<li>Dokumentieren (Uhrzeit, Befunde, Maßnahmen) und an Rettungsdienst übergeben.</li></ol>'+
  '<p><b>Lagerungen:</b> Schock → Beine hoch (Schocklage, nicht bei kardiogenem Schock/Lungenödem) • Atemnot/Lungenödem/Herzinfarkt → Oberkörper hoch (Herzbett, Beine tief) • akutes Abdomen → Knierolle • Schlaganfall → Oberkörper 30° • Schwangere ab 2. Hälfte → Linksseitenlage (V.-cava-Kompression).</p>'+
  '<p><b>Merke:</b> Im Notfall darf und muss auch der Heilpraktiker Erste Hilfe leisten (§ 323c StGB – unterlassene Hilfeleistung). Auch bei Behandlungsverbot gilt die Pflicht zur Ersten Hilfe!</p></div>';
  h+='<div class="panel"><h3>🔎 Leitsymptom → an welchen Notfall denken?</h3><div class="tscroll"><table class="t"><tr><th>Leitsymptom</th><th>Denke an</th></tr>'+
    LEIT.map(function(r){return '<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td></tr>';}).join("")+'</table></div></div>';
  h+='<h3 style="margin:18px 0 4px">Alle Erkrankungen, die immer ein Notfall sind ('+D.filter(function(d){return d.nf===2;}).length+')</h3>';
  Object.keys(CATS).forEach(function(k){
    if(!groups[k]) return;
    h+='<div class="grp">'+esc(CATS[k])+'</div><div class="list">'+groups[k].map(card).join("")+'</div>';
  });
  var n1=D.filter(function(d){return d.nf===1;});
  h+='<h3 style="margin:22px 0 4px">⚠️ Können zum Notfall werden ('+n1.length+')</h3><div class="list">'+n1.map(card).join("")+'</div>';
  h+=disclaimer();
  $("main").innerHTML=h; bindCards($("main"));
}

// ---------- Behandlungsverbote ----------
function renderVerbot(){
  var bv=D.filter(function(d){return d.bv;});
  var h='<div class="panel" style="border-color:var(--violet)"><h3>⛔ Behandlungsverbot nach § 24 Infektionsschutzgesetz (IfSG)</h3>'+
  '<p>Die Behandlung von Personen, die an einer der folgenden Krankheiten erkrankt <b>oder dessen verdächtig</b> sind, ist <b>nur Ärzten</b> gestattet:</p><ul>'+
  '<li><b>§ 6 Abs. 1 Satz 1 Nr. 1 IfSG</b> – meldepflichtige Krankheiten (Verdacht, Erkrankung, Tod): Botulismus, Cholera, Diphtherie, humane spongiforme Enzephalopathie (CJK), akute Virushepatitis, HUS, virusbedingtes hämorrhagisches Fieber, Keuchhusten, Masern, Meningokokken-Meningitis/-Sepsis, Milzbrand, Mumps, Pest, Poliomyelitis, Röteln, Tollwut, Typhus/Paratyphus, Windpocken, zoonotische Influenza, Tuberkulose (Erkrankung/Tod) u. a.</li>'+
  '<li><b>§ 6 Abs. 1 Satz 1 Nr. 2</b> – mikrobielle Lebensmittelvergiftung / akute infektiöse Gastroenteritis (bei Tätigkeit im Lebensmittelbereich oder ≥ 2 Fällen mit Zusammenhang)</li>'+
  '<li><b>§ 6 Abs. 1 Satz 1 Nr. 5</b> – bedrohliche übertragbare Krankheiten, die nicht namentlich genannt sind</li>'+
  '<li><b>§ 34 Abs. 1 IfSG</b> – Krankheiten in Gemeinschaftseinrichtungen (Schule, Kita): u. a. Cholera, Diphtherie, EHEC-Enteritis, hämorrhagisches Fieber, Hib-Meningitis, Impetigo contagiosa, Keuchhusten, ansteckungsfähige Lungen-TBC, Masern, Meningokokken, Mumps, Mpox (Orthopocken), Paratyphus, Pest, Polio, Röteln, Scharlach / Streptococcus-pyogenes-Infektionen, Shigellose, Skabies, Typhus, Hepatitis A/E, Windpocken, <b>Kopflausbefall</b></li>'+
  '<li><b>§ 7 IfSG</b> – Infektion mit einem der labormeldepflichtigen Erreger (z. B. Salmonellen, Campylobacter, Noro-, Rota-, Influenza-, Hepatitis-, FSME-, Varizella-Zoster-Viren, Legionellen, Listerien, Yersinien, Giardia, Toxoplasma konnatal, HIV, Treponema pallidum, Plasmodien, Echinokokken, Gonokokken …)</li>'+
  '<li><b>sonstige sexuell übertragbare Krankheiten</b> (z. B. Gonorrhoe, Chlamydien, Herpes genitalis, Feigwarzen, Trichomonaden, Ulcus molle)</li></ul>'+
  '<p>Auch das Untersuchen auf diese Krankheiten (Abstriche/Erregernachweis) ist dem Heilpraktiker verboten. Bei Verdacht: <b>Patient an den Arzt verweisen</b>. Heilpraktiker sind nach § 8 Abs. 1 Nr. 8 IfSG bei Verdacht/Erkrankung nach § 6 <b>selbst meldepflichtig</b> (namentliche Meldung binnen 24 Std. an das Gesundheitsamt).</p></div>';
  h+='<div class="panel"><h3>📜 Weitere Tätigkeitsverbote für Heilpraktiker</h3><ul>'+
  '<li><b>Zahnheilkunde</b> (Zahnheilkundegesetz) – keine Behandlung von Zähnen, Mund- und Kieferkrankheiten im zahnärztlichen Sinn</li>'+
  '<li><b>Geburtshilfe</b> (Hebammengesetz) – nur Hebammen und Ärzte; Ausnahme: Notfall</li>'+
  '<li><b>Verschreibungspflichtige Arzneimittel</b> (AMG) – dürfen nicht verordnet werden</li>'+
  '<li><b>Betäubungsmittel</b> (BtMG) – keine Verschreibung</li>'+
  '<li><b>Röntgen / ionisierende Strahlen</b> zur Anwendung am Menschen (Strahlenschutzrecht)</li>'+
  '<li><b>Leichenschau</b> und Ausstellen des Totenscheins; Todesfeststellung (Landesrecht)</li>'+
  '<li><b>Impfungen</b> sowie Behandlung meldepflichtiger Tierseuchen; Ausstellen von <b>Arbeitsunfähigkeitsbescheinigungen</b> mit Wirkung für die gesetzliche Krankenversicherung</li>'+
  '<li>Transplantationen, Schwangerschaftsabbruch, Kastration, Blut-/Plasmaspenden-Entnahme, künstliche Befruchtung (ESchG), Geschlechtsumwandlung u. a. – Arztvorbehalt</li>'+
  '<li>Behandlung im Rahmen der gesetzlichen Unfall-/Krankenversicherung als Leistungserbringer</li></ul>'+
  '<p><b>Sorgfaltspflicht:</b> Der Heilpraktiker muss seine Grenzen kennen und bei ernsten Erkrankungen rechtzeitig an den Arzt verweisen.</p></div>';
  h+='<h3 style="margin:18px 0 4px">Erkrankungen mit Behandlungsverbot in dieser Sammlung ('+bv.length+')</h3><div class="list">'+bv.map(card).join("")+'</div>';
  h+=disclaimer();
  $("main").innerHTML=h; bindCards($("main"));
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
  if($("lNext")) $("lNext").onclick=function(){pickCard();renderLern();};
  $("main").querySelectorAll("[data-rev]").forEach(function(b){b.onclick=function(){
    var r=b.dataset.rev; if(r==="all"){["d","u","s","l","ko","dd","b","nf","bv"].forEach(function(x){lern.shown[x]=1;});} else lern.shown[r]=1; renderLern();
  };});
  bindCards($("main"));
}

// ---------- Laborwerte ----------
function renderLabor(){
  var L=window.LABOR||[];
  var h='<div class="panel"><h3>🧪 Wichtige Laborwerte (Erwachsene, Richtwerte)</h3><p style="color:var(--muted)">Referenzbereiche schwanken je nach Labor und Methode. ↑/↓ = typische Ursachen.</p></div>';
  L.forEach(function(g){
    h+='<div class="panel"><h3>'+esc(g.g)+'</h3><div class="tscroll"><table class="t"><tr><th>Wert</th><th>Normbereich</th><th>↑ erhöht bei</th><th>↓ erniedrigt bei</th></tr>'+
      g.r.map(function(r){return '<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+esc(r[3])+'</td></tr>';}).join("")+'</table></div></div>';
  });
  h+=disclaimer();
  $("main").innerHTML=h;
}

function render(){
  if(state.tab==="liste") renderList();
  else if(state.tab==="notfall") renderNotfall();
  else if(state.tab==="verbot") renderVerbot();
  else if(state.tab==="lern") renderLern();
  else if(state.tab==="labor") renderLabor();
}
render();
var h0=location.hash.replace("#",""); if(h0&&byId[h0]){ try{history.replaceState(null,"",location.pathname);}catch(e){} openD(h0); }
})();
