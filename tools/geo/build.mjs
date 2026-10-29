// Builds geo.js (offline world + US map data) for Classroom Tools
import fs from 'fs';
import * as topo from 'topojson-client';
import * as simp from 'topojson-simplify';
import * as d3 from 'd3-geo';
import {countries,continents} from 'countries-list';
import iso from 'i18n-iso-countries';
const R=s=>JSON.parse(fs.readFileSync(s));
const r1=s=>s.replace(/(\d+\.\d)\d+/g,'$1');
// WORLD (110m) on an equirectangular map 1000 x 500 (x = longitude, y = latitude)
const w=R('node_modules/world-atlas/countries-110m.json');
const proj=d3.geoEquirectangular().scale(1000/(2*Math.PI)).translate([500,250]);
const path=d3.geoPath(proj);
const W=[];const GEOMS=w.objects.countries.geometries,NB=topo.neighbors(GEOMS);const idOf=g=>g.properties.name==='Kosovo'?'XK':(iso.numericToAlpha2(g.id)||('X'+g.id));
for(const [gi,f] of topo.feature(w,w.objects.countries).features.entries()){
  const a2=f.properties.name==='Kosovo'?'XK':iso.numericToAlpha2(f.id);const c=a2==='XK'?{name:'Kosovo',capital:'Pristina',continent:'EU'}:a2&&countries[a2];
  const name=c?c.name:f.properties.name;if(!f.geometry)continue;
  const p=r1(path(f));const [lon,lat]=d3.geoCentroid(f);
  W.push({id:a2||('X'+f.id),n:name,cap:c?c.capital:'',ct:c?c.continent:'',p,c:[+lon.toFixed(1),+lat.toFixed(1)],nb:NB[gi].map(j=>idOf(GEOMS[j]))});
}
// fix a few names to the short names kids know
const NM={US:'United States',GB:'United Kingdom',RU:'Russia',KR:'South Korea',KP:'North Korea',CD:'DR Congo',CG:'Republic of the Congo',CZ:'Czechia',IR:'Iran',SY:'Syria',VN:'Vietnam',LA:'Laos',BO:'Bolivia',VE:'Venezuela',TZ:'Tanzania',MD:'Moldova',BN:'Brunei'};
W.forEach(c=>{if(NM[c.id])c.n=NM[c.id]});const CAPFIX={SZ:'Mbabane',MN:'Ulaanbaatar'};W.forEach(c=>{if(CAPFIX[c.id])c.cap=CAPFIX[c.id]});
// US STATES (already projected, Albers 975 x 610)
let us=R('node_modules/us-atlas/states-albers-10m.json');us=simp.presimplify(us);us=simp.simplify(us,0.5);
const sp=d3.geoPath();const FIPS={'01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY','72':'PR'};
const CAP={AL:'Montgomery',AK:'Juneau',AZ:'Phoenix',AR:'Little Rock',CA:'Sacramento',CO:'Denver',CT:'Hartford',DE:'Dover',FL:'Tallahassee',GA:'Atlanta',HI:'Honolulu',ID:'Boise',IL:'Springfield',IN:'Indianapolis',IA:'Des Moines',KS:'Topeka',KY:'Frankfort',LA:'Baton Rouge',ME:'Augusta',MD:'Annapolis',MA:'Boston',MI:'Lansing',MN:'Saint Paul',MS:'Jackson',MO:'Jefferson City',MT:'Helena',NE:'Lincoln',NV:'Carson City',NH:'Concord',NJ:'Trenton',NM:'Santa Fe',NY:'Albany',NC:'Raleigh',ND:'Bismarck',OH:'Columbus',OK:'Oklahoma City',OR:'Salem',PA:'Harrisburg',RI:'Providence',SC:'Columbia',SD:'Pierre',TN:'Nashville',TX:'Austin',UT:'Salt Lake City',VT:'Montpelier',VA:'Richmond',WA:'Olympia',WV:'Charleston',WI:'Madison',WY:'Cheyenne'};
const S=[];
for(const f of topo.feature(us,us.objects.states).features){const ab=FIPS[f.id];if(!ab||ab==='DC'||ab==='PR')continue;const b=sp.bounds(f),cen=sp.centroid(f);S.push({id:ab,n:f.properties.name,cap:CAP[ab],p:r1(sp(f)),c:[Math.round(cen[0]),Math.round(cen[1])],b:b.flat().map(Math.round)})}
// LAND outline for coordinate/navigation games
const land=R('node_modules/world-atlas/land-110m.json');const LAND=r1(path(topo.feature(land,land.objects.land)));
const CT=Object.fromEntries(Object.entries(continents));
const js=`/* Classroom Tools offline map data - Davis Tech Support
   World countries: Natural Earth via world-atlas (public domain), 1:110m, equirectangular 1000x500 (x=(lon+180)/360*1000, y=(90-lat)/180*500).
   US states: US Census via us-atlas (public domain), Albers 975x610. Country facts: countries-list (MIT). */
const GEO={W:${JSON.stringify(W)},S:${JSON.stringify(S)},LAND:${JSON.stringify(LAND)},CT:${JSON.stringify(CT)},
 OK:c=>!!(c.cap&&c.ct&&c.ct!=='AN'&&!['EH','FK','TF','NC','PR','GL'].includes(c.id)), // countries used in quizzes (not territories)
 xy:(lon,lat)=>[(lon+180)/360*1000,(90-lat)/180*500],ll:(x,y)=>[x/1000*360-180,90-y/500*180]};
`;
fs.writeFileSync('geo.js',js+fs.readFileSync('mapjs.txt','utf8'));console.log('world',W.length,'states',S.length,'bytes',js.length);
// SHAPES: well-known countries at 1:50m, each scaled to fit a 200x200 box (for the shape guessing game)
const w50raw=R('node_modules/world-atlas/countries-50m.json');const RAW=Object.fromEntries(topo.feature(w50raw,w50raw.objects.countries).features.map(f=>[f.id,f.geometry]));let w50=R('node_modules/world-atlas/countries-50m.json');w50=simp.presimplify(w50,simp.sphericalTriangleArea);w50=simp.simplify(w50,2e-6);
const PICK='US CA MX BR AR CL PE CO VE CU GB IE FR ES PT IT DE PL NO SE FI IS GR TR UA RU EG MA NG ZA KE ET MG SA IR IQ IN PK CN JP KR VN TH ID PH AU NZ PG MN KZ AF NP LK SO TZ DZ LY SD CD AO NA BW MZ ZW TN JM HT NL CH AT BE DK CZ HU RO BG RS HR'.split(' ');
const SH={};
for(const f of topo.feature(w50,w50.objects.countries).features){const a2=iso.numericToAlpha2(f.id);if(!PICK.includes(a2))continue;
 // drop far-away islands so the main shape is big and clear (keep polygons near the biggest one)
 let g=f.geometry;if(a2==='AU')g=topo.feature(w,w.objects.countries).features.find(q=>q.id===f.id).geometry;if(g.type==='MultiPolygon'){const polys=g.coordinates.map(c=>({c,a:d3.geoArea({type:'Polygon',coordinates:c})})).filter(p=>p.a>0&&p.a<2*Math.PI);const big=polys.sort((a,b)=>b.a-a.a)[0];const bc=d3.geoCentroid({type:'Polygon',coordinates:big.c});
  const keep=polys.filter(p=>p.a>big.a*.01&&d3.geoDistance(bc,d3.geoCentroid({type:'Polygon',coordinates:p.c}))<(a2==='US'?.5:a2==='NO'?.15:.35));g={type:'MultiPolygon',coordinates:keep.map(p=>p.c)}}
 if(g.type==='Polygon'&&d3.geoArea(g)>2*Math.PI)continue;const ff={type:'Feature',geometry:g};const pr=(a2==='RU'?d3.geoConicEqualArea().parallels([50,70]).rotate([-100,0]):d3.geoMercator()).fitExtent([[6,6],[194,194]],ff);SH[a2]=r1(d3.geoPath(pr)(ff))}
const js2=fs.readFileSync('geo.js','utf8').replace('const GEO={','const GEO={SH:'+JSON.stringify(SH)+',');fs.writeFileSync('geo.js',js2);console.log('shapes',Object.keys(SH).length,'bytes',js2.length);
