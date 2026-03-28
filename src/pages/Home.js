import { useState, useEffect } from 'react';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

// 오늘 날짜 기준 하드코딩 경기 데이터 (KBO 개막전 2026.03.28)
const TODAY_GAMES = [
  { id:1, away:'KT',   home:'LG',   awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'잠실' },
  { id:2, away:'키움', home:'한화',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'대전' },
  { id:3, away:'KIA',  home:'SSG',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'문학' },
  { id:4, away:'롯데', home:'삼성',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'대구' },
  { id:5, away:'두산', home:'NC',   awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'창원' },
];

function GameCard({ game, onClick }) {
  const isLive    = game.state === 'LIVE' || game.state === '경기중';
  const isDone    = game.state === '종료' || game.state === '경기종료';
  const isUpcoming = !isLive && !isDone;

  const winnerAway = isDone && game.awayScore != null && game.awayScore > game.homeScore;
  const winnerHome = isDone && game.homeScore != null && game.homeScore > game.awayScore;

  return (
    <div onClick={() => isLive && onClick()} style={{
      background: '#111827',
      border: isLive ? '1px solid #ef444444' : '1px solid #1e2d45',
      borderRadius: 14,
      padding: '14px',
      marginBottom: 10,
      cursor: isLive ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {isLive && (
        <div style={{ height:2, background:'linear-gradient(90deg,#ef4444,#f59e0b)', position:'absolute', top:0, left:0, right:0 }} />
      )}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: isLive ? 6 : 0 }}>
        {/* 원정팀 */}
        <div style={{ textAlign:'center', flex:1 }}>
          <div style={{ fontSize:17, fontWeight:900, color: winnerAway ? '#e2e8f0' : isDone ? '#64748b' : '#e2e8f0' }}>
            {game.away}
          </div>
          {game.awayScore != null && (
            <div style={{ fontSize:28, fontWeight:900, color: winnerAway ? '#ffffff' : isDone ? '#64748b' : '#e2e8f0', marginTop:2 }}>
              {game.awayScore}
            </div>
          )}
        </div>

        {/* 중앙 상태 */}
        <div style={{ textAlign:'center', padding:'0 14px', minWidth:80 }}>
          {isLive && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444444', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>● LIVE</span>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{game.inning || ''}</div>
              <div style={{ fontSize:10, color:'#3b82f6' }}>탭하여 참여</div>
            </div>
          )}
          {isUpcoming && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f644', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>예정</span>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{game.startTime || ''}</div>
              {game.stadium && <div style={{ fontSize:10, color:'#475569' }}>{game.stadium}</div>}
            </div>
          )}
          {isDone && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:10, color:'#64748b', border:'1px solid #64748b44', borderRadius:4, padding:'2px 6px' }}>종료</span>
              {game.stadium && <div style={{ fontSize:10, color:'#475569', marginTop:2 }}>{game.stadium}</div>}
            </div>
          )}
        </div>

        {/* 홈팀 */}
        <div style={{ textAlign:'center', flex:1 }}>
          <div style={{ fontSize:17, fontWeight:900, color: winnerHome ? '#e2e8f0' : isDone ? '#64748b' : '#e2e8f0' }}>
            {game.home}
          </div>
          {game.homeScore != null && (
            <div style={{ fontSize:28, fontWeight:900, color: winnerHome ? '#ffffff' : isDone ? '#64748b' : '#e2e8f0', marginTop:2 }}>
              {game.homeScore}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Home({ onGoLive }) {
  const [games, setGames]   = useState(TODAY_GAMES);
  const [news, setNews]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 경기 데이터 로드 (서버에서 오면 사용, 빈 배열이면 하드코딩 유지)
  const fetchGames = async () => {
    try {
      const res  = await fetch(`${SERVER}/api/kbo/games`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setGames(data.data);
      }
      setLastUpdated(new Date());
    } catch(e) {
      // 실패시 하드코딩 유지
    }
  };

  // 뉴스 로드
  const fetchNews = async () => {
    try {
      const res  = await fetch(`${SERVER}/api/news`);
      const data = await res.json();
      if (data.success && data.data) setNews(data.data.slice(0, 5));
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
    fetchNews();
    // LIVE 경기 있으면 30초마다 갱신
    const interval = setInterval(fetchGames, 30000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const dateStr = `${today.getMonth()+1}월 ${today.getDate()}일`;
  const hasLive = games.some(g => g.state === 'LIVE' || g.state === '경기중');

  return (
    <div style={{ padding:'16px 16px 80px' }}>

      {/* 날짜 헤더 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700 }}>
          TODAY'S GAMES
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {hasLive && (
            <span style={{ fontSize:10, color:'#ef4444', fontWeight:700 }}>● LIVE</span>
          )}
          <span style={{ fontSize:11, color:'#475569' }}>{dateStr}</span>
        </div>
      </div>

      {/* 경기 카드 */}
      {games.map(game => (
        <GameCard
          key={game.id || `${game.away}-${game.home}`}
          game={game}
          onClick={() => onGoLive && onGoLive()}
        />
      ))}

      {/* 뉴스 섹션 */}
      {news.length > 0 && (
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700, marginBottom:10 }}>
            ⚾ KBO 뉴스
          </div>
          {news.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
              <div style={{
                background:'#111827', border:'1px solid #1e2d45', borderRadius:12,
                padding:'11px 14px', marginBottom:8,
                display:'flex', alignItems:'center', gap:10,
              }}>
                <span style={{ fontSize:14 }}>📰</span>
                <div style={{ fontSize:13, color:'#cbd5e1', lineHeight:1.4, flex:1 }}>{item.title}</div>
                <span style={{ fontSize:11, color:'#475569', flexShrink:0 }}>→</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* 뉴스 로딩 중 */}
      {loading && (
        <div style={{ textAlign:'center', padding:'20px 0', color:'#475569', fontSize:12 }}>
          뉴스 불러오는 중...
        </div>
      )}
    </div>
  );
}

export default Home;