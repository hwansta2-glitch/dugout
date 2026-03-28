import { useState, useEffect } from 'react';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

const FALLBACK_GAMES = [
  { id:1, awayTeam:'KT',   homeTeam:'LG',   awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'잠실' },
  { id:2, awayTeam:'키움', homeTeam:'한화',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'대전' },
  { id:3, awayTeam:'KIA',  homeTeam:'SSG',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'문학' },
  { id:4, awayTeam:'롯데', homeTeam:'삼성',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'대구' },
  { id:5, awayTeam:'두산', homeTeam:'NC',   awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'창원' },
];

function GameCard({ game, onClick }) {
  const isLive     = game.state === 'LIVE' || game.state === '경기중' || game.state === '진행중';
  const isDone     = game.state === '종료' || game.state === '경기종료' || game.state === '최종';
  const isUpcoming = !isLive && !isDone;
  const winnerAway = isDone && game.awayScore != null && game.awayScore > game.homeScore;
  const winnerHome = isDone && game.homeScore != null && game.homeScore > game.awayScore;

  return (
    <div onClick={() => isLive && onClick && onClick()} style={{
      background: '#111827',
      border: isLive ? '1px solid #ef444444' : '1px solid #1e2d45',
      borderRadius: 14, padding: '14px', marginBottom: 10,
      cursor: isLive ? 'pointer' : 'default',
      position: 'relative', overflow: 'hidden',
    }}>
      {isLive && <div style={{ height:2, background:'linear-gradient(90deg,#ef4444,#f59e0b)', position:'absolute', top:0, left:0, right:0 }} />}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: isLive ? 6 : 0 }}>
        <div style={{ textAlign:'center', flex:1 }}>
          <div style={{ fontSize:17, fontWeight:900, color: isDone && !winnerAway ? '#64748b' : '#e2e8f0' }}>{game.awayTeam}</div>
          {game.awayScore != null && (
            <div style={{ fontSize:28, fontWeight:900, color: winnerAway ? '#ffffff' : isDone ? '#64748b' : '#e2e8f0', marginTop:2 }}>{game.awayScore}</div>
          )}
        </div>
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
        <div style={{ textAlign:'center', flex:1 }}>
          <div style={{ fontSize:17, fontWeight:900, color: isDone && !winnerHome ? '#64748b' : '#e2e8f0' }}>{game.homeTeam}</div>
          {game.homeScore != null && (
            <div style={{ fontSize:28, fontWeight:900, color: winnerHome ? '#ffffff' : isDone ? '#64748b' : '#e2e8f0', marginTop:2 }}>{game.homeScore}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Home({ onGoLive }) {
  const [games, setGames]       = useState(FALLBACK_GAMES);
  const [hotPosts, setHotPosts] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchGames = async () => {
    try {
      const targetUrl = 'https://www.koreabaseball.com/Schedule/ScoreBoard.aspx';
      const proxyUrl  = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      const res  = await fetch(proxyUrl);
      const json = await res.json();
      const html = json.contents;

      const parser = new DOMParser();
      const doc    = parser.parseFromString(html, 'text/html');
      const tables = doc.querySelectorAll('.tScore');

      if (tables.length > 0) {
        const parsed = [];
        tables.forEach((table, i) => {
          const rows = table.querySelectorAll('tbody tr');
          if (rows.length >= 2) {
            const awayTeam  = rows[0].querySelector('th')?.textContent.trim();
            const homeTeam  = rows[1].querySelector('th')?.textContent.trim();
            const awayScore = rows[0].querySelector('.point')?.textContent.trim();
            const homeScore = rows[1].querySelector('.point')?.textContent.trim();

            // 이닝 체크로 경기 상태 판단
            const cells = rows[0].querySelectorAll('td');
            const hasScore = awayScore && awayScore !== '-' && awayScore !== '';
            const allDash  = Array.from(cells).every(td => td.textContent.trim() === '-');
            const state    = !hasScore ? '예정' : allDash ? '예정' : '종료';

            parsed.push({
              id: i + 1,
              awayTeam: awayTeam || '',
              homeTeam: homeTeam || '',
              awayScore: awayScore && awayScore !== '-' ? parseInt(awayScore) : null,
              homeScore: homeScore && homeScore !== '-' ? parseInt(homeScore) : null,
              state,
              stadium: FALLBACK_GAMES[i]?.stadium || '',
            });
          }
        });
        if (parsed.length > 0) setGames(parsed);
      }
    } catch(e) {
      console.log('경기 데이터 불러오기 실패:', e);
    }
  };

  const fetchHotPosts = async () => {
    try {
      const res  = await fetch(`${SERVER}/api/posts`);
      const data = await res.json();
      if (data.success && data.data) {
        const hot = data.data.filter(p => (p.likes ?? 0) >= 1).slice(0, 5);
        setHotPosts(hot);
      }
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
    fetchHotPosts();
    const interval = setInterval(fetchGames, 60000);
    return () => clearInterval(interval);
  }, []);

  const today   = new Date();
  const dateStr = `${today.getMonth()+1}월 ${today.getDate()}일`;
  const hasLive = games.some(g => g.state === 'LIVE' || g.state === '경기중');

  return (
    <div style={{ padding:'16px 16px 80px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700 }}>TODAY'S GAMES</div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {hasLive && <span style={{ fontSize:10, color:'#ef4444', fontWeight:700 }}>● LIVE</span>}
          <span style={{ fontSize:11, color:'#475569' }}>{dateStr}</span>
        </div>
      </div>

      {games.map(game => (
        <GameCard key={game.id} game={game} onClick={() => onGoLive && onGoLive()} />
      ))}

      {!loading && hotPosts.length > 0 && (
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700, marginBottom:10 }}>🔥 HOT 게시글</div>
          {hotPosts.map((post, i) => (
            <div key={post.id} style={{
              background:'#111827', border:'1px solid #1e2d45', borderRadius:12,
              padding:'11px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{ fontSize:13, fontWeight:900, color:'#ef4444', minWidth:16 }}>{i+1}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:'#e2e8f0', lineHeight:1.4 }}>{post.title}</div>
                <div style={{ display:'flex', gap:8, marginTop:4 }}>
                  <span style={{ fontSize:10, color:'#64748b' }}>{post.author?.nickname || post.author?.name}</span>
                  <span style={{ fontSize:10, color:'#ef4444' }}>👍 {post.likes ?? 0}</span>
                  <span style={{ fontSize:10, color:'#64748b' }}>💬 {post._count?.comments ?? 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && hotPosts.length === 0 && (
        <div style={{ marginTop:20, textAlign:'center', padding:'20px 0', color:'#475569', fontSize:12 }}>
          아직 인기 게시글이 없어요 ⚾
        </div>
      )}
    </div>
  );
}

export default Home;