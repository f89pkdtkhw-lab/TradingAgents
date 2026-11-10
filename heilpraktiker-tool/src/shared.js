// Gemeinsame Bausteine für die interaktive App (Browser) UND die statische
// Ansicht, die beim Bauen fest in die HTML-Datei geschrieben wird
// (für Handy-Vorschauen ohne JavaScript).
(function(root){
"use strict";
var CATS = root.CATS || {};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function norm(s){return String(s||"").toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").normalize("NFD").replace(/[̀-ͯ]/g,"");}
function slug(s){return norm(s).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
// Text mit " • " als Aufzählung darstellen
function fmt(s){
  if(!s) return "<p>–</p>";
  var parts=String(s).split(" • ");
  if(parts.length>1) return "<ul>"+parts.map(function(p){return "<li>"+esc(p)+"</li>";}).join("")+"</ul>";
  return "<p>"+esc(s)+"</p>";
}
function badges(d,withCat){
  var h="";
  if(withCat) h+='<span class="badge b-cat">'+esc(CATS[d.k]||d.k)+'</span>';
  if(d.nf===2) h+='<span class="badge b-red">🚨 NOTFALL</span>';
  else if(d.nf===1) h+='<span class="badge b-amber">⚠️ kann Notfall werden</span>';
  if(d.bv) h+='<span class="badge b-violet">⛔ Behandlungsverbot</span>';
  return h;
}
var SECS=[
  ["d","1","Kurze Definition / Erklärung"],
  ["k","2","Kategorie / Organsystem"],
  ["u","3","Ursachen / Pathophysiologie"],
  ["s","4","Symptome / Leitsymptome"],
  ["ko","5","Komplikationen"],
  ["dd","6","Differentialdiagnosen"],
  ["b","7","Blutwerte / Labor / Diagnostik"]
];
// Inhalt einer Erkrankung (ohne Titel)
function detailHtml(d){
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
  return h;
}
function disclaimer(){
  return '<p class="disc">Lern- und Nachschlagehilfe zur Vorbereitung auf die Heilpraktikerprüfung – ersetzt kein Lehrbuch, keine ärztliche Diagnose und nicht den aktuellen Gesetzestext. Laborwerte sind Richtwerte (laborabhängig). Rechtsstand: IfSG, HeilprG, AMG, BtMG, ZHG, HebG – bei Zweifel den aktuellen Gesetzestext prüfen.</p>';
}
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
function notfallRegelnHtml(){
  return '<div class="panel" style="border-color:var(--red)"><h3>🚑 Grundregeln im Notfall</h3>'+
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
}
function leitHtml(){
  return '<div class="panel"><h3>🔎 Leitsymptom → an welchen Notfall denken?</h3><div class="tscroll"><table class="t"><tr><th>Leitsymptom</th><th>Denke an</th></tr>'+
    LEIT.map(function(r){return '<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td></tr>';}).join("")+'</table></div></div>';
}
function verbotRechtHtml(){
  return '<div class="panel" style="border-color:var(--violet)"><h3>⛔ Behandlungsverbot nach § 24 Infektionsschutzgesetz (IfSG)</h3>'+
  '<p>Die Behandlung von Personen, die an einer der folgenden Krankheiten erkrankt <b>oder dessen verdächtig</b> sind, ist <b>nur Ärzten</b> gestattet:</p><ul>'+
  '<li><b>§ 6 Abs. 1 Satz 1 Nr. 1 IfSG</b> – meldepflichtige Krankheiten (Verdacht, Erkrankung, Tod): Botulismus, Cholera, Diphtherie, humane spongiforme Enzephalopathie (CJK), akute Virushepatitis, HUS, virusbedingtes hämorrhagisches Fieber, Keuchhusten, Masern, Meningokokken-Meningitis/-Sepsis, Milzbrand, Mumps, Pest, Poliomyelitis, Röteln, Tollwut, Typhus/Paratyphus, Windpocken, zoonotische Influenza, Tuberkulose (Erkrankung/Tod) u. a.</li>'+
  '<li><b>§ 6 Abs. 1 Satz 1 Nr. 2</b> – mikrobielle Lebensmittelvergiftung / akute infektiöse Gastroenteritis (bei Tätigkeit im Lebensmittelbereich oder ≥ 2 Fällen mit Zusammenhang)</li>'+
  '<li><b>§ 6 Abs. 1 Satz 1 Nr. 5</b> – bedrohliche übertragbare Krankheiten, die nicht namentlich genannt sind</li>'+
  '<li><b>§ 34 Abs. 1 IfSG</b> – Krankheiten in Gemeinschaftseinrichtungen (Schule, Kita): u. a. Cholera, Diphtherie, EHEC-Enteritis, hämorrhagisches Fieber, Hib-Meningitis, Impetigo contagiosa, Keuchhusten, ansteckungsfähige Lungen-TBC, Masern, Meningokokken, Mumps, Mpox (Orthopocken), Paratyphus, Pest, Polio, Röteln, Scharlach / Streptococcus-pyogenes-Infektionen, Shigellose, Skabies, Typhus, Hepatitis A/E, Windpocken, <b>Kopflausbefall</b></li>'+
  '<li><b>§ 7 IfSG</b> – Infektion mit einem der labormeldepflichtigen Erreger (z. B. Salmonellen, Campylobacter, Noro-, Rota-, Influenza-, Hepatitis-, FSME-, Varizella-Zoster-Viren, Legionellen, Listerien, Yersinien, Giardia, Toxoplasma konnatal, HIV, Treponema pallidum, Plasmodien, Echinokokken, Gonokokken …)</li>'+
  '<li><b>sonstige sexuell übertragbare Krankheiten</b> (z. B. Gonorrhoe, Chlamydien, Herpes genitalis, Feigwarzen, Trichomonaden, Ulcus molle)</li></ul>'+
  '<p>Auch das Untersuchen auf diese Krankheiten (Abstriche/Erregernachweis) ist dem Heilpraktiker verboten. Bei Verdacht: <b>Patient an den Arzt verweisen</b>. Heilpraktiker sind nach § 8 Abs. 1 Nr. 8 IfSG bei Verdacht/Erkrankung nach § 6 <b>selbst meldepflichtig</b> (namentliche Meldung binnen 24 Std. an das Gesundheitsamt).</p></div>'+
  '<div class="panel"><h3>📜 Weitere Tätigkeitsverbote für Heilpraktiker</h3><ul>'+
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
}
function laborHtml(){
  var L=root.LABOR||[];
  var h='<div class="panel"><h3>🧪 Wichtige Laborwerte (Erwachsene, Richtwerte)</h3><p style="color:var(--muted)">Referenzbereiche schwanken je nach Labor und Methode. ↑/↓ = typische Ursachen.</p></div>';
  L.forEach(function(g){
    h+='<div class="panel"><h3>'+esc(g.g)+'</h3><div class="tscroll"><table class="t"><tr><th>Wert</th><th>Normbereich</th><th>↑ erhöht bei</th><th>↓ erniedrigt bei</th></tr>'+
      g.r.map(function(r){return '<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+esc(r[3])+'</td></tr>';}).join("")+'</table></div></div>';
  });
  return h;
}
root.HP={esc:esc,norm:norm,slug:slug,fmt:fmt,badges:badges,detailHtml:detailHtml,disclaimer:disclaimer,
  notfallRegelnHtml:notfallRegelnHtml,leitHtml:leitHtml,verbotRechtHtml:verbotRechtHtml,laborHtml:laborHtml};
})(window);
