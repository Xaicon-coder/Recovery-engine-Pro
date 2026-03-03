import React, { useState, useEffect, useRef } from 'react';

const fmtSpeed = b => !b ? '' : b>=1e6 ? (b/1e6).toFixed(1)+' MB/s' : (b/1e3).toFixed(0)+' KB/s';

// Pioggia matrix leggera come sfondo
function MatrixRain() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const setup = () => {
      c.width  = c.offsetWidth  * devicePixelRatio;
      c.height = c.offsetHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    };
    setup(); window.addEventListener('resize', setup);
    const CHARS = '01アイウエカキク█▓▒░▀▄';
    const cols  = Math.floor((c.offsetWidth||400) / 16);
    const drops = Array.from({length: cols}, () => Math.random() * -50);
    let frame;
    const draw = () => {
      const W=c.offsetWidth, H=c.offsetHeight;
      ctx.fillStyle='rgba(0,10,3,.18)'; ctx.fillRect(0,0,W,H);
      ctx.font='10px "Share Tech Mono",monospace';
      drops.forEach((y,i) => {
        const ch=CHARS[Math.floor(Math.random()*CHARS.length)], x=i*16;
        ctx.fillStyle=`rgba(0,255,65,${0.6+Math.random()*0.35})`;
        ctx.fillText(ch, x, y*16);
        for(let t=1;t<5;t++){
          if((y-t)*16<0) continue;
          ctx.fillStyle=`rgba(0,255,65,${Math.max(0,0.35-t*0.08)})`;
          ctx.fillText(CHARS[Math.floor(Math.random()*CHARS.length)], x, (y-t)*16);
        }
        if(y*16>H && Math.random()>.975) drops[i]=0; else drops[i]+=0.35;
      });
      frame=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(frame); window.removeEventListener('resize',setup); };
  },[]);
  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',opacity:.13}}/>;
}

// Anello di progresso SVG
function ProgressRing({ pct, size=110, col='var(--a0)' }) {
  const r=size/2-5, circ=2*Math.PI*r, dash=circ*(pct/100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,255,65,.05)" strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={6}
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        style={{transition:'stroke-dasharray .4s ease',filter:`drop-shadow(0 0 5px ${col})`}}/>
    </svg>
  );
}

function Changelog({ notes }) {
  const lines=(typeof notes==='string'?notes:String(notes)).split('\n').map(l=>l.trim()).filter(Boolean);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4,marginTop:8}}>
      {lines.map((l,i)=>(
        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8}}>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{flexShrink:0,marginTop:2}}>
            <path d="M1 4.5l2.2 2.2L8 1.5" stroke="var(--p0)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{fontSize:11,color:'var(--t1)',lineHeight:1.55}}>{l.replace(/^[•\-*]\s*/,'')}</span>
        </div>
      ))}
    </div>
  );
}

export default function Updates({ update, api, version, onBack }) {
  const [checking,setChecking]=useState(false);
  const ev=update?.event;
  const isChecking   = ev==='checking'||checking;
  const isDl         = ev==='downloading'||ev==='progress';
  const isReady      = ev==='ready';
  const isError      = ev==='error';
  const isNone       = ev==='none';
  const pct          = update?.pct??0;
  const speed        = update?.bps??0;

  const handleCheck = async () => {
    setChecking(true);
    try { await api?.updater?.check?.(); }
    finally { setTimeout(()=>setChecking(false),3000); }
  };

  const stKey = isChecking?'checking':isDl?'downloading':isReady?'ready':isError?'error':isNone?'none':'idle';
  const ST = {
    idle:       {col:'var(--t2)',  title:'Nessun aggiornamento in corso',       sub:'Controlla manualmente o attendi il controllo automatico ogni 6 ore.'},
    checking:   {col:'var(--p0)', title:'Verifica in corso…',                  sub:'Connessione ai server GitHub Releases.'},
    downloading:{col:'var(--a0)', title:`Download v${update?.version??''}…`,   sub:'Scaricamento automatico in background.'},
    ready:      {col:'var(--p0)', title:`v${update?.version??''} pronto!`,      sub:'Aggiornamento scaricato. Installa subito o alla chiusura.'},
    none:       {col:'var(--p0)', title:'Sei aggiornato!',                      sub:`Versione corrente: v${version??'—'} — nessun aggiornamento disponibile.`},
    error:      {col:'var(--r0)', title:'Errore durante il controllo',          sub:update?.message||'Controlla la connessione e riprova.'},
  };
  const st=ST[stKey];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',position:'relative'}}>
      <MatrixRain/>
      <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,255,65,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,.013) 1px,transparent 1px)',backgroundSize:'36px 36px',pointerEvents:'none'}}/>

      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'28px 24px',position:'relative',zIndex:1,overflowY:'auto'}}>

        {/* Header */}
        <div style={{width:'100%',maxWidth:640,marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <button onClick={onBack}
              style={{display:'flex',alignItems:'center',gap:6,fontFamily:'var(--mono)',fontSize:8,color:'var(--t2)',background:'transparent',border:'1px solid var(--b0)',padding:'4px 10px',borderRadius:4,cursor:'pointer',letterSpacing:'.1em'}}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M5 1L2 4l3 3"/></svg>
              TORNA
            </button>
            <div style={{flex:1,height:1,background:'linear-gradient(90deg,var(--b1),transparent)'}}/>
            <span style={{fontFamily:'var(--mono)',fontSize:7,color:'var(--t2)',letterSpacing:'.22em'}}>//&nbsp;SYSTEM.UPDATE</span>
          </div>
          <h1 style={{fontFamily:'var(--display)',fontSize:22,fontWeight:700,letterSpacing:'.06em',color:'var(--t0)',textShadow:'0 0 24px rgba(0,255,65,.14)'}}>
            AGGIORNAMENTI
          </h1>
        </div>

        {/* Card principale */}
        <div style={{width:'100%',maxWidth:640,background:'rgba(2,21,8,.9)',border:`1px solid ${st.col}22`,borderRadius:12,overflow:'hidden',backdropFilter:'blur(16px)',boxShadow:`0 0 40px ${st.col}08`}}>
          <div style={{height:2,background:`linear-gradient(90deg,transparent,${st.col},transparent)`,opacity:.65}}/>
          <div style={{padding:'26px 26px 22px'}}>

            {/* Status ring + testo */}
            <div style={{display:'flex',alignItems:'center',gap:22,marginBottom:22}}>
              <div style={{flexShrink:0,position:'relative',width:110,height:110}}>
                {isDl ? (
                  <>
                    <ProgressRing pct={pct}/>
                    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontFamily:'var(--display)',fontSize:22,fontWeight:700,color:'var(--a0)',textShadow:'0 0 10px var(--a-glow)'}}>{pct}%</span>
                      {speed>0&&<span style={{fontFamily:'var(--mono)',fontSize:7,color:'var(--t2)',marginTop:2}}>{fmtSpeed(speed)}</span>}
                    </div>
                  </>
                ) : (
                  <div style={{width:110,height:110,borderRadius:'50%',border:`2px solid ${st.col}30`,background:`${st.col}07`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {stKey==='checking' && <svg width="38" height="38" viewBox="0 0 38 38" fill="none" style={{animation:'spin 1.2s linear infinite'}}><circle cx="19" cy="19" r="16" stroke="var(--p0)" strokeWidth="3.5" strokeDasharray="55 22" strokeLinecap="round"/></svg>}
                    {(stKey==='ready'||stKey==='none') && <svg width="38" height="38" viewBox="0 0 38 38" fill="none"><path d="M5 20l9 9L33 8" stroke="var(--p0)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{filter:'drop-shadow(0 0 7px var(--p0))'}}/></svg>}
                    {stKey==='error' && <svg width="38" height="38" viewBox="0 0 38 38" fill="none"><path d="M19 4L34.5 33H3.5z" stroke="var(--r0)" strokeWidth="2.5" strokeLinejoin="round"/><line x1="19" y1="14" x2="19" y2="24" stroke="var(--r0)" strokeWidth="2.5" strokeLinecap="round"/><circle cx="19" cy="28" r="2" fill="var(--r0)"/></svg>}
                    {stKey==='idle' && <svg width="38" height="38" viewBox="0 0 38 38" fill="none"><circle cx="19" cy="19" r="15" stroke="var(--t2)" strokeWidth="2"/><path d="M19 11v9l5.5 3" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                )}
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--mono)',fontSize:7.5,letterSpacing:'.2em',color:st.col,marginBottom:6,textShadow:`0 0 7px ${st.col}`}}>{stKey.toUpperCase()}</div>
                <h2 style={{fontFamily:'var(--display)',fontSize:18,fontWeight:700,color:'var(--t0)',marginBottom:7,lineHeight:1.2}}>{st.title}</h2>
                <p style={{fontSize:11.5,color:'var(--t1)',lineHeight:1.65}}>{st.sub}</p>
                {isDl && (
                  <div style={{marginTop:11}}>
                    <div style={{height:3,background:'rgba(255,204,0,.07)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,var(--a1),var(--a0))',borderRadius:2,transition:'width .35s',position:'relative',overflow:'hidden'}}>
                        <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent)',animation:'shimmer 1.2s linear infinite'}}/>
                      </div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontFamily:'var(--mono)',fontSize:7.5,color:'var(--t2)'}}>
                      <span>v{update?.version}</span><span>{speed>0?fmtSpeed(speed):''}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Changelog */}
            {(isReady||isDl) && update?.notes && (
              <div style={{background:'rgba(0,0,0,.22)',border:'1px solid var(--b0)',borderRadius:8,padding:'13px 15px',marginBottom:18}}>
                <div style={{fontFamily:'var(--mono)',fontSize:7.5,letterSpacing:'.18em',color:'var(--t2)',marginBottom:6}}>//&nbsp;CHANGELOG v{update.version}</div>
                <Changelog notes={update.notes}/>
              </div>
            )}

            {/* Info grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginBottom:18}}>
              {[
                {l:'VERSIONE CORRENTE', v:version?`v${version}`:'—'},
                {l:'ULTIMA VERSIONE',   v:update?.version?`v${update.version}`:isNone?`v${version}`:'—'},
                {l:'CANALE',            v:'STABLE / GITHUB'},
              ].map(({l,v})=>(
                <div key={l} style={{background:'rgba(0,0,0,.2)',border:'1px solid var(--b0)',borderRadius:7,padding:'10px 12px'}}>
                  <div style={{fontFamily:'var(--mono)',fontSize:7,color:'var(--t2)',letterSpacing:'.1em',marginBottom:4}}>{l}</div>
                  <div style={{fontFamily:'var(--display)',fontSize:13,fontWeight:700,color:'var(--t0)'}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Note auto-update */}
            <div style={{display:'flex',gap:9,padding:'9px 12px',background:'rgba(0,255,65,.028)',border:'1px solid var(--b0)',borderRadius:7,marginBottom:18}}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--p2)" strokeWidth="1.2" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}>
                <circle cx="6.5" cy="6.5" r="5.5"/><line x1="6.5" y1="4" x2="6.5" y2="7"/><circle cx="6.5" cy="9" r=".7" fill="var(--p2)"/>
              </svg>
              <p style={{fontSize:10.5,color:'var(--t2)',lineHeight:1.6}}>
                Download <strong style={{color:'var(--t1)'}}>automatico in background</strong> — installazione alla chiusura dell'app.
                Puoi anche forzare l'installazione subito.
              </p>
            </div>

            {/* CTA */}
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {!isReady && !isDl && (
                <button onClick={handleCheck} disabled={isChecking}
                  style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',background:'rgba(0,255,65,.06)',border:'1px solid var(--b1)',borderRadius:6,color:'var(--p0)',fontFamily:'var(--display)',fontWeight:600,fontSize:12,letterSpacing:'.08em',cursor:isChecking?'not-allowed':'pointer',opacity:isChecking?.6:1,transition:'all .14s'}}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" style={{animation:isChecking?'spin 1s linear infinite':'none'}}>
                    <path d="M11.5 6.5A5 5 0 106.5 11.5"/><path d="M11.5 3v3.5H8"/>
                  </svg>
                  {isChecking?'VERIFICA...':'CONTROLLA AGGIORNAMENTI'}
                </button>
              )}
              {isReady && (
                <button onClick={()=>api?.updater?.install?.()}
                  style={{display:'flex',alignItems:'center',gap:8,padding:'10px 24px',background:'var(--p0)',color:'#000',borderRadius:6,fontFamily:'var(--display)',fontWeight:700,fontSize:12,letterSpacing:'.1em',cursor:'pointer',boxShadow:'0 0 22px var(--p-glow)',border:'none'}}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M6.5 1v8M3 6l3.5 3.5L10 6M1 12h11"/>
                  </svg>
                  INSTALLA E RIAVVIA
                </button>
              )}
              {isDl && (
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',background:'rgba(255,204,0,.06)',border:'1px solid rgba(255,204,0,.2)',borderRadius:6}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{animation:'spin .9s linear infinite'}}>
                    <circle cx="6" cy="6" r="5" stroke="var(--a0)" strokeWidth="1.5" strokeDasharray="18 8" strokeLinecap="round"/>
                  </svg>
                  <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--a0)',letterSpacing:'.1em'}}>DOWNLOAD IN CORSO {pct}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(300%)}}"}</style>
    </div>
  );
}
