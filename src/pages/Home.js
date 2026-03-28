import { useState, useEffect } from 'react';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

const FALLBACK_GAMES = [
  { id:1, gameId:'', awayTeam:'KT',   homeTeam:'LG',   awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'잠실', awayPitcher:'', homePitcher:'' },
  { id:2, gameId:'', awayTeam:'키움', homeTeam:'한화',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'대전', awayPitcher:'', homePitcher:'' },
  { id:3, gameId:'', awayTeam:'KIA',  homeTeam:'SSG',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'문학', awayPitcher:'', homePitcher:'' },
  { id:4, gameId:'', awayTeam:'롯데', homeTeam:'삼성',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'대구', awayPitcher:'', homePitcher:'' },
  { id:5, gameId:'', awayTeam:'두산', homeTeam:'NC',   awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'창원', awayPitcher:'', homePitcher:'' },
];

// 경기 상세 모달
function GameDetailModal({ game, onClose }) {
  const isDone     = game.state === '종료' || game.state === '경기종료' || game.state === '최종';
  const isUpcoming = !isDone && game.awayScore == null;
  const winnerAway = isDone && game.awayScore > game.homeScore;
  const winnerHome = isDone && game.homeScore > game.awayScore;

  // 남은 시간 계산
  const getCountdown = () => {
    if (!isUpcoming || !game.startTime) return null;
    const now = new Date();
    const [h, m] = game.startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const diff = start - now;
    if (diff <= 0) return '곧 시작';
    const hours   = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return hours > 0 ? `${hours}시간 ${minutes}분 후` : `${minutes}분 ${seconds}초 후`;
  };

  const [countdown, setCountdown] = useState(getCountdown());
  useEffect(() => {
    if (!isUpcoming) return;
    const t = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(t);
  }, [isUpcoming]);

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:200, display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', background:'#0f172a', borderRadius:'20px 20px 0 0', padding:'20px 16px 40px', maxHeight:'85vh', overflowY:'auto' }}>

        {/* 헤더 */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <span style={{ fontSize:13, color:'#64748b' }}>{game.stadium} · {game.startTime}</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        {/* 점수판 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, padding:'16px', background:'#111827', borderRadius:14 }}>
          <div style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:20, fontWeight:900, color: isDone && !winnerAway ? '#64748b' : '#e2e8f0' }}>{game.awayTeam}</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>원정</div>
            {game.awayScore != null && (
              <div style={{ fontSize:36, fontWeight:900, color: winnerAway ? '#fff' : isDone ? '#64748b' : '#e2e8f0', marginTop:4 }}>{game.awayScore}</div>
            )}
          </div>
          <div style={{ textAlign:'center', padding:'0 12px' }}>
            {isUpcoming && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f644', borderRadius:4, padding:'2px 8px', fontWeight:700 }}>예정</span>
                <div style={{ fontSize:13, color:'#e2e8f0', fontWeight:700 }}>{game.startTime}</div>
                {countdown && <div style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>⏱ {countdown}</div>}
              </div>
            )}
            {isDone && <span style={{ fontSize:11, color:'#64748b', border:'1px solid #64748b44', borderRadius:4, padding:'3px 8px' }}>종료</span>}
            {!isUpcoming && !isDone && (
              <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444444', borderRadius:4, padding:'2px 8px', fontWeight:700 }}>● LIVE</span>
            )}
          </div>
          <div style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:20, fontWeight:900, color: isDone && !winnerHome ? '#64748b' : '#e2e8f0' }}>{game.homeTeam}</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>홈</div>
            {game.homeScore != null && (
              <div style={{ fontSize:36, fontWeight:900, color: winnerHome ? '#fff' : isDone ? '#64748b' : '#e2e8f0', marginTop:4 }}>{game.homeScore}</div>
            )}
          </div>
        </div>

        {/* 선발투수 */}
        {(game.awayPitcher || game.homePitcher) && (
          <div style={{ background:'#111827', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:10 }}>⚾ 선발투수</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ textAlign:'center', flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{game.awayPitcher?.trim() || '-'}</div>
                <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{game.awayTeam}</div>
              </div>
              <div style={{ fontSize:11, color:'#475569' }}>VS</div>
              <div style={{ textAlign:'center', flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{game.homePitcher?.trim() || '-'}</div>
                <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{game.homeTeam}</div>
              </div>
            </div>
          </div>
        )}

        {/* 승패 투수 (종료 시) */}
        {isDone && (game.winPitcher || game.losePitcher) && (
          <div style={{ background:'#111827', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:10 }}>📋 투수 기록</div>
            <div style={{ display:'flex', gap:12 }}>
              {game.winPitcher && (
                <div style={{ flex:1, background:'#0f2a1a', borderRadius:8, padding:'10px 12px', border:'1px solid #10b98133' }}>
                  <div style={{ fontSize:10, color:'#10b981', fontWeight:700, marginBottom:4 }}>✓ 승리투수</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{game.winPitcher?.trim()}</div>
                </div>
              )}
              {game.losePitcher && (
                <div style={{ flex:1, background:'#1a0f0f', borderRadius:8, padding:'10px 12px', border:'1px solid #ef444433' }}>
                  <div style={{ fontSize:10, color:'#ef4444', fontWeight:700, marginBottom:4 }}>✗ 패전투수</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{game.losePitcher?.trim()}</div>
                </div>
              )}
            </div>
            {game.savePitcher && (
              <div style={{ marginTop:8, background:'#0f1a2a', borderRadius:8, padding:'10px 12px', border:'1px solid #3b82f633' }}>
                <div style={{ fontSize:10, color:'#3b82f6', fontWeight:700, marginBottom:4 }}>S 세이브</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{game.savePitcher?.trim()}</div>
              </div>
            )}
          </div>
        )}

        {/* 이닝별 점수 (있을 경우) */}
        {isDone && game.innings && game.innings.length > 0 && (
          <div style={{ background:'#111827', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:10 }}>📊 이닝별 점수</div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr>
                    <th style={{ color:'#64748b', textAlign:'left', padding:'4px 6px', minWidth:40 }}>팀</th>
                    {game.innings.map((_, i) => (
                      <th key={i} style={{ color:'#64748b', textAlign:'center', padding:'4px 4px', minWidth:22 }}>{i+1}</th>
                    ))}
                    <th style={{ color:'#e2e8f0', textAlign:'center', padding:'4px 6px', fontWeight:900 }}>R</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color:'#94a3b8', padding:'4px 6px', fontWeight:700 }}>{game.awayTeam}</td>
                    {game.innings.map((inn, i) => (
                      <td key={i} style={{ color:'#cbd5e1', textAlign:'center', padding:'4px 4px' }}>{inn.away ?? '-'}</td>
                    ))}
                    <td style={{ color:'#fff', textAlign:'center', padding:'4px 6px', fontWeight:900 }}>{game.awayScore}</td>
                  </tr>
                  <tr>
                    <td style={{ color:'#94a3b8', padding:'4px 6px', fontWeight:700 }}>{game.homeTeam}</td>
                    {game.innings.map((inn, i) => (
                      <td key={i} style={{ color:'#cbd5e1', textAlign:'center', padding:'4px 4px' }}>{inn.home ?? '-'}</td>
                    ))}
                    <td style={{ color:'#fff', textAlign:'center', padding:'4px 6px', fontWeight:900 }}>{game.homeScore}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KBO 게임센터 링크 */}
        {game.gameId && (
          <a href={`https://www.koreabaseball.com/Schedule/GameCenter/Main.aspx?gameId=${game.gameId}&leId=1&srId=0`}
            target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
            <div style={{ background:'#1e2d45', borderRadius:12, padding:'12px 16px', textAlign:'center', marginTop:8 }}>
              <span style={{ fontSize:13, color:'#3b82f6', fontWeight:700 }}>🔗 KBO 게임센터에서 자세히 보기</span>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}

function GameCard({ game, onClick }) {
  const isLive     = game.state === 'LIVE' || game.state === '경기중' || game.state === '진행중';
  const isDone     = game.state === '종료' || game.state === '경기종료' || game.state === '최종';
  const isUpcoming = !isLive && !isDone;
  const winnerAway = isDone && game.awayScore != null && game.awayScore > game.homeScore;
  const winnerHome = isDone && game.homeScore != null && game.homeScore > game.awayScore;

  // 카운트다운
  const getCountdown = () => {
    if (!isUpcoming || !game.startTime) return null;
    const now = new Date();
    const [h, m] = game.startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const diff = start - now;
    if (diff <= 0) return '곧 시작';
    const hours   = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return hours > 0 ? `${hours}시간 ${minutes}분 후` : `${minutes}분 ${seconds}초 후`;
  };

  const [countdown, setCountdown] = useState(getCountdown());
  useEffect(() => {
    if (!isUpcoming) return;
    const t = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(t);
  }, [isUpcoming]);

  return (
    <div onClick={onClick} style={{
      background: '#111827',
      border: isLive ? '1px solid #ef444444' : '1px solid #1e2d45',
      borderRadius: 14, padding: '14px', marginBottom: 10,
      cursor: 'pointer', position: 'relative', overflow: 'hidden',
    }}>
      {isLive && <div style={{ height:2, background:'linear-gradient(90deg,#ef4444,#f59e0b)', position:'absolute', top:0, left:0, right:0 }} />}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: isLive ? 6 : 0 }}>
        <div style={{ textAlign:'center', flex:1 }}>
          <div style={{ fontSize:17, fontWeight:900, color: isDone && !winnerAway ? '#64748b' : '#e2e8f0' }}>{game.awayTeam}</div>
          {game.awayScore != null && (
            <div style={{ fontSize:28, fontWeight:900, color: winnerAway ? '#ffffff' : isDone ? '#64748b' : '#e2e8f0', marginTop:2 }}>{game.awayScore}</div>
          )}
        </div>
        <div style={{ textAlign:'center', padding:'0 14px', minWidth:90 }}>
          {isLive && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444444', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>● LIVE</span>
              <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{game.inning || ''}</div>
            </div>
          )}
          {isUpcoming && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <span style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f644', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>예정</span>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{game.startTime}</div>
              {countdown && <div style={{ fontSize:10, color:'#f59e0b', fontWeight:600 }}>⏱ {countdown}</div>}
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
      {/* 선발투수 미리보기 */}
      {(game.awayPitcher || game.homePitcher) && (
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, paddingTop:8, borderTop:'1px solid #1e2d45' }}>
          <span style={{ fontSize:10, color:'#64748b' }}>⚾ {game.awayPitcher?.trim()}</span>
          <span style={{ fontSize:10, color:'#64748b' }}>vs</span>
          <span style={{ fontSize:10, color:'#64748b' }}>{game.homePitcher?.trim()} ⚾</span>
        </div>
      )}
    </div>
  );
}

