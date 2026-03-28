import { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001');
const ROOM_ID = 'general';

const INIT_MSGS = [
  { id:1, user:'야구광123', av:'⚾', msg:'임찬규 오늘 진짜 레전드!', time:'19:24', pro:false },
  { id:2, user:'홈런왕', av:'🏠', msg:'8이닝 87구 ERA 2.84 ㄷㄷ', time:'19:25', pro:true },
  { id:3, user:'직관러', av:'🎫', msg:'잠실 분위기 폭발!!!', time:'19:25', pro:false },
];

const BAD_WORDS = ['시발','씨발','병신','ㅅㅂ','ㅂㅅ','개새끼','지랄','닥쳐'];

function hasBadWord(text) {
  return BAD_WORDS.some(w => text.toLowerCase().includes(w));
}

function Diamond({ bases }) {
  return (
    <div style={{ position:'relative', width:78, height:78, flexShrink:0 }}>
      <svg width="78" height="78" style={{ position:'absolute', top:0, left:0 }}>
        <line x1="39" y1="6" x2="6" y2="39" stroke="#243550" strokeWidth="1.5"/>
        <line x1="39" y1="6" x2="72" y2="39" stroke="#243550" strokeWidth="1.5"/>
        <line x1="6" y1="39" x2="39" y2="72" stroke="#243550" strokeWidth="1.5"/>
        <line x1="72" y1="39" x2="39" y2="72" stroke="#243550" strokeWidth="1.5"/>
      </svg>
      {[
        { key:'second', l:30, t:0 },
        { key:'third',  l:0,  t:30 },
        { key:'first',  l:60, t:30 },
      ].map(({ key, l, t }) => (
        <div key={key} style={{
          position:'absolute', left:l, top:t,
          width:18, height:18,
          transform:'rotate(45deg)',
          border: `2px solid ${bases[key] ? '#f59e0b' : '#243550'}`,
          background: bases[key] ? '#f59e0b88' : 'transparent',
          transition:'all 0.3s',
        }} />
      ))}
      <div style={{
        position:'absolute', left:30, bottom:0,
        width:18, height:18, transform:'rotate(45deg)',
        border:'2px solid #243550', background:'transparent',
      }} />
    </div>
  );
}function Live({ user }) {
  const [msgs, setMsgs] = useState(INIT_MSGS);
  const [input, setInput] = useState('');
  const [warning, setWarning] = useState(false);
  const [myVote, setMyVote] = useState(null);
  const [votes, setVotes] = useState({ hit:62, out:38 });
  const bottomRef = useRef(null);
  // 소켓 연결
useEffect(() => {
  socket.emit('join', ROOM_ID);

  socket.on('chat_history', (history) => {
    const formatted = history.map(m => ({
      id: m.id,
      user: m.user?.name || '익명',
      av: '⚾',
      msg: m.message,
      time: new Date(m.createdAt).toLocaleTimeString('ko', { hour:'2-digit', minute:'2-digit' }),
      pro: false,
    }));
    setMsgs(formatted);
  });

  socket.on('receive_message', (data) => {
    setMsgs(prev => [...prev, {
      id: data.id,
      user: data.userName,
      av: '⚾',
      msg: data.message,
      time: new Date(data.createdAt).toLocaleTimeString('ko', { hour:'2-digit', minute:'2-digit' }),
      pro: false,
    }]);
  });

  return () => {
    socket.off('chat_history');
    socket.off('receive_message');
  };
}, []);

  const gs = {
    inning:8, half:'말', outs:1,
    awayScore:3, homeScore:5, away:'KIA', home:'LG',
    bases:{ first:true, second:false, third:true },
    pitcher:{ name:'임찬규', hand:'좌', era:'2.84', pitches:87 },
    batter:{ name:'박찬호', hand:'우', avg:'.312', hr:8 },
    count:{ balls:2, strikes:1 },
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [msgs]);

const sendMsg = () => {
  if (!input.trim()) return;
  if (hasBadWord(input)) { setWarning(true); return; }
socket.emit('send_message', {
  message: input,
  userId: user?.id || null,
  userName: user?.nickname || user?.name || '익명',
  roomId: ROOM_ID,
});
  setInput('');
  setWarning(false);
};

  const vote = (side) => {
    if (myVote) return;
    setMyVote(side);
    setVotes(prev => ({ ...prev, [side]: prev[side] + 1 }));
  };

  const total = votes.hit + votes.out;

  return (
    <div style={{ display:'flex', flexDirection:'column', paddingBottom:80 }}>
      <div style={{ background:'#0d1220', padding:'12px 16px', borderBottom:'1px solid #1e2d45' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:2 }}>{gs.away}</div>
            <div style={{ fontSize:32, fontWeight:900, color:'#e2e8f0' }}>{gs.awayScore}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:9, color:'#ef4444', fontWeight:700 }}>● LIVE</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:3 }}>{gs.inning}회 {gs.half}</div>
            <div style={{ fontSize:10, color:'#64748b' }}>{gs.outs}아웃 · {gs.count.balls}B {gs.count.strikes}S</div>
          </div>
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:2 }}>{gs.home}</div>
            <div style={{ fontSize:32, fontWeight:900, color:'#e2e8f0' }}>{gs.homeScore}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <Diamond bases={gs.bases} />
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
            {[
              { label:`투수 (${gs.pitcher.hand}완)`, name:gs.pitcher.name, stats:`${gs.pitcher.pitches}구 · ERA ${gs.pitcher.era}` },
              { label:`타자 (${gs.batter.hand}타)`, name:gs.batter.name, stats:`타율 ${gs.batter.avg} · ${gs.batter.hr}홈런` },
            ].map(({ label, name, stats }) => (
              <div key={name} style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:8, padding:'7px 10px' }}>
                <div style={{ fontSize:9, color:'#64748b', letterSpacing:1, marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>{name}</div>
                <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>{stats}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, color:'#64748b', marginBottom:6, textAlign:'center' }}>이번 타석 예측</div>
          <div style={{ display:'flex', gap:6 }}>
            {[['hit','안타/출루 🎯','#10b981'],['out','아웃 💨','#ef4444']].map(([key,label,color]) => (
              <button key={key} onClick={() => vote(key)} style={{
                flex:1, padding:'8px', borderRadius:8,
                border:`1px solid ${myVote===key ? color+'88' : '#1e2d45'}`,
                background: myVote===key ? color+'22' : 'transparent',
                color: myVote===key ? color : '#64748b',
                fontSize:12, fontWeight:700, cursor: myVote ? 'default' : 'pointer',
              }}>
                {label}{myVote && ` ${Math.round((key==='hit'?votes.hit:votes.out)/total*100)}%`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:'10px 14px', minHeight:140 }}>
        {msgs.slice(-6).map((m,i,arr) => {
          const sh = i===0 || arr[i-1].user !== m.user;
          return (
            <div key={m.id} style={{ marginBottom: sh ? 10 : 3 }}>
              {sh && (
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:'#1e2d45', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>{m.av}</div>
                  <span style={{ fontSize:12, fontWeight:700, color: m.pro ? '#f59e0b' : '#e2e8f0' }}>{m.user}</span>
                  {m.pro && <span style={{ fontSize:9, color:'#f59e0b', border:'1px solid #f59e0b55', borderRadius:3, padding:'1px 4px' }}>PRO</span>}
                  <span style={{ fontSize:10, color:'#64748b' }}>{m.time}</span>
                </div>
              )}
              <div style={{ paddingLeft:31 }}>
                <div style={{ display:'inline-block', background:'#0d1220', border:'1px solid #1e2d45', borderRadius:'3px 10px 10px 10px', padding:'6px 10px', fontSize:13, color:'#e2e8f0', maxWidth:'88%' }}>{m.msg}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding:'5px 12px', display:'flex', gap:5, overflowX:'auto', borderTop:'1px solid #1e2d45' }}>
        {['🔥','👏','😱','💪','⚾','🏆','😭'].map(r => (
          <button key={r} onClick={() => {
            const now = new Date();
            setMsgs(prev => [...prev, { id:Date.now(), user:'나', av:'😎', msg:r, time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`, pro:false }]);
          }} style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, padding:'3px 8px', fontSize:14, cursor:'pointer', flexShrink:0 }}>{r}</button>
        ))}
      </div>

      <div style={{ padding:'7px 12px 12px', borderTop:'1px solid #1e2d45' }}>
        {warning && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 10px', marginBottom:7, background:'#ef444418', border:'1px solid #ef444444', borderRadius:8 }}>
            <span>⚠️</span>
            <span style={{ fontSize:11, color:'#ef4444', fontWeight:700 }}>욕설·비하 표현은 사용 금지입니다</span>
          </div>
        )}
        <div style={{ display:'flex', gap:7 }}>
          <input value={input} onChange={e => { setInput(e.target.value); if(warning) setWarning(false); }} onKeyDown={e => e.key==='Enter' && sendMsg()} placeholder="채팅 입력..." style={{ flex:1, background: warning?'#ef444411':'#0d1220', border:`1px solid ${warning?'#ef444466':'#243550'}`, borderRadius:10, padding:'9px 12px', color:'#e2e8f0', fontSize:13, outline:'none' }} />
          <button onClick={sendMsg} style={{ background:'#3b82f6', border:'none', borderRadius:10, padding:'9px 15px', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>전송</button>
        </div>
      </div>

    </div>
  );
}

export default Live;