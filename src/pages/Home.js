import { useState } from 'react';

const GAMES = [
  { id:1, away:'KIA', home:'LG', awayScore:3, homeScore:5, inning:'8회 말', live:true },
  { id:2, away:'삼성', home:'두산', awayScore:1, homeScore:1, inning:'5회 초', live:true },
  { id:3, away:'SSG', home:'NC', awayScore:null, homeScore:null, inning:'18:30', upcoming:true },
  { id:4, away:'롯데', home:'한화', awayScore:7, homeScore:4, inning:'최종', done:true },
];

function GameCard({ game, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#111827',
      border: game.live ? '1px solid #3b82f655' : '1px solid #1e2d45',
      borderRadius: 14,
      padding: '14px',
      marginBottom: 10,
      cursor: game.live ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {game.live && (
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
          position: 'absolute', top: 0, left: 0, right: 0,
        }} />
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: game.live ? 8 : 0,
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#e2e8f0' }}>{game.away}</div>
          {game.awayScore != null && (
            <div style={{ fontSize: 26, fontWeight: 900, color: '#e2e8f0' }}>{game.awayScore}</div>
          )}
        </div>
        <div style={{ textAlign: 'center', padding: '0 12px' }}>
          {game.live && (
            <span style={{ fontSize: 10, color: '#ef4444', border: '1px solid #ef444444', borderRadius: 4, padding: '2px 6px', fontWeight: 700 }}>LIVE</span>
          )}
          {game.upcoming && (
            <span style={{ fontSize: 10, color: '#3b82f6', border: '1px solid #3b82f644', borderRadius: 4, padding: '2px 6px', fontWeight: 700 }}>예정</span>
          )}
          {game.done && (
            <span style={{ fontSize: 10, color: '#64748b', border: '1px solid #64748b44', borderRadius: 4, padding: '2px 6px' }}>종료</span>
          )}
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 5 }}>{game.inning}</div>
          {game.live && (
            <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 3 }}>탭하여 참여</div>
          )}
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#e2e8f0' }}>{game.home}</div>
          {game.homeScore != null && (
            <div style={{ fontSize: 26, fontWeight: 900, color: '#e2e8f0' }}>{game.homeScore}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Home({ onGoLive }) {
  return (
    <div style={{ padding: '16px 16px 80px' }}>
      <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>
        TODAY'S GAMES
      </div>
      {GAMES.map(game => (
        <GameCard
          key={game.id}
          game={game}
          onClick={() => game.live && onGoLive()}
        />
      ))}
    </div>
  );
}

export default Home;