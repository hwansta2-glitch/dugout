import { useState, useEffect, useCallback } from 'react';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

const FALLBACK_GAMES = [
  { id:1, gameId:'', awayTeam:'KT',   homeTeam:'LG',   awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'잠실', awayPitcher:'', homePitcher:'' },
  { id:2, gameId:'', awayTeam:'키움', homeTeam:'한화',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'대전', awayPitcher:'', homePitcher:'' },
  { id:3, gameId:'', awayTeam:'KIA',  homeTeam:'SSG',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'문학', awayPitcher:'', homePitcher:'' },
  { id:4, gameId:'', awayTeam:'롯데', homeTeam:'삼성',  awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'대구', awayPitcher:'', homePitcher:'' },
  { id:5, gameId:'', awayTeam:'두산', homeTeam:'NC',   awayScore:null, homeScore:null, state:'예정', startTime:'14:00', stadium:'창원', awayPitcher:'', homePitcher:'' },
];

function toDateStr(date) {
  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const dd   = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function toDisplayStr(date) {
  return `${date.getMonth()+1}월 ${date.getDate()}일`;
}

// ── 경기 상세 모달 ──────────────────────────────────
function GameDetailModal({ game, onClose }) {
  const isDone     = game.state === '종료' || game.state === '경기종료' || game.state === '최종';
  const isUpcoming = !isDone && game.awayScore == null;
  const winnerAway = isDone && game.awayScore > game.homeScore;
  const winnerHome = isDone && game.homeScore > game.awayScore;

  const getCountdown = useCallback(() => {
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
  }, [isUpcoming, game.startTime]);

  const [countdown, setCountdown] = useState(getCountdown());
  useEffect(() => {
    if (!isUpcoming) return;
    const t = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(t);
  }, [isUpcoming, getCountdown]);

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:200, display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', background:'#0f172a', borderRadius:'20px 20px 0 0', padding:'20px 16px 44px', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <span style={{ fontSize:13, color:'#64748b' }}>{game.stadium} · {game.startTime}</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        {/* 점수판 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, padding:'16px', background:'#111827', borderRadius:14 }}>
          <div style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:20, fontWeight:900, color: isDone && !winnerAway ? '#64748b' : '#e2e8f0' }}>{game.awayTeam}</div>
            <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>원정</div>
            {game.awayScore != null && <div style={{ fontSize:36, fontWeight:900, color: winnerAway ? '#fff' : isDone ? '#64748b' : '#e2e8f0', marginTop:4 }}>{game.awayScore}</div>}
          </div>
          <div style={{ textAlign:'center', padding:'0 12px' }}>
            {isUpcoming && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                <span style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f644', borderRadius:4, padding:'2px 8px', fontWeight:700 }}>예정</span>
                <div style={{ fontSize:14, color:'#e2e8f0', fontWeight:700 }}>{game.startTime}</div>
                {countdown && <div style={{ fontSize:12, color:'#f59e0b', fontWeight:700 }}>⏱ {countdown}</div>}
              </div>
            )}
            {isDone && <span style={{ fontSize:11, color:'#64748b', border:'1px solid #64748b44', borderRadius:4, padding:'3px 8px' }}>종료</span>}
            {!isUpcoming && !isDone && <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444444', borderRadius:4, padding:'2px 8px', fontWeight:700 }}>● LIVE</span>}
          </div>
          <div style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:20, fontWeight:900, color: isDone && !winnerHome ? '#64748b' : '#e2e8f0' }}>{game.homeTeam}</div>
            <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>홈</div>
            {game.homeScore != null && <div style={{ fontSize:36, fontWeight:900, color: winnerHome ? '#fff' : isDone ? '#64748b' : '#e2e8f0', marginTop:4 }}>{game.homeScore}</div>}
          </div>
        </div>

        {/* 선발투수 */}
        {(game.awayPitcher || game.homePitcher) && (
          <div style={{ background:'#111827', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:10 }}>⚾ 선발투수</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ textAlign:'center', flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>{game.awayPitcher?.trim() || '-'}</div>
                <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{game.awayTeam}</div>
              </div>
              <div style={{ fontSize:11, color:'#475569' }}>VS</div>
              <div style={{ textAlign:'center', flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>{game.homePitcher?.trim() || '-'}</div>
                <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{game.homeTeam}</div>
              </div>
            </div>
          </div>
        )}

        {/* 승패 투수 */}
        {isDone && (game.winPitcher || game.losePitcher) && (
          <div style={{ background:'#111827', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:10 }}>📋 투수 기록</div>
            <div style={{ display:'flex', gap:10 }}>
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

        {/* 이닝별 점수 */}
        {isDone && game.innings && game.innings.length > 0 && (
          <div style={{ background:'#111827', borderRadius:12, padding:'14px 16px', marginBottom:12, overflowX:'auto' }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:10 }}>📊 이닝별 점수</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, minWidth:320 }}>
              <thead>
                <tr>
                  <th style={{ color:'#64748b', textAlign:'left', padding:'4px 6px', minWidth:36 }}>팀</th>
                  {game.innings.map((_, i) => (
                    <th key={i} style={{ color:'#64748b', textAlign:'center', padding:'4px 3px', minWidth:20 }}>{i+1}</th>
                  ))}
                  <th style={{ color:'#e2e8f0', textAlign:'center', padding:'4px 6px', fontWeight:900, minWidth:24 }}>R</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color:'#94a3b8', padding:'4px 6px', fontWeight:700 }}>{game.awayTeam}</td>
                  {game.innings.map((inn, i) => (
                    <td key={i} style={{ color:'#cbd5e1', textAlign:'center', padding:'4px 3px' }}>{inn.away ?? '-'}</td>
                  ))}
                  <td style={{ color:'#fff', textAlign:'center', padding:'4px 6px', fontWeight:900 }}>{game.awayScore}</td>
                </tr>
                <tr>
                  <td style={{ color:'#94a3b8', padding:'4px 6px', fontWeight:700 }}>{game.homeTeam}</td>
                  {game.innings.map((inn, i) => (
                    <td key={i} style={{ color:'#cbd5e1', textAlign:'center', padding:'4px 3px' }}>{inn.home ?? '-'}</td>
                  ))}
                  <td style={{ color:'#fff', textAlign:'center', padding:'4px 6px', fontWeight:900 }}>{game.homeScore}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* KBO 게임센터 링크 */}
        {game.gameId && (
          <a href={`https://www.koreabaseball.com/Schedule/GameCenter/Main.aspx?gameId=${game.gameId}&leId=1&srId=0`}
            target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
            <div style={{ background:'#1e2d45', borderRadius:12, padding:'12px 16px', textAlign:'center' }}>
              <span style={{ fontSize:13, color:'#3b82f6', fontWeight:700 }}>🔗 KBO 게임센터에서 자세히 보기</span>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}

// ── 월간 일정 모달 ──────────────────────────────────
function ScheduleModal({ onClose, onSelectDate }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading]   = useState(true);

  const fetchMonthSchedule = useCallback(async (y, m) => {
    setLoading(true);
    try {
      const mm = String(m + 1).padStart(2, '0');
      const url = `https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList?leId=1&srId=0,1,3,4,5&date=${y}${mm}01`;
      // 월 전체 날짜 순회하며 경기 있는 날 파악
      const days = new Date(y, m + 1, 0).getDate();
      const dateMap = {};
      // 샘플 날짜로 API 호출 (월 첫날)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res  = await fetch(proxyUrl);
      const json = await res.json();
      const data = JSON.parse(json.contents);
      if (data?.game) {
        data.game.forEach(g => {
          const d = g.G_DT;
          if (!dateMap[d]) dateMap[d] = [];
          dateMap[d].push(`${g.AWAY_NM} vs ${g.HOME_NM}`);
        });
      }
      // 추가로 월말도 조회
      const lastUrl   = `https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList?leId=1&srId=0,1,3,4,5&date=${y}${mm}${String(days).padStart(2,'0')}`;
      const lastProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(lastUrl)}`;
      const lastRes   = await fetch(lastProxy);
      const lastJson  = await lastRes.json();
      const lastData  = JSON.parse(lastJson.contents);
      if (lastData?.game) {
        lastData.game.forEach(g => {
          const d = g.G_DT;
          if (!dateMap[d]) dateMap[d] = [];
          if (!dateMap[d].includes(`${g.AWAY_NM} vs ${g.HOME_NM}`)) {
            dateMap[d].push(`${g.AWAY_NM} vs ${g.HOME_NM}`);
          }
        });
      }
      setSchedule(dateMap);
    } catch(e) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchMonthSchedule(year, month); }, [year, month, fetchMonthSchedule]);

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toDateStr(today);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:300, display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', background:'#0f172a', borderRadius:'20px 20px 0 0', padding:'20px 16px 44px', maxHeight:'85vh', overflowY:'auto' }}>
        {/* 헤더 */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>📅 KBO 경기 일정</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        {/* 월 네비게이터 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, background:'#111827', borderRadius:10, padding:'10px 16px' }}>
          <button onClick={prevMonth} style={{ background:'transparent', border:'none', color:'#94a3b8', fontSize:18, cursor:'pointer' }}>‹</button>
          <span style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>{year}년 {month+1}월</span>
          <button onClick={nextMonth} style={{ background:'transparent', border:'none', color:'#94a3b8', fontSize:18, cursor:'pointer' }}>›</button>
        </div>

        {/* 요일 헤더 */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
          {['일','월','화','수','목','금','토'].map((d,i) => (
            <div key={d} style={{ textAlign:'center', fontSize:11, color: i===0?'#ef4444':i===6?'#3b82f6':'#64748b', padding:'4px 0', fontWeight:700 }}>{d}</div>
          ))}
        </div>

        {/* 캘린더 */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'30px 0', color:'#64748b', fontSize:13 }}>불러오는 중...</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const mm      = String(month+1).padStart(2,'0');
              const dd      = String(day).padStart(2,'0');
              const dateKey = `${year}${mm}${dd}`;
              const hasGame = schedule[dateKey]?.length > 0;
              const isToday = dateKey === todayStr;
              const dow     = (firstDay + day - 1) % 7;

              return (
                <div key={day} onClick={() => { if (hasGame) { onSelectDate(new Date(year, month, day)); onClose(); } }}
                  style={{
                    textAlign:'center', padding:'8px 2px', borderRadius:8, cursor: hasGame ? 'pointer' : 'default',
                    background: isToday ? '#1e3a5f' : hasGame ? '#111827' : 'transparent',
                    border: isToday ? '1px solid #3b82f6' : hasGame ? '1px solid #1e2d45' : '1px solid transparent',
                  }}>
                  <div style={{ fontSize:13, fontWeight: isToday ? 900 : 400, color: isToday ? '#3b82f6' : dow===0 ? '#ef4444' : dow===6 ? '#60a5fa' : '#e2e8f0' }}>{day}</div>
                  {hasGame && <div style={{ width:5, height:5, borderRadius:'50%', background:'#ef4444', margin:'3px auto 0' }} />}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop:14, fontSize:11, color:'#475569', textAlign:'center' }}>
          🔴 경기 있는 날을 탭하면 해당 날짜로 이동해요
        </div>
      </div>
    </div>
  );
}

// ── 게임 카드 ───────────────────────────────────────
function GameCard({ game, onClick }) {
  const isLive     = game.state === 'LIVE' || game.state === '경기중' || game.state === '진행중';
  const isDone     = game.state === '종료' || game.state === '경기종료' || game.state === '최종';
  const isUpcoming = !isLive && !isDone;
  const winnerAway = isDone && game.awayScore != null && game.awayScore > game.homeScore;
  const winnerHome = isDone && game.homeScore != null && game.homeScore > game.awayScore;

  const getCountdown = useCallback(() => {
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
  }, [isUpcoming, game.startTime]);

  const [countdown, setCountdown] = useState(getCountdown());
  useEffect(() => {
    if (!isUpcoming) return;
    const t = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(t);
  }, [isUpcoming, getCountdown]);

  return (
    <div onClick={onClick} style={{
      background:'#111827', border: isLive ? '1px solid #ef444444' : '1px solid #1e2d45',
      borderRadius:14, padding:'14px', marginBottom:10,
      cursor:'pointer', position:'relative', overflow:'hidden',
    }}>
      {isLive && <div style={{ height:2, background:'linear-gradient(90deg,#ef4444,#f59e0b)', position:'absolute', top:0, left:0, right:0 }} />}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: isLive ? 6 : 0 }}>
        <div style={{ textAlign:'center', flex:1 }}>
          <div style={{ fontSize:17, fontWeight:900, color: isDone && !winnerAway ? '#64748b' : '#e2e8f0' }}>{game.awayTeam}</div>
          {game.awayScore != null && <div style={{ fontSize:28, fontWeight:900, color: winnerAway ? '#fff' : isDone ? '#64748b' : '#e2e8f0', marginTop:2 }}>{game.awayScore}</div>}
        </div>
        <div style={{ textAlign:'center', padding:'0 12px', minWidth:90 }}>
          {isLive && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444444', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>● LIVE</span>
              {game.inning && <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{game.inning}</div>}
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
          {game.homeScore != null && <div style={{ fontSize:28, fontWeight:900, color: winnerHome ? '#fff' : isDone ? '#64748b' : '#e2e8f0', marginTop:2 }}>{game.homeScore}</div>}
        </div>
      </div>
      {(game.awayPitcher || game.homePitcher) && (
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, paddingTop:8, borderTop:'1px solid #1e2d45' }}>
          <span style={{ fontSize:10, color:'#64748b' }}>⚾ {game.awayPitcher?.trim()}</span>
          <span style={{ fontSize:10, color:'#475569' }}>vs</span>
          <span style={{ fontSize:10, color:'#64748b' }}>{game.homePitcher?.trim()} ⚾</span>
        </div>
      )}
    </div>
  );
}

// ── 메인 Home ───────────────────────────────────────
function Home({ onGoLive }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [games, setGames]               = useState(FALLBACK_GAMES);
  const [hotPosts, setHotPosts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const fetchGames = useCallback(async (date) => {
    setGamesLoading(true);
    try {
      const dateStr  = toDateStr(date);
      const listUrl  = `https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList?leId=1&srId=0,1,3,4,5&date=${dateStr}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(listUrl)}`;
      const res      = await fetch(proxyUrl);
      const json     = await res.json();
      const data     = JSON.parse(json.contents);

      if (data?.game?.length > 0) {
        // 스코어보드 (오늘 날짜만)
        let scoreMap = {};
        const isToday = toDateStr(date) === toDateStr(today);
        if (isToday) {
          try {
            const scoreUrl   = 'https://www.koreabaseball.com/Schedule/ScoreBoard.aspx';
            const scoreProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(scoreUrl)}`;
            const scoreRes   = await fetch(scoreProxy);
            const scoreJson  = await scoreRes.json();
            const parser     = new DOMParser();
            const doc        = parser.parseFromString(scoreJson.contents, 'text/html');
            const tables     = doc.querySelectorAll('.tScore');
            tables.forEach(table => {
              const rows = table.querySelectorAll('tbody tr');
              if (rows.length >= 2) {
                const away      = rows[0].querySelector('th')?.textContent.trim();
                const home      = rows[1].querySelector('th')?.textContent.trim();
                const awayScore = rows[0].querySelector('.point')?.textContent.trim();
                const homeScore = rows[1].querySelector('.point')?.textContent.trim();
                const awayTds   = Array.from(rows[0].querySelectorAll('td:not(.point):not(.hit)'));
                const homeTds   = Array.from(rows[1].querySelectorAll('td:not(.point):not(.hit)'));
                const innings   = awayTds.slice(0,12).map((td,idx) => ({
                  away: td.textContent.trim() === '-' ? null : parseInt(td.textContent.trim()),
                  home: homeTds[idx]?.textContent.trim() === '-' ? null : parseInt(homeTds[idx]?.textContent.trim()),
                })).filter(inn => inn.away !== null || inn.home !== null);
                scoreMap[`${away}-${home}`] = {
                  awayScore: awayScore && awayScore !== '-' ? parseInt(awayScore) : null,
                  homeScore: homeScore && homeScore !== '-' ? parseInt(homeScore) : null,
                  innings,
                };
              }
            });
          } catch(e) {}
        }

        const mapped = data.game.map((g, i) => {
          const key    = `${g.AWAY_NM?.trim()}-${g.HOME_NM?.trim()}`;
          const scores = scoreMap[key] || {};
          const hasScore = scores.awayScore != null;
          const state  = !hasScore ? '예정' : '종료';
          return {
            id: i+1, gameId: g.G_ID,
            awayTeam: g.AWAY_NM?.trim(), homeTeam: g.HOME_NM?.trim(),
            awayScore: scores.awayScore ?? null, homeScore: scores.homeScore ?? null,
            innings: scores.innings || [], state,
            startTime: g.G_TM, stadium: g.S_NM,
            awayPitcher: g.T_PIT_P_NM, homePitcher: g.B_PIT_P_NM,
            winPitcher: g.W_PIT_P_NM, losePitcher: g.L_PIT_P_NM, savePitcher: g.S_PIT_P_NM,
          };
        });
        setGames(mapped);
      } else {
        setGames([]);
      }
    } catch(e) { console.log('경기 데이터 불러오기 실패:', e); }
    setGamesLoading(false);
  }, [today]);

  const fetchHotPosts = async () => {
    try {
      const res  = await fetch(`${SERVER}/api/posts`);
      const data = await res.json();
      if (data.success && data.data) {
        setHotPosts(data.data.filter(p => (p.likes ?? 0) >= 1).slice(0, 5));
      }
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchGames(selectedDate);
    fetchHotPosts();
  }, []);

  useEffect(() => {
    fetchGames(selectedDate);
  }, [selectedDate, fetchGames]);

  useEffect(() => {
    const isToday = toDateStr(selectedDate) === toDateStr(today);
    if (!isToday) return;
    const interval = setInterval(() => fetchGames(selectedDate), 60000);
    return () => clearInterval(interval);
  }, [selectedDate, fetchGames, today]);

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d); };
  const isToday = toDateStr(selectedDate) === toDateStr(today);
  const hasLive = games.some(g => g.state === 'LIVE' || g.state === '경기중');

  return (
    <div style={{ padding:'16px 16px 80px' }}>
      {selectedGame && <GameDetailModal game={selectedGame} onClose={() => setSelectedGame(null)} />}
      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} onSelectDate={d => { setSelectedDate(d); setShowSchedule(false); }} />}

      {/* 날짜 네비게이터 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700 }}>TODAY'S GAMES</div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {hasLive && <span style={{ fontSize:10, color:'#ef4444', fontWeight:700, marginRight:4 }}>● LIVE</span>}
          <button onClick={prevDay} style={{ background:'transparent', border:'none', color:'#64748b', fontSize:16, cursor:'pointer', padding:'2px 6px' }}>‹</button>
          <button onClick={() => setShowSchedule(true)} style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:8, padding:'4px 10px', color: isToday ? '#3b82f6' : '#e2e8f0', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {isToday ? '오늘 ' : ''}{toDisplayStr(selectedDate)} 📅
          </button>
          <button onClick={nextDay} style={{ background:'transparent', border:'none', color:'#64748b', fontSize:16, cursor:'pointer', padding:'2px 6px' }}>›</button>
        </div>
      </div>

      {/* 경기 목록 */}
      {gamesLoading && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b', fontSize:13 }}>경기 정보 불러오는 중...</div>
      )}
      {!gamesLoading && games.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b', fontSize:13 }}>
          이 날은 경기가 없어요 ⚾<br/>
          <span style={{ fontSize:11, color:'#475569' }}>📅 달력에서 경기 있는 날을 확인하세요</span>
        </div>
      )}
      {!gamesLoading && games.map(game => (
        <GameCard key={game.id} game={game} onClick={() => setSelectedGame(game)} />
      ))}

      {/* HOT 게시글 */}
      {!loading && hotPosts.length > 0 && (
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700, marginBottom:10 }}>🔥 HOT 게시글</div>
          {hotPosts.map((post, i) => (
            <div key={post.id} style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:12, padding:'11px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
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
        <div style={{ marginTop:20, textAlign:'center', padding:'20px 0', color:'#475569', fontSize:12 }}>아직 인기 게시글이 없어요 ⚾</div>
      )}
    </div>
  );
}

export default Home;