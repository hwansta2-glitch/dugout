import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Live from './pages/Live';
import Board from './pages/Board';
import Profile from './pages/Profile';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function NicknameModal({ user, onComplete }) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const valid = /^[a-zA-Z0-9가-힣]{2,8}$/.test(nickname);

  const submit = async () => {
    if (!valid) return setError('2~8글자 한영숫자만 가능합니다');
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('dugout_token');
      const res = await fetch(`${SERVER}/api/users/${user.id}/nickname`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ nickname }),
      });
      const data = await res.json();
      if (data.success) onComplete(nickname);
      else setError(data.message || '오류가 발생했습니다');
    } catch(e) { setError('서버 연결 실패'); }
    setLoading(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000ee', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'90%', maxWidth:360, background:'#0f172a', borderRadius:16, padding:'28px 20px' }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>⚾</div>
          <div style={{ fontSize:17, fontWeight:900, color:'#e2e8f0' }}>Dugout에 오신 걸 환영해요!</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:6 }}>사용할 닉네임을 설정해주세요</div>
        </div>
        <input
          value={nickname}
          onChange={e => { setNickname(e.target.value); setError(''); }}
          placeholder="닉네임 (2~8글자 한영숫자)"
          maxLength={8}
          style={{ width:'100%', padding:'11px 12px', borderRadius:8, background:'#111827', border:`1px solid ${error?'#ef4444':'#1e2d45'}`, color:'#e2e8f0', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:8 }}
        />
        <div style={{ fontSize:11, color: valid&&nickname?'#10b981':'#64748b', marginBottom: error?6:14 }}>
          {nickname ? (valid ? '✅ 사용 가능한 닉네임이에요' : '❌ 2~8글자 한영숫자만 가능합니다') : '닉네임은 이후 7일마다 변경 가능해요'}
        </div>
        {error && <div style={{ fontSize:12, color:'#ef4444', marginBottom:12 }}>⚠️ {error}</div>}
        <button onClick={submit} disabled={!valid||loading} style={{
          width:'100%', padding:'12px', borderRadius:10,
          background: valid&&!loading?'#3b82f6':'#1e2d45',
          border:'none', color: valid?'#fff':'#64748b',
          fontSize:14, fontWeight:700, cursor: valid?'pointer':'default',
        }}>{loading ? '설정 중...' : '닉네임 설정하기'}</button>
      </div>
    </div>
  );
}

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가
  const [needNickname, setNeedNickname] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      localStorage.setItem('dugout_token', urlToken);
      window.history.replaceState({}, '', '/');
      fetch(SERVER + '/auth/me', { headers: { Authorization: 'Bearer ' + urlToken } })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.data);
            if (!data.data.nickname) setNeedNickname(true);
          }
          setLoading(false);
        });
      return;
    }

    const token = localStorage.getItem('dugout_token');
    if (!token) {
      setLoading(false); // ✅ 토큰 없으면 로딩 종료
      return;
    }

    fetch(SERVER + '/auth/me', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data);
          if (!data.data.nickname) setNeedNickname(true);
        } else {
          localStorage.removeItem('dugout_token');
        }
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('dugout_token');
        setLoading(false);
      });
  }, []);

  const login  = () => { window.location.href = SERVER + '/auth/google'; };
  const logout = () => { localStorage.removeItem('dugout_token'); setUser(null); setNeedNickname(false); };
  const completeNickname = (nickname) => {
    setUser(prev => ({ ...prev, nickname }));
    setNeedNickname(false);
  };

  return { user, loading, login, logout, needNickname, completeNickname };
}

function App() {
  const [tab, setTab] = useState('home');
  const [liveGame, setLiveGame] = useState(null);
  const { user, loading, login, logout, needNickname, completeNickname } = useAuth();

  const goLive = (game) => {
    setLiveGame(game);
    setTab('live');
  };

  // ✅ 로딩 중에는 아무것도 안 보여줌 (닉네임 모달 방지)
  if (loading) {
    return (
      <div style={{ backgroundColor:'#080c14', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:32 }}>⚾</div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor:'#080c14', minHeight:'100vh',
      color:'#e2e8f0', fontFamily:'sans-serif',
      maxWidth:430, margin:'0 auto',
      display:'flex', flexDirection:'column',
    }}>
      {/* 닉네임 설정 모달: 로그인된 유저 + 닉네임 없을 때만 */}
      {needNickname && user && !loading && (
        <NicknameModal user={user} onComplete={completeNickname} />
      )}

      {/* 상단 헤더 */}
      <div style={{
        padding:'12px 16px', borderBottom:'1px solid #1e2d45',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        backgroundColor:'#080c14', position:'sticky', top:0, zIndex:50,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>⚾</div>
          <span style={{ fontSize:15, fontWeight:900 }}>Dugout</span>
        </div>
        {user ? (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, color:'#10b981' }}>● {user.nickname || user.name}</span>
            <button onClick={logout} style={{ fontSize:11, color:'#64748b', background:'transparent', border:'none', cursor:'pointer' }}>로그아웃</button>
          </div>
        ) : (
          <button onClick={login} style={{ background:'#3b82f6', border:'none', borderRadius:8, padding:'6px 12px', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            🔐 Google 로그인
          </button>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {tab==='home'    && <Home onGoLive={goLive} user={user} />}
        {tab==='live'    && <Live user={user} onLoginRequired={login} game={liveGame} />}
        {tab==='board'   && <Board user={user} onLoginRequired={login} />}
        {tab==='profile' && <Profile user={user} onLogout={logout} />}
      </div>

      {/* 하단 탭바 */}
      <div style={{ display:'flex', borderTop:'1px solid #1e2d45', backgroundColor:'#0d1220', position:'sticky', bottom:0 }}>
        {[
          { id:'home',    label:'홈',    icon:'🏠' },
          { id:'live',    label:'라이브', icon:'📡' },
          { id:'board',   label:'게시판', icon:'📋' },
          { id:'profile', label:'MY',    icon:'👤' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:'10px 0 12px', border:'none', background:'transparent', cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            borderTop: '2px solid ' + (tab===t.id?'#3b82f6':'transparent'),
          }}>
            <span style={{ fontSize:16 }}>{t.icon}</span>
            <span style={{ fontSize:9, fontWeight:700, color: tab===t.id?'#3b82f6':'#64748b' }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;