export const TSI_WEIGHTS=Object.freeze({biblical_specificity:25,baseline_departure:20,structural_readiness:20,acceleration_trend:15,global_reach:10,cross_domain_convergence:10});
export const TSI_BANDS=Object.freeze([{min:0,max:19,label:'Baseline'},{min:20,max:39,label:'Observable'},{min:40,max:59,label:'Developing'},{min:60,max:79,label:'Converging'},{min:80,max:100,label:'Advanced Convergence'}]);
export const SPECIFICITY_CAP=Object.freeze({0:19,1:39,2:59,3:79,4:100});
export const NOT_SCORABLE='NOT YET SCORABLE / METHODOLOGY INCOMPLETE';
const KEYS=Object.keys(TSI_WEIGHTS);
const validScore=v=>Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=4;
export function scoreBand(score){if(!Number.isFinite(score))return null;return TSI_BANDS.find(b=>score>=b.min&&score<=b.max)?.label??null}
export function evidenceGate(input={}){const d=input.dimensions||{};const missing=KEYS.filter(k=>!validScore(d[k]));const sourceCount=Array.isArray(input.sources)?input.sources.filter(Boolean).length:0;const hasBaseline=Boolean(input.baseline_period||input.baselinePeriod);const hasMeasurement=Boolean(input.measurement_date||input.measurementDate);const reasons=[];if(missing.length)reasons.push(`missing dimensions: ${missing.join(', ')}`);if(sourceCount<2)reasons.push('fewer than two defensible sources');if(!hasBaseline)reasons.push('baseline period not documented');if(!hasMeasurement)reasons.push('measurement date not documented');return{pass:reasons.length===0,reasons,sourceCount,missing}}
export function calculateDomain(input={}){const gate=evidenceGate(input);if(!gate.pass)return{scorable:false,status:NOT_SCORABLE,score:null,raw_score:null,cap:null,confidence:input.confidence||'LOW',gate};const d=input.dimensions;let raw=0;for(const k of KEYS)raw+=(Number(d[k])/4)*TSI_WEIGHTS[k];raw=Math.round(raw*10)/10;const specificity=Math.round(Number(d.biblical_specificity));const cap=SPECIFICITY_CAP[specificity];const score=Math.min(raw,cap);return{scorable:true,score,raw_score:raw,cap,status:scoreBand(score),confidence:(input.confidence||'MODERATE').toUpperCase(),gate,dimensions:{...d}}}
export function calculateComposite(input={}){const sub=Array.isArray(input.subindices)?input.subindices:[];if(!sub.length)return{scorable:false,status:NOT_SCORABLE,score:null,reasons:['no sub-indices supplied']};const results=sub.map(s=>({...s,result:s.result||calculateDomain(s)}));const failed=results.filter(x=>!x.result.scorable);if(failed.length)return{scorable:false,status:NOT_SCORABLE,score:null,reasons:failed.map(x=>`${x.name||'sub-index'} not scorable`),subindices:results};const totalWeight=results.reduce((n,x)=>n+Number(x.weight||0),0);if(totalWeight<=0)return{scorable:false,status:NOT_SCORABLE,score:null,reasons:['sub-index weights missing']};const score=Math.round(results.reduce((n,x)=>n+x.result.score*Number(x.weight||0),0)/totalWeight*10)/10;return{scorable:true,score,status:scoreBand(score),confidence:input.confidence||'MODERATE',subindices:results}}
export const DOMAIN_CONFIG=Object.freeze([
{id:'peace_safety',name:'Peace & Safety'},
{id:'global_governance',name:'Global Governance'},
{id:'global_financial',name:'Global Financial & Commerce'},
{id:'religious_convergence',name:'Religious Convergence & Deception',subindices:['Interfaith Institutional Integration','Cross-Religious Authority / Governance','Compelled / State-Supported Religious Conformity','Global Reach & Structural Permanence']},
{id:'israel_jerusalem',name:'Israel & Jerusalem',subindices:['Jerusalem Status & Centrality','Israel–Regional Peace / Normalization','Israel–Regional Conflict / Alignment','International Israel/Jerusalem Focus']},
{id:'war_conflict',name:'War, Conflict & Geopolitical Alignment'},
{id:'persecution_apostasy',name:'Persecution, Apostasy & Lawlessness',subindices:[{name:'Persecution / Restriction',weight:40},{name:'Apostasy / Falling Away',weight:30},{name:'Lawlessness / Social-Moral Disorder',weight:30}]},
{id:'signs_heaven_earth',name:'Signs in Heaven & Earth'},
{id:'gospel_nations',name:'Gospel to the Nations'}
]);
