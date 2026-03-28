import { useState, useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
const socket = io(SERVER);

const BAD_WORDS = ['시발','씨발','병신','ㅅㅂ','ㅂㅅ','개새끼','지랄','닥쳐'];
function hasBadWord(text) {
  return BAD_WORDS.some(w => text.toLowerCase().includes(w));
}

function Diamond({ bases = {} }) {
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
          width:18, height:18, transform:'rotate(45deg)',
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
}

// 오늘 경기 목록 (경기 없을 때 표시)
function GameList({ games, onSelect }) {
  if (!games.length) return (
    <div style={{ padding:'60px 20px', textAlign:'center', color:'#64748b' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>⚾</div>
      <div style={{ fontSize:15, fontWeight:700, color:'#e2e8f0', marginBottom:6 }}>오늘은 경기가 없어요</div>
      <div style={{ fontSize:12 }}>다음 경기 일정을 확인해보세요</div>
    </div>
  );
  return (
    <div style={{ padding:'16px' }}>
      <div style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:2, marginBottom:12 }}>오늘의 경기</div>
      {games.map(g => (
        <div key={g.gameId} onClick={() => onSelect(g)}
          style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:14, padding:'14px 16px', marginBottom:10, cursor:'pointer' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontSize:11, color:'#475569', marginBottom:3 }}>원정</div>
              <div style={{ fontSize:18, fontWeight:900, color:'#e2e8f0' }}>{g.awayTeam}</div>
              {g.awayScore != null && <div style={{ fontSize:26, fontWeight:900, color:'#e2e8f0' }}>{g.awayScore}</div>}
            </div>
            <div style={{ textAlign:'center', minWidth:80 }}>
              {g.state === 'LIVE' || g.state === '경기중'
                ? <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444433', borderRadius:4, padding:'2px 8px', fontWeight:700 }}>● LIVE</span>
                : g.state === '종료'
                ? <span style={{ fontSize:10, color:'#64748b', border:'1px solid #64748b33', borderRadius:4, padding:'2px 8px' }}>종료</span>
                : <><div style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f633', borderRadius:4, padding:'2px 8px', fontWeight:700, display:'inline-block' }}>예정</div>
                   <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>{g.startTime}</div></>
              }
              {g.stadium && <div style={{ fontSize:10, color:'#475569', marginTop:4 }}>🏟 {g.stadium}</div>}
            </div>
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontSize:11, color:'#3b82f6', marginBottom:3 }}>홈</div>
              <div style={{ fontSize:18, fontWeight:900, color:'#e2e8f0' }}>{g.homeTeam}</div>
              {g.homeScore != null && <div style={{ fontSize:26, fontWeight:900, color:'#e2e8f0' }}>{g.homeScore}</div>}
            </div>
          </div>
          {(g.awayPitcher || g.homePitcher) && (
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, paddingTop:8, borderTop:'1px solid #1e2d45' }}>
              <span style={{ fontSize:10, color:'#64748b' }}>⚾ {g.awayPitcher?.trim()}</span>
              <span style={{ fontSize:10, color:'#64748b' }}>{g.homePitcher?.trim()} ⚾</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Live({ user, onLoginRequired, game: propGame }) {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(propGame || null);
  const [liveData, setLiveData] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [warning, setWarning] = useState(false);
  const [myVote, setMyVote] = useState(null);
  const [votes, setVotes] = useState({ hit:0, out:0 });
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);

  // 오늘 경기 목록 로드
  useEffect(() => {
    const today = new Date();
    const d = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    fetch(`${SERVER}/api/kbo/games/${d}`)
      .then(r => r.json())
      .then(data => { if (data.success) setGames(data.data); })
      .catch(() => {});
  }, []);

  // propGame이 바뀌면 선택된 경기 업데이트
  useEffect(() => {
    if (propGame) setSelectedGame(propGame);
  }, [propGame]);

  // 실시간 스코어 조회
  const fetchLive = useCallback(async () => {
    if (!selectedGame) return;
    try {
      const today = new Date();
      const d = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
      const res = await fetch(`${SERVER}/api/kbo/games/${d}`);
      const data = await res.json();
      if (data.success) {
        const found = data.data.find(g => g.gameId === selectedGame.gameId);
        if (found) setLiveData(found);
      }
    } catch(e) {}
  }, [selectedGame]);

  useEffect(() => {
    if (!selectedGame) return;
    setLoading(true);
    fetchLive().finally(() => setLoading(false));
    intervalRef.current = setInterval(fetchLive, 30000);
    return () => clearInterval(intervalRef.current);
  }, [selectedGame, fetchLive]);

  // 채팅 소켓
  const roomId = selectedGame ? `game_${selectedGame.gameId}` : 'live_general';
  useEffect(() => {
    socket.emit('join', roomId);
    socket.on('chat_history', (history) => {
      setMsgs(history.map(m => ({
        id: m.id, user: m.user?.nickname || m.user?.name || '익명',
        av: '⚾', msg: m.message,
        time: new Date(m.createdAt).toLocaleTimeString('ko', { hour:'2-digit', minute:'2-digit' }),
      })));
    });
    socket.on('receive_message', (data) => {
      setMsgs(prev => [...prev, {
        id: data.id, user: data.userName,
        av: '⚾', msg: data.message,
        time: new Date(data.createdAt).toLocaleTimeString('ko', { hour:'2-digit', minute:'2-digit' }),
      }]);
    });
    return () => { socket.off('chat_history'); socket.off('receive_message'); };
  }, [roomId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const sendMsg = () => {
    if (!user) return;
    if (!input.trim()) return;
    if (hasBadWord(input)) { setWarning(true); return; }
    socket.emit('send_message', { message: input, userId: user?.id||null, userName: user?.nickname||user?.name||'익명', roomId });
    setInput(''); setWarning(false);
  };

  const vote = (side) => {
    if (myVote) return;
    setMyVote(side);
    setVotes(prev => ({ ...prev, [side]: prev[side]+1 }));
  };
  const total = votes.hit + votes.out || 1;
  const gs = liveData || selectedGame;

  // 경기 선택 안 됐으면 목록 표시
  if (!selectedGame) {
    return (
      <div>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e2d45', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>📡 라이브</div>
        </div>
        <GameList games={games} onSelect={(g) => { setSelectedGame(g); setMyVote(null); setVotes({hit:0,out:0}); }} />
        {/* 일반 채팅 */}
        <div style={{ borderTop:'1px solid #1e2d45', padding:'10px 14px' }}>
          <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:10 }}>💬 야구 이야기</div>
          {msgs.slice(-10).map((m,i,arr) => {
            const sh = i===0 || arr[i-1].user !== m.user;
            return (
              <div key={m.id} style={{ marginBottom: sh?8:3 }}>
                {sh && <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'#1e2d45', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>⚾</div>
                  <span style={{ fontSize:12, fontWeight:700, color:'#e2e8f0' }}>{m.user}</span>
                  <span style={{ fontSize:10, color:'#64748b' }}>{m.time}</span>
                </div>}
                <div style={{ paddingLeft:28 }}>
                  <div style={{ display:'inline-block', background:'#0d1220', border:'1px solid #1e2d45', borderRadius:'3px 10px 10px 10px', padding:'5px 10px', fontSize:13, color:'#e2e8f0', maxWidth:'88%' }}>{m.msg}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        {user ? (
          <div style={{ padding:'7px 12px 80px', borderTop:'1px solid #1e2d45' }}>
            <div style={{ display:'flex', gap:7 }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()}
                placeholder="야구 이야기를 나눠보세요..."
                style={{ flex:1, background:'#0d1220', border:'1px solid #243550', borderRadius:10, padding:'9px 12px', color:'#e2e8f0', fontSize:13, outline:'none' }} />
              <button onClick={sendMsg} style={{ background:'#3b82f6', border:'none', borderRadius:10, padding:'9px 15px', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>전송</button>
            </div>
          </div>
        ) : (
          <div style={{ padding:'14px 16px 80px', textAlign:'center' }}>
            <button onClick={onLoginRequired} style={{ padding:'10px 24px', background:'#3b82f6', border:'none', borderRadius:20, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>🔐 Google 로그인</button>
          </div>
        )}
      </div>
    );
  }

  // 경기 선택됨 → 전광판 표시
  const isLive = gs?.state === 'LIVE' || gs?.state === '경기중';
  const isDone = gs?.state === '종료';

  return (
    <div style={{ display:'flex', flexDirection:'column', paddingBottom:80 }}>
      {/* 상단 뒤로가기 */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid #1e2d45', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => setSelectedGame(null)} style={{ background:'none', border:'none', color:'#64748b', fontSize:18, cursor:'pointer', padding:'2px 6px' }}>‹</button>
        <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>
          {gs?.awayTeam} vs {gs?.homeTeam}
        </div>
        {isLive && <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444433', borderRadius:4, padding:'2px 6px', fontWeight:700 }}>● LIVE</span>}
        {isDone && <span style={{ fontSize:10, color:'#64748b', border:'1px solid #64748b33', borderRadius:4, padding:'2px 6px' }}>종료</span>}
        {!isLive && !isDone && <span style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f633', borderRadius:4, padding:'2px 6px', fontWeight:700 }}>예정</span>}
      </div>

      {/* 전광판 */}
      <div style={{ background:'#0d1220', padding:'12px 16px', borderBottom:'1px solid #1e2d45' }}>
        {/* 점수 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>원정</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>{gs?.awayTeam}</div>
            <div style={{ fontSize:36, fontWeight:900, color:'#e2e8f0', marginTop:2 }}>
              {gs?.awayScore ?? (isLive || isDone ? '0' : '-')}
            </div>
          </div>
          <div style={{ textAlign:'center', minWidth:80 }}>
            {isLive && <>
              <div style={{ fontSize:9, color:'#ef4444', fontWeight:700 }}>● LIVE</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:3 }}>실시간 중계</div>
            </>}
            {isDone && <div style={{ fontSize:11, color:'#64748b' }}>경기 종료</div>}
            {!isLive && !isDone && <>
              <div style={{ fontSize:11, color:'#3b82f6', fontWeight:700 }}>예정</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>{gs?.startTime}</div>
            </>}
            {gs?.stadium && <div style={{ fontSize:10, color:'#475569', marginTop:4 }}>🏟 {gs.stadium}</div>}
          </div>
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#3b82f6', marginBottom:2 }}>홈</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>{gs?.homeTeam}</div>
            <div style={{ fontSize:36, fontWeight:900, color:'#e2e8f0', marginTop:2 }}>
              {gs?.homeScore ?? (isLive || isDone ? '0' : '-')}
            </div>
          </div>
        </div>

        {/* 이닝별 점수 */}
        {gs?.innings?.length > 0 && (
          <div style={{ background:'#111827', borderRadius:10, padding:'10px 12px', marginBottom:12, overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', fontSize:11, width:'100%' }}>
              <thead><tr>
                <th style={{ color:'#64748b', textAlign:'left', padding:'3px 6px', minWidth:32 }}>팀</th>
                {gs.innings.map((_,i) => <th key={i} style={{ color:'#64748b', textAlign:'center', padding:'3px 3px', minWidth:18 }}>{i+1}</th>)}
                <th style={{ color:'#e2e8f0', textAlign:'center', padding:'3px 6px', fontWeight:900 }}>R</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td style={{ color:'#94a3b8', padding:'3px 6px', fontWeight:700 }}>{gs.awayTeam}</td>
                  {gs.innings.map((inn,i) => <td key={i} style={{ color:'#cbd5e1', textAlign:'center', padding:'3px 3px' }}>{inn.away??'-'}</td>)}
                  <td style={{ color:'#fff', textAlign:'center', padding:'3px 6px', fontWeight:900 }}>{gs.awayScore}</td>
                </tr>
                <tr>
                  <td style={{ color:'#94a3b8', padding:'3px 6px', fontWeight:700 }}>{gs.homeTeam}</td>
                  {gs.innings.map((inn,i) => <td key={i} style={{ color:'#cbd5e1', textAlign:'center', padding:'3px 3px' }}>{inn.home??'-'}</td>)}
                  <td style={{ color:'#fff', textAlign:'center', padding:'3px 6px', fontWeight:900 }}>{gs.homeScore}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 선발/승패 투수 */}
        {(gs?.awayPitcher || gs?.homePitcher) && (
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <Diamond bases={{}} />
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
              <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:8, padding:'7px 10px' }}>
                <div style={{ fontSize:9, color:'#64748b', letterSpacing:1, marginBottom:2 }}>⚾ 선발투수</div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>{gs.awayTeam} {gs.awayPitcher?.trim()}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>{gs.homeTeam} {gs.homePitcher?.trim()}</span>
                </div>
              </div>
              {isDone && gs.winPitcher && (
                <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:8, padding:'7px 10px' }}>
                  <div style={{ fontSize:9, color:'#64748b', letterSpacing:1, marginBottom:4 }}>📋 승패투수</div>
                  <div style={{ display:'flex', gap:8 }}>
                    <span style={{ fontSize:11, color:'#10b981' }}>✓ {gs.winPitcher?.trim()}</span>
                    {gs.losePitcher && <span style={{ fontSize:11, color:'#ef4444' }}>✗ {gs.losePitcher?.trim()}</span>}
                    {gs.savePitcher && <span style={{ fontSize:11, color:'#3b82f6' }}>S {gs.savePitcher?.trim()}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 예측 투표 (예정 경기만) */}
        {!isLive && !isDone && (
          <div>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:6, textAlign:'center' }}>오늘 경기 승리팀 예측</div>
            <div style={{ display:'flex', gap:6 }}>
              {[[gs?.awayTeam||'원정','away','#3b82f6'],[gs?.homeTeam||'홈','home','#10b981']].map(([label,key,color]) => (
                <button key={key} onClick={() => vote(key)} style={{
                  flex:1, padding:'8px', borderRadius:8,
                  border:`1px solid ${myVote===key ? color+'88' : '#1e2d45'}`,
                  background: myVote===key ? color+'22' : 'transparent',
                  color: myVote===key ? color : '#64748b',
                  fontSize:12, fontWeight:700, cursor: myVote ? 'default' : 'pointer',
                }}>
                  {label} 승 {myVote && `${Math.round((key==='away'?votes.away:votes.home)/total*100)}%`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 채팅 */}
      <div style={{ padding:'10px 14px', minHeight:100 }}>
        {msgs.length===0 && (
          <div style={{ textAlign:'center', padding:'20px 0', color:'#64748b', fontSize:12 }}>
            이 경기 채팅을 시작해보세요! 💬
          </div>
        )}
        {msgs.slice(-30).map((m,i,arr) => {
          const sh = i===0 || arr[i-1].user !== m.user;
          return (
            <div key={m.id} style={{ marginBottom: sh?10:3 }}>
              {sh && (
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:'#1e2d45', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>⚾</div>
                  <span style={{ fontSize:12, fontWeight:700, color:'#e2e8f0' }}>{m.user}</span>
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

      {/* 이모지 반응 */}
      {user && (
        <div style={{ padding:'5px 12px', display:'flex', gap:5, overflowX:'auto', borderTop:'1px solid #1e2d45' }}>
          {['🔥','👏','😱','💪','⚾','🏆','😭','🎉'].map(r => (
            <button key={r} onClick={() => socket.emit('send_message', { message:r, userId:user?.id||null, userName:user?.nickname||user?.name||'익명', roomId })}
              style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, padding:'3px 8px', fontSize:14, cursor:'pointer', flexShrink:0 }}>{r}</button>
          ))}
        </div>
      )}

      {/* 채팅 입력 */}
      {user ? (
        <div style={{ padding:'7px 12px 12px', borderTop:'1px solid #1e2d45' }}>
          {warning && <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 10px', marginBottom:7, background:'#ef444418', border:'1px solid #ef444444', borderRadius:8 }}>
            <span>⚠️</span><span style={{ fontSize:11, color:'#ef4444', fontWeight:700 }}>욕설·비하 표현은 사용 금지입니다</span>
          </div>}
          <div style={{ display:'flex', gap:7 }}>
            <input value={input} onChange={e=>{ setInput(e.target.value); if(warning) setWarning(false); }}
              onKeyDown={e=>e.key==='Enter'&&sendMsg()} placeholder="채팅 입력..."
              style={{ flex:1, background:warning?'#ef444411':'#0d1220', border:`1px solid ${warning?'#ef444466':'#243550'}`, borderRadius:10, padding:'9px 12px', color:'#e2e8f0', fontSize:13, outline:'none' }} />
            <button onClick={sendMsg} style={{ background:'#3b82f6', border:'none', borderRadius:10, padding:'9px 15px', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>전송</button>
          </div>
        </div>
      ) : (
        <div style={{ padding:'14px 16px', borderTop:'1px solid #1e2d45', textAlign:'center', background:'#0d1220' }}>
          <div style={{ fontSize:12, color:'#64748b', marginBottom:10 }}>로그인하면 실시간 채팅에 참여할 수 있어요 💬</div>
          <button onClick={onLoginRequired} style={{ padding:'10px 24px', background:'#3b82f6', border:'none', borderRadius:20, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>🔐 Google 로그인</button>
        </div>
      )}
    </div>
  );
}

export default Live;
