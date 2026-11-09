window.D = window.D || [];
var D = window.D;
window.CATS = {
  herz:"Herz & Kreislauf",
  gefaess:"Gefäße (Arterien, Venen, Lymphe)",
  lunge:"Atmungssystem",
  verdauung:"Verdauungstrakt",
  leber:"Leber, Galle & Pankreas",
  niere:"Niere, Harnwege & männl. Geschlechtsorgane",
  endokrin:"Hormone & Stoffwechsel",
  blut:"Blut & Lymphatisches System",
  bewegung:"Bewegungsapparat & Rheuma",
  nerven:"Nervensystem",
  psyche:"Psychiatrie",
  haut:"Haut",
  infekt:"Infektionskrankheiten",
  sti:"Sexuell übertragbare Krankheiten",
  auge:"Auge",
  hno:"Hals-Nasen-Ohren",
  gyn:"Gynäkologie & Schwangerschaft",
  allg:"Allgemeine Notfälle & Sonstiges"
};
// Textbausteine Rechtsgrundlage
var BV6 = "§ 24 IfSG i. V. m. § 6 Abs. 1 Nr. 1 IfSG (namentlich meldepflichtig bei Verdacht, Erkrankung und Tod) • Heilpraktiker ist selbst meldepflichtig (§ 8 IfSG) → Meldung an das Gesundheitsamt, Patient an Arzt verweisen";
var BV7 = "§ 24 IfSG i. V. m. § 7 IfSG (labormeldepflichtiger Erreger) • Behandlung und Erregernachweis nur durch Ärzte → Patient an Arzt verweisen";
var BV34 = "§ 24 IfSG i. V. m. § 34 Abs. 1 IfSG (Krankheit in Gemeinschaftseinrichtungen) • Besuchsverbot für Schule/Kita bis zur Nicht-Ansteckungsfähigkeit";
var BVSTI = "§ 24 IfSG: „sonstige sexuell übertragbare Krankheit“ – Behandlung nur durch Ärzte • Partner mitbehandeln lassen";
var BVGE = "§ 24 IfSG i. V. m. § 6 Abs. 1 Nr. 2 IfSG (akute infektiöse Gastroenteritis bei Lebensmittel-Beschäftigten oder ≥ 2 Fällen mit Zusammenhang) und § 7 IfSG (Erregernachweis)";

window.LABOR = [
 {g:"Blutbild", r:[
  ["Hämoglobin (Hb)","♀ 12–16 g/dl • ♂ 14–18 g/dl","Polyglobulie, Polycythaemia vera, Exsikkose, Höhenaufenthalt, Rauchen","Anämie (Eisen-, B12-, Folsäuremangel, Blutung, Hämolyse, Niereninsuffizienz)"],
  ["Erythrozyten","♀ 4,0–5,2 /pl • ♂ 4,5–5,9 /pl","Polyglobulie, Exsikkose","Anämie, Überwässerung"],
  ["Hämatokrit","♀ 37–47 % • ♂ 40–52 %","Exsikkose, Polyglobulie","Anämie, Überwässerung"],
  ["MCV","80–96 fl","makrozytär: Vit.-B12-/Folsäuremangel, Alkohol, Lebererkrankung","mikrozytär: Eisenmangel, Thalassämie, chron. Entzündung"],
  ["MCH (HbE)","27–33 pg","hyperchrom: B12-/Folsäuremangel","hypochrom: Eisenmangel, Thalassämie"],
  ["Leukozyten","4.000–10.000 /µl","bakt. Infektion, Entzündung, Leukämie, Stress, Kortison, Herzinfarkt","Virusinfekt, Typhus, Agranulozytose, Knochenmarkschädigung, Zytostatika, SLE"],
  ["Thrombozyten","150.000–400.000 /µl","reaktiv (Entzündung, Blutung, Eisenmangel), ess. Thrombozythämie, CML","ITP, DIC, Leukämie, Hypersplenismus, Heparin (HIT), Leberzirrhose"],
  ["Retikulozyten","0,5–2 % (5–20 ‰)","Hämolyse, nach Blutung, Therapie eines Mangels","aplastische Anämie, B12-/Eisenmangel unbehandelt, Niereninsuffizienz"],
  ["Lymphozyten","20–40 %","Virusinfekte, CLL, Pertussis, Tbc","HIV, Kortison, Hodgkin, Immunsuppression"],
  ["Eosinophile","1–4 %","Allergie, Asthma, Wurmbefall, Neurodermitis, Morbus Addison","Kortison, Cushing, Typhus, akuter Stress"]
 ]},
 {g:"Entzündung", r:[
  ["CRP","< 5 mg/l","bakterielle Infektion (stark), Entzündung, Trauma, Herzinfarkt, Tumor","–"],
  ["BSG (Blutsenkung)","♀ < 20 mm/h • ♂ < 15 mm/h (1. Std.)","Entzündung, Tumor, Plasmozytom (Sturzsenkung), Riesenzellarteriitis, Anämie, Schwangerschaft","Polyglobulie, Sichelzellanämie"],
  ["Procalcitonin (PCT)","< 0,5 ng/ml","bakterielle Sepsis","–"]
 ]},
 {g:"Niere & Elektrolyte", r:[
  ["Kreatinin","♀ 0,5–0,9 mg/dl • ♂ 0,7–1,2 mg/dl","Niereninsuffizienz (erst ab ~50 % GFR-Verlust!), Muskelmasse ↑, Exsikkose","geringe Muskelmasse, Schwangerschaft"],
  ["GFR (eGFR)","> 90 ml/min/1,73 m²","Schwangerschaft, früher Diabetes (Hyperfiltration)","Niereninsuffizienz (Stadien G1–G5)"],
  ["Harnstoff","10–50 mg/dl","Niereninsuffizienz, Exsikkose, GI-Blutung, Eiweißzufuhr","Leberinsuffizienz, eiweißarme Kost"],
  ["Harnsäure","♀ 2,4–5,7 mg/dl • ♂ 3,4–7,0 mg/dl","Gicht, Zellzerfall (Tumor, Chemo), Niereninsuffizienz, Alkohol, Diuretika","–"],
  ["Natrium","135–145 mmol/l","Exsikkose, Diabetes insipidus, Conn","SIADH, Diuretika, Herz-/Leberinsuffizienz, Addison, Erbrechen, Polydipsie"],
  ["Kalium","3,5–5,0 mmol/l","Niereninsuffizienz, Addison, Azidose, Hämolyse, ACE-Hemmer, kaliumsparende Diuretika","Diuretika, Erbrechen/Durchfall, Conn, Cushing, Insulin, Laxantien"],
  ["Calcium (gesamt)","2,2–2,65 mmol/l","prim. Hyperparathyreoidismus, Tumor/Knochenmetastasen, Sarkoidose, Vit.-D-Überdosis","Hypoparathyreoidismus, Vit.-D-Mangel, Niereninsuffizienz, Pankreatitis"],
  ["Phosphat","0,8–1,5 mmol/l","Niereninsuffizienz, Hypoparathyreoidismus","prim. Hyperparathyreoidismus, Vit.-D-Mangel"]
 ]},
 {g:"Leber, Galle, Pankreas", r:[
  ["GPT (ALT)","♀ < 35 U/l • ♂ < 50 U/l","Hepatitis (stark, GPT > GOT), Fettleber, Medikamente","–"],
  ["GOT (AST)","♀ < 35 U/l • ♂ < 50 U/l","Leberzellschaden (GOT > GPT → Alkohol, Zirrhose), Herzinfarkt, Muskelschaden","–"],
  ["γ-GT","♀ < 40 U/l • ♂ < 60 U/l","Alkohol, Cholestase, Fettleber, Medikamente (Enzyminduktion)","–"],
  ["Alkalische Phosphatase (AP)","40–130 U/l","Cholestase, Knochenumbau (M. Paget, Metastasen, Wachstum), Schwangerschaft","–"],
  ["Bilirubin gesamt","< 1,1 mg/dl (Ikterus ab ~2 mg/dl)","Hämolyse (indirekt), Hepatitis/Zirrhose, Verschluss (direkt), M. Meulengracht","–"],
  ["Albumin","3,5–5,0 g/dl","Exsikkose","Leberzirrhose, nephrotisches Syndrom, Mangelernährung, Entzündung"],
  ["Quick (INR)","Quick 70–120 % • INR ~1,0","INR ↑ / Quick ↓: Marcumar, Vit.-K-Mangel, Leberinsuffizienz, DIC","–"],
  ["Lipase","< 60 U/l","akute Pankreatitis (≥ 3-fach), Pankreaskarzinom, Niereninsuffizienz","–"],
  ["Amylase","< 100 U/l","Pankreatitis, Parotitis (Mumps), Niereninsuffizienz","–"],
  ["Ammoniak","< 50 µg/dl","hepatische Enzephalopathie, Leberkoma","–"]
 ]},
 {g:"Herz & Muskel", r:[
  ["Troponin T/I (hs)","laborabhängig, sehr niedrig","Herzinfarkt (ab ~3 Std., bis 2 Wo.), Myokarditis, Lungenembolie, Niereninsuffizienz","–"],
  ["CK / CK-MB","CK ♀ < 170 U/l • ♂ < 190 U/l","Herzinfarkt (CK-MB > 6 %), Muskeltrauma, Sport, i.m.-Spritze, Rhabdomyolyse, Statine","–"],
  ["NT-proBNP","< 125 pg/ml (alters­abhängig)","Herzinsuffizienz, Lungenembolie, Niereninsuffizienz","–"],
  ["D-Dimere","< 0,5 mg/l","Thrombose, Lungenembolie, DIC, Aortendissektion, OP, Schwangerschaft, Tumor (negativer Wert schließt Thrombose weitgehend aus)","–"],
  ["LDH","< 250 U/l","Hämolyse, Herzinfarkt (spät), Lymphom/Tumor, Lungenembolie, Mononukleose","–"]
 ]},
 {g:"Stoffwechsel & Hormone", r:[
  ["Glukose nüchtern","70–99 mg/dl (100–125 = gestörte Nüchternglukose)","Diabetes mellitus (≥ 126 mg/dl), Cushing, Stress, Kortison","Hypoglykämie (< 50 mg/dl), Insulinom, Addison, Alkohol"],
  ["HbA1c","< 5,7 % (Diabetes ≥ 6,5 %)","Diabetes (Langzeitwert ~8–12 Wochen)","Hämolyse, Blutverlust"],
  ["TSH","0,4–4,0 mU/l","Hypothyreose (primär), Hashimoto","Hyperthyreose (Basedow, Autonomie), Überdosierung L-Thyroxin"],
  ["fT4 / fT3","fT4 0,9–1,7 ng/dl • fT3 2,0–4,4 pg/ml","Hyperthyreose","Hypothyreose"],
  ["Gesamtcholesterin","< 200 mg/dl","Hypercholesterinämie, Hypothyreose, nephrot. Syndrom, Cholestase","Hyperthyreose, Mangelernährung, Leberinsuffizienz"],
  ["LDL / HDL","LDL < 116 (Risiko-abhängig) • HDL > 40 mg/dl","LDL ↑: Atheroskleroserisiko","HDL ↓: Atheroskleroserisiko"],
  ["Triglyzeride","< 150 mg/dl","Diabetes, Alkohol, Adipositas, Pankreatitis-Risiko (> 1000)","–"],
  ["Ferritin","♀ 15–150 µg/l • ♂ 30–400 µg/l","Hämochromatose, Entzündung (Akute-Phase-Protein), Tumor, Lebererkrankung","Eisenmangel (sensitivster Marker)"],
  ["Vitamin B12","200–900 pg/ml","–","perniziöse Anämie, Veganer, Magen-OP, M. Crohn (terminales Ileum), Metformin"],
  ["Kortisol (morgens)","5–25 µg/dl","Cushing, Stress, Kortisoneinnahme (exogen: Kortisol ↓!)","Addison, Hypophyseninsuffizienz"]
 ]},
 {g:"Urin", r:[
  ["Urin-Stix Leukozyten/Nitrit","negativ","Harnwegsinfekt (Nitrit + = gramnegative Bakterien)","–"],
  ["Urin-Stix Eiweiß","negativ (< 150 mg/24 h)","Glomerulonephritis, nephrot. Syndrom (> 3,5 g/24 h), diab. Nephropathie (Mikroalbuminurie 30–300 mg/24 h), Fieber","–"],
  ["Urin-Stix Blut","negativ","Nierenstein, Tumor, Glomerulonephritis, HWI, Menstruation; Myoglobin/Hämoglobin","–"],
  ["Urin-Glukose","negativ","Diabetes (Nierenschwelle ~180 mg/dl), Schwangerschaft","–"],
  ["Urin-Ketone","negativ","diabetische Ketoazidose, Hunger, Alkohol, Erbrechen","–"]
 ]},
 {g:"Immunologie & Tumormarker", r:[
  ["Rheumafaktor","negativ","rheumatoide Arthritis (~70–80 %), Sjögren, auch gesunde Ältere","–"],
  ["Anti-CCP","negativ","rheumatoide Arthritis (hochspezifisch, früh)","–"],
  ["ANA","negativ (< 1:160)","SLE (~95 %), Sklerodermie, Sjögren, Mischkollagenose, Medikamente","–"],
  ["Anti-ds-DNA","negativ","Systemischer Lupus erythematodes (spezifisch)","–"],
  ["HLA-B27","negativ","M. Bechterew (~90 %), reaktive Arthritis, Uveitis","–"],
  ["PSA","< 4 ng/ml (altersabh.)","Prostatakarzinom, BPH, Prostatitis, nach Untersuchung/Radfahren","–"],
  ["CEA","< 5 ng/ml","kolorektales Karzinom (Verlaufsmarker), Raucher","–"],
  ["AFP","< 10 ng/ml","Leberzellkarzinom, Keimzelltumoren (Hoden), Schwangerschaft","–"],
  ["CA 19-9 / CA 125 / CA 15-3","laborabhängig","Pankreas-/Gallenkarzinom • Ovarialkarzinom • Mammakarzinom (Verlauf)","–"]
 ]}
];