function Home({ onGoLive }) {
  const [games, setGames]         = useState(FALLBACK_GAMES);
  const [hotPosts, setHotPosts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  const fetchGames = async () => {
    try {
      const today = new Date();
      const yyyy  = today.getFullYear();
      const mm    = String(today.getMonth() + 1).padStart(2, '0');
      const dd    = String(today.getDate()).padStart(2, '0');

      // KBO 공식 API로 경기 목록 + 선발투수 가져오기
      const listUrl   = `https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList?leId=1&srId=0,1,3,4,5&date=${yyyy}${mm}${dd}`;
      const proxyUrl  = `https://api.allorigins.win/get?url=${encodeURIComponent(listUrl)}`;
      const res       = await fetch(proxyUrl);
      const json      = await res.json();
      const data      = JSON.parse(json.contents);

      if (data?.game?.length > 0) {
        // 스코어보드도 가져오기
        const scoreUrl    = 'https://www.koreabaseball.com/Schedule/ScoreBoard.aspx';
        const scoreProxy  = `https://api.allorigins.win/get?url=${encodeURIComponent(scoreUrl)}`;
        const scoreRes    = await fetch(scoreProxy);
        const scoreJson   = await scoreRes.json();
        const scoreHtml   = scoreJson.contents;
        const parser      = new DOMParser();
        const doc         = parser.parseFromString(scoreHtml, 'text/html');
        const tables      = doc.querySelectorAll('.tScore');

        const scoreMap = {};
        tables.forEach((table, i) => {
          const rows = table.querySelectorAll('tbody tr');
          if (rows.length >= 2) {
            const away = rows[0].querySelector('th')?.textContent.trim();
            const home = rows[1].querySelector('th')?.textContent.trim();
            const awayScore = rows[0].querySelector('.point')?.textContent.trim();
            const homeScore = rows[1].querySelector('.point')?.textContent.trim();

            // 이닝별 점수
            const awayTds = Array.from(rows[0].querySelectorAll('td:not(.point):not(.hit)'));
            const homeTds = Array.from(rows[1].querySelectorAll('td:not(.point):not(.hit)'));
            const innings = awayTds.slice(0, 12).map((td, idx) => ({
              away: td.textContent.trim() === '-' ? null : parseInt(td.textContent.trim()),
              home: homeTds[idx]?.textContent.trim() === '-' ? null : parseInt(homeTds[idx]?.textContent.trim()),
            })).filter(inn => inn.away !== null || inn.home !== null);

            const key = `${away}-${home}`;
            scoreMap[key] = {
              awayScore: awayScore && awayScore !== '-' ? parseInt(awayScore) : null,
              homeScore: homeScore && homeScore !== '-' ? parseInt(homeScore) : null,
              innings,
            };
          }
        });

        const mapped = data.game.map((g, i) => {
          const key    = `${g.AWAY_NM?.trim()}-${g.HOME_NM?.trim()}`;
          const scores = scoreMap[key] || {};
          const hasScore = scores.awayScore != null;
          const state  = !hasScore ? '예정' : '종료';

          return {
            id: i + 1,
            gameId: g.G_ID,
            awayTeam: g.AWAY_NM?.trim(),
            homeTeam: g.HOME_NM?.trim(),
            awayScore: scores.awayScore ?? null,
            homeScore: scores.homeScore ?? null,
            innings: scores.innings || [],
            state,
            startTime: g.G_TM,
            stadium: g.S_NM,
            awayPitcher: g.T_PIT_P_NM,
            homePitcher: g.B_PIT_P_NM,
            winPitcher: g.W_PIT_P_NM,
            losePitcher: g.L_PIT_P_NM,
            savePitcher: g.S_PIT_P_NM,
          };
        });
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
    const interval = setInterval(fetchGames, 60000);
    return () => clearInterval(interval);
  }, []);

  const today   = new Date();
  const dateStr = `${today.getMonth()+1}월 ${today.getDate()}일`;
  const hasLive = games.some(g => g.state === 'LIVE' || g.state === '경기중');

  return (
    <div style={{ padding:'16px 16px 80px' }}>
      {selectedGame && (
        <GameDetailModal game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700 }}>TODAY'S GAMES</div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {hasLive && <span style={{ fontSize:10, color:'#ef4444', fontWeight:700 }}>● LIVE</span>}
          <span style={{ fontSize:11, color:'#475569' }}>{dateStr}</span>
        </div>
      </div>

      {games.map(game => (
        <GameCard
          key={game.id}
          game={game}
          onClick={() => setSelectedGame(game)}
        />
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