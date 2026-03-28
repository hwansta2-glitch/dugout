import { useState, useEffect } from 'react';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

const TODAY_GAMES = [
  { id:1, away:'KT',   home:'LG',   awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'잠실' },
  { id:2, away:'키움', home:'한화',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'대전' },
  { id:3, away:'KIA',  home:'SSG',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'문학' },
  { id:4, away:'롯데', home:'삼성',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'대구' },
  { id:5, away:'두산', home:'NC',   awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'창원' },
];

function GameCard({ game, onClick }) {
  const isLive     = game.state === 'LIVE' || game.state === '경기중';
  const isDone     = game.state === '종료' || game.state === '경기종료' || game.state === '최종';
  const isUpcoming = !isLive && !isDone;
  const winnerAway = isDone && game.awayScore != null && game.awayScore > game.homeScore;
  const winnerHome = isDone && game.homeScore != null && game.homeScore > game.awayScore;

  return (
    <div onClick={() => isLive && onClick && onClick()} style={{
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
          <div style={{ fontSize:17, fontWeight:900, color: isDone && !winnerAway ? '#64748b' : '#e2e8f0' }}>
            {game.away || game.awayTeam}
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
          <div style={{ fontSize:17, fontWeight:900, color: isDone && !winnerHome ? '#64748b' : '#e2e8f0' }}>
            {game.home || game.homeTeam}
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
  const [games, setGames]     = useState(TODAY_GAMES);
  const [hotPosts, setHotPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
  try {
    // allorigins 프록시로 KBO 스코어보드 직접 파싱
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const targetUrl = `https://www.koreabaseball.com/ws/Schedule.asmx/GetScheduleScore?leId=1&srId=0,1,3,4,5&date=${yyyy}${mm}${dd}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    const res = await fetch(proxyUrl);
    const json = await res.json();
    const data = JSON.parse(json.contents);

    if (data && data.game && data.game.length > 0) {
      const mapped = data.game.map((g, i) => ({
        id: i + 1,
        away: g.T_NAME_A || g.awayNm,
        home: g.T_NAME_H || g.homeNm,
        awayScore: g.SCORE_A != null && g.SCORE_A !== '' ? parseInt(g.SCORE_A) : null,
        homeScore: g.SCORE_H != null && g.SCORE_H !== '' ? parseInt(g.SCORE_H) : null,
        state: g.G_SC_NM || g.statusNm || '예정',
        inning: g.INN_NO ? `${g.INN_NO}회` : '',
        startTime: g.G_TIME || '',
        stadium: g.S_NM || '',
      }));
      setGames(mapped);
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
    const interval = setInterval(fetchGames, 30000);
    return () => clearInterval(interval);
  }, []);

  const today   = new Date();
  const dateStr = `${today.getMonth()+1}월 ${today.getDate()}일`;
  const hasLive = games.some(g => g.state === 'LIVE' || g.state === '경기중');

  return (
    <div style={{ padding:'16px 16px 80px' }}>

      {/* 날짜 헤더 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700 }}>TODAY'S GAMES</div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {hasLive && <span style={{ fontSize:10, color:'#ef4444', fontWeight:700 }}>● LIVE</span>}
          <span style={{ fontSize:11, color:'#475569' }}>{dateStr}</span>
        </div>
      </div>

      {/* 경기 카드 */}
      {games.map(game => (
        <GameCard
          key={game.id || `${game.away || game.awayTeam}-${game.home || game.homeTeam}`}
          game={game}
          onClick={() => onGoLive && onGoLive()}
        />
      ))}

      {/* HOT 게시글 섹션 */}
      {!loading && hotPosts.length > 0 && (
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700, marginBottom:10 }}>
            🔥 HOT 게시글
          </div>
          {hotPosts.map((post, i) => (
            <div key={post.id} style={{
              background:'#111827', border:'1px solid #1e2d45', borderRadius:12,
              padding:'11px 14px', marginBottom:8,
              display:'flex', alignItems:'center', gap:10,
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

      {/* 빈 상태 */}
      {!loading && hotPosts.length === 0 && (
        <div style={{ marginTop:20, textAlign:'center', padding:'20px 0', color:'#475569', fontSize:12 }}>
          아직 인기 게시글이 없어요 ⚾
        </div>
      )}
    </div>
  );
}

export default Home;