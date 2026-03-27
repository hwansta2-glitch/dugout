import { useState } from 'react';
import Home from './pages/Home';
import Live from './pages/Live';
import Board from './pages/Board';
import Profile from './pages/Profile';

function App() {
  const [tab, setTab] = useState('home');

  return (
    <div style={{
      backgroundColor: '#080c14',
      minHeight: '100vh',
      color: '#e2e8f0',
      fontFamily: 'Noto Sans KR, sans-serif',
      maxWidth: 430,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* 상단 바 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #1e2d45',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#080c14',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15,
          }}>⚾</div>
          <span style={{ fontSize: 15, fontWeight: 900 }}>Dugout</span>
        </div>
        <span style={{ fontSize: 11, color: '#10b981' }}>● 온라인</span>
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'home' && <Home onGoLive={() => setTab('live')} />}
        {tab === 'live' && <Live />}
        {tab === 'board' && <Board />}
        {tab === 'profile' && <Profile />}
      </div>

      {/* 하단 네비게이션 */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid #1e2d45',
        backgroundColor: '#0d1220',
        position: 'sticky',
        bottom: 0,
      }}>
        {[
          { id: 'home', label: '홈', icon: '🏠' },
          { id: 'live', label: '라이브', icon: '📡' },
          { id: 'board', label: '게시판', icon: '📋' },
          { id: 'profile', label: 'MY', icon: '👤' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '10px 0 12px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              borderTop: `2px solid ${tab === t.id ? '#3b82f6' : 'transparent'}`,
            }}
          >
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              color: tab === t.id ? '#3b82f6' : '#64748b',
            }}>{t.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}

export default App;