import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Live from './pages/Live';
import Board from './pages/Board';
import Profile from './pages/Profile';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ 1단계: URL에 token이 있으면 무조건 먼저 저장 (로그인 직후)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      localStorage.setItem('dugout_token', urlToken);
      window.history.replaceState({}, '', '/');
      fetch(SERVER + '/auth/me', {
        headers: { Authorization: 'Bearer ' + urlToken }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.data);
      });
      return; // 아래 코드 실행 안 함
    }

    // ✅ 2단계: URL token 없으면 localStorage에서 기존 토큰 확인
    const token = localStorage.getItem('dugout_token');
    if (token) {
      fetch(SERVER + '/auth/me', {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data);
        } else {
          localStorage.removeItem('dugout_token'); // 만료된 토큰 삭제
        }
      })
      .catch(() => localStorage.removeItem('dugout_token'));
    }
  }, []);

  const login = () => { window.location.href = SERVER + '/auth/google'; };
  const logout = () => { localStorage.removeItem('dugout_token'); setUser(null); };

  return { user, login, logout };
}

function App() {
  const [tab, setTab] = useState('home');
  const { user, login, logout } = useAuth();

  return (
    <div style={{
      backgroundColor: '#080c14', minHeight: '100vh',
      color: '#e2e8f0', fontFamily: 'sans-serif',
      maxWidth: 430, margin: '0 auto',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 상단 헤더 */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #1e2d45',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#080c14', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{
            width:28, height:28, borderRadius:8,
            background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
          }}>⚾</div>
          <span style={{ fontSize:15, fontWeight:900 }}>Dugout</span>
        </div>
        {user ? (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, color:'#10b981' }}>● {user.name}</span>
            <button onClick={logout} style={{ fontSize:11, color:'#64748b', background:'transparent', border:'none', cursor:'pointer' }}>로그아웃</button>
          </div>
        ) : (
          <button onClick={login} style={{
            background:'#3b82f6', border:'none', borderRadius:8,
            padding:'6px 12px', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer',
          }}>🔐 Google 로그인</button>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {tab==='home' && <Home onGoLive={() => setTab('live')} />}
        {tab==='live' && <Live user={user} />}
        {tab==='board' && <Board user={user} />}
        {tab==='profile' && <Profile user={user} onLogout={logout} />}
      </div>

      {/* 하단 탭바 */}
      <div style={{
        display:'flex', borderTop:'1px solid #1e2d45',
        backgroundColor:'#0d1220', position:'sticky', bottom:0,
      }}>
        {[
          { id:'home', label:'홈', icon:'🏠' },
          { id:'live', label:'라이브', icon:'📡' },
          { id:'board', label:'게시판', icon:'📋' },
          { id:'profile', label:'MY', icon:'👤' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:'10px 0 12px', border:'none',
            background:'transparent', cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            borderTop: '2px solid ' + (tab===t.id ? '#3b82f6' : 'transparent'),
          }}>
            <span style={{ fontSize:16 }}>{t.icon}</span>
            <span style={{ fontSize:9, fontWeight:700, color: tab===t.id ? '#3b82f6' : '#64748b' }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;