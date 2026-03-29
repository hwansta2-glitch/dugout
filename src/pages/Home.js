import { useState, useEffect, useRef } from 'react';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

// today는 모듈 레벨에서 한 번만 생성
const TODAY = new Date();

// 날씨 캐시
const weatherCache = {};

// 경기장 좌표
const STADIUM_COORDS = {
  '잠실':  { lat: 37.5122, lon: 127.0722 },
  '수원':  { lat: 37.2970, lon: 127.0100 },
  '인천':  { lat: 37.4359, lon: 126.6932 },
  '문학':  { lat: 37.4359, lon: 126.6932 },
  '대전':  { lat: 36.3170, lon: 127.4288 },
  '광주':  { lat: 35.1685, lon: 126.8889 },
  '대구':  { lat: 35.8411, lon: 128.6814 },
  '창원':  { lat: 35.2225, lon: 128.5822 },
  '사직':  { lat: 35.1940, lon: 129.0613 },
  '고척':  { lat: 37.4982, lon: 126.8672 },
  '포항':  { lat: 36.0104, lon: 129.3608 },
};

function getWeatherEmoji(code, rain) {
  if (rain >= 50) return '🌧️';
  if (rain >= 30) return '🌦️';
  if (code <= 1)  return '☀️';
  if (code <= 3)  return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  return '🌩️';
}

const TEAM_MAP = {
  'LG 트윈스':'LG', 'KIA 타이거즈':'KIA', '삼성 라이온즈':'삼성',
  '두산 베어스':'두산', 'KT 위즈':'KT', 'SSG 랜더스':'SSG',
  '롯데 자이언츠':'롯데', '한화 이글스':'한화', 'NC 다이노스':'NC', '키움 히어로즈':'키움',
};

function toDateStr(date) {
  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth()+1).padStart(2,'0');
  const dd   = String(date.getDate()).padStart(2,'0');
  return `${yyyy}${mm}${dd}`;
}

function toDisplayStr(date) {
  return `${date.getMonth()+1}월 ${date.getDate()}일`;
}

function isSameDay(a, b) {
  return toDateStr(a) === toDateStr(b);
}

// ── 카운트다운 훅 ────────────────────────────────────
function useCountdown(startTime, active, dateStr) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!active || !startTime || !dateStr) return;
    const calc = () => {
      const now = new Date();
      const [h, m] = startTime.split(':').map(Number);
      const yr = parseInt(dateStr.slice(0,4));
      const mo = parseInt(dateStr.slice(4,6)) - 1;
      const dy = parseInt(dateStr.slice(6,8));
      const start = new Date(yr, mo, dy, h, m, 0);
      const diff = start - now;
      if (diff <= 0) { setText('곧 시작'); return; }
      const totalMins = Math.floor(diff / 60000);
      const hours   = Math.floor(totalMins / 60);
      const minutes = totalMins % 60;
      const seconds = Math.floor((diff % 60000) / 1000);
      if (hours >= 24) { setText(''); return; }
      setText(hours > 0 ? `${hours}시간 ${minutes}분 후` : `${minutes}분 ${seconds}초 후`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [active, startTime, dateStr]);
  return text;
}

// ── 게임 상세 모달 ───────────────────────────────────
function GameDetailModal({ game, onClose }) {
  const isDone     = game.state === '종료';
  const isUpcoming = !isDone && game.awayScore == null;
  const winnerAway = isDone && game.awayScore > game.homeScore;
  const winnerHome = isDone && game.homeScore > game.awayScore;
  const countdown  = useCountdown(game.startTime, isUpcoming && (() => { const t=new Date(); const ts=`${t.getFullYear()}${String(t.getMonth()+1).padStart(2,'0')}${String(t.getDate()).padStart(2,'0')}`; return game.dateStr >= ts; })(), game.dateStr);

  return (
    <div style={{ position:'fixed', inset:0, background:'#000c', zIndex:200, display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', background:'#0f172a', borderRadius:'20px 20px 0 0', padding:'20px 16px 44px', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <span style={{ fontSize:13, color:'#64748b' }}>{game.stadium} · {game.startTime}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        {/* 점수 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#111827', borderRadius:14, padding:16, marginBottom:14 }}>
          <div style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:20, fontWeight:900, color: isDone&&!winnerAway?'#64748b':'#e2e8f0' }}>{game.awayTeam}</div>
            <div style={{ fontSize:11, color:'#64748b' }}>원정</div>
            {game.awayScore != null && <div style={{ fontSize:36, fontWeight:900, color: winnerAway?'#fff':isDone?'#64748b':'#e2e8f0', marginTop:4 }}>{game.awayScore}</div>}
          </div>
          <div style={{ textAlign:'center', minWidth:80 }}>
            {isUpcoming && <>
              <div style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f644', borderRadius:4, padding:'2px 8px', fontWeight:700, display:'inline-block' }}>예정</div>
              <div style={{ fontSize:13, color:'#e2e8f0', fontWeight:700, marginTop:4 }}>{game.startTime}</div>
              {countdown && <div style={{ fontSize:12, color:'#f59e0b', fontWeight:700, marginTop:2 }}>⏱ {countdown}</div>}
            </>}
            {isDone && <div style={{ fontSize:11, color:'#64748b', border:'1px solid #64748b44', borderRadius:4, padding:'3px 8px', display:'inline-block' }}>종료</div>}
            {!isUpcoming && !isDone && <div style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444433', borderRadius:4, padding:'2px 8px', fontWeight:700, display:'inline-block' }}>● LIVE</div>}
          </div>
          <div style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:20, fontWeight:900, color: isDone&&!winnerHome?'#64748b':'#e2e8f0' }}>{game.homeTeam}</div>
            <div style={{ fontSize:11, color:'#64748b' }}>홈</div>
            {game.homeScore != null && <div style={{ fontSize:36, fontWeight:900, color: winnerHome?'#fff':isDone?'#64748b':'#e2e8f0', marginTop:4 }}>{game.homeScore}</div>}
          </div>
        </div>

        {/* 선발투수 */}
        {(game.awayPitcher || game.homePitcher) && (
          <div style={{ background:'#111827', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:10 }}>⚾ 선발투수</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ textAlign:'center', flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>{game.awayPitcher?.trim()||'-'}</div>
                <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{game.awayTeam}</div>
              </div>
              <div style={{ fontSize:11, color:'#475569' }}>VS</div>
              <div style={{ textAlign:'center', flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>{game.homePitcher?.trim()||'-'}</div>
                <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{game.homeTeam}</div>
              </div>
            </div>
          </div>
        )}

        {/* 승패투수 */}
        {isDone && (game.winPitcher || game.losePitcher) && (
          <div style={{ background:'#111827', borderRadius:12, padding:'14px 16px', marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:10 }}>📋 투수 기록</div>
            <div style={{ display:'flex', gap:10 }}>
              {game.winPitcher && <div style={{ flex:1, background:'#0f2a1a', borderRadius:8, padding:'10px 12px', border:'1px solid #10b98133' }}>
                <div style={{ fontSize:10, color:'#10b981', fontWeight:700, marginBottom:4 }}>✓ 승리투수</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{game.winPitcher?.trim()}</div>
              </div>}
              {game.losePitcher && <div style={{ flex:1, background:'#1a0f0f', borderRadius:8, padding:'10px 12px', border:'1px solid #ef444433' }}>
                <div style={{ fontSize:10, color:'#ef4444', fontWeight:700, marginBottom:4 }}>✗ 패전투수</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{game.losePitcher?.trim()}</div>
              </div>}
            </div>
            {game.savePitcher && <div style={{ marginTop:8, background:'#0f1a2a', borderRadius:8, padding:'10px 12px', border:'1px solid #3b82f633' }}>
              <div style={{ fontSize:10, color:'#3b82f6', fontWeight:700, marginBottom:4 }}>S 세이브</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{game.savePitcher?.trim()}</div>
            </div>}
          </div>
        )}

        {/* 이닝별 점수 */}
        {isDone && game.innings?.length > 0 && (
          <div style={{ background:'#111827', borderRadius:12, padding:'14px 16px', marginBottom:12, overflowX:'auto' }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:10 }}>📊 이닝별 점수</div>
            <table style={{ borderCollapse:'collapse', fontSize:11, minWidth:300 }}>
              <thead><tr>
                <th style={{ color:'#64748b', textAlign:'left', padding:'4px 6px', minWidth:36 }}>팀</th>
                {game.innings.map((_,i) => <th key={i} style={{ color:'#64748b', textAlign:'center', padding:'4px 3px', minWidth:20 }}>{i+1}</th>)}
                <th style={{ color:'#e2e8f0', textAlign:'center', padding:'4px 6px', fontWeight:900 }}>R</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td style={{ color:'#94a3b8', padding:'4px 6px', fontWeight:700 }}>{game.awayTeam}</td>
                  {game.innings.map((inn,i) => <td key={i} style={{ color:'#cbd5e1', textAlign:'center', padding:'4px 3px' }}>{inn.away??'-'}</td>)}
                  <td style={{ color:'#fff', textAlign:'center', padding:'4px 6px', fontWeight:900 }}>{game.awayScore}</td>
                </tr>
                <tr>
                  <td style={{ color:'#94a3b8', padding:'4px 6px', fontWeight:700 }}>{game.homeTeam}</td>
                  {game.innings.map((inn,i) => <td key={i} style={{ color:'#cbd5e1', textAlign:'center', padding:'4px 3px' }}>{inn.home??'-'}</td>)}
                  <td style={{ color:'#fff', textAlign:'center', padding:'4px 6px', fontWeight:900 }}>{game.homeScore}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {game.gameId && (
          <a href={`https://www.koreabaseball.com/Schedule/GameCenter/Main.aspx?gameId=${game.gameId}&leId=1&srId=0`} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
            <div style={{ background:'#1e2d45', borderRadius:12, padding:'12px 16px', textAlign:'center' }}>
              <span style={{ fontSize:13, color:'#3b82f6', fontWeight:700 }}>🔗 KBO 게임센터에서 자세히 보기</span>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}

// ── 월간 캘린더 모달 ─────────────────────────────────
function ScheduleModal({ onClose, onSelectDate }) {
  const [year, setYear]     = useState(TODAY.getFullYear());
  const [month, setMonth]   = useState(TODAY.getMonth());
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setSchedule({});
      try {
        const mm      = String(month+1).padStart(2,'0');
        const days    = new Date(year, month+1, 0).getDate();
        const dateMap = {};
        // 첫날 + 마지막날 두 번 조회로 월 전체 커버
        const dates = [`${year}${mm}01`, `${year}${mm}${String(days).padStart(2,'0')}`];
        for (const d of dates) {
          const url   = `https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList?leId=1&srId=0,1,3,4,5&date=${d}`;
          const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
          const res   = await fetch(proxy);
          const json  = await res.json();
          const data  = JSON.parse(json.contents);
          if (data?.game) {
            data.game.forEach(g => {
              const key = g.G_DT;
              if (!dateMap[key]) dateMap[key] = 0;
              dateMap[key]++;
            });
          }
        }
        if (!cancelled) setSchedule(dateMap);
      } catch(e) {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [year, month]);

  const prevMonth = () => month === 0 ? (setYear(y=>y-1), setMonth(11)) : setMonth(m=>m-1);
  const nextMonth = () => month === 11 ? (setYear(y=>y+1), setMonth(0)) : setMonth(m=>m+1);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const todayStr    = toDateStr(TODAY);
  const cells       = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  return (
    <div style={{ position:'fixed', inset:0, background:'#000c', zIndex:300, display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', background:'#0f172a', borderRadius:'20px 20px 0 0', padding:'20px 16px 44px', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>📅 KBO 경기 일정</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#111827', borderRadius:10, padding:'10px 16px', marginBottom:16 }}>
          <button onClick={prevMonth} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:20, cursor:'pointer' }}>‹</button>
          <span style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>{year}년 {month+1}월</span>
          <button onClick={nextMonth} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:20, cursor:'pointer' }}>›</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
          {['일','월','화','수','목','금','토'].map((d,i) => (
            <div key={d} style={{ textAlign:'center', fontSize:11, color:i===0?'#ef4444':i===6?'#60a5fa':'#64748b', padding:'4px 0', fontWeight:700 }}>{d}</div>
          ))}
        </div>
        {loading
          ? <div style={{ textAlign:'center', padding:'30px 0', color:'#64748b', fontSize:13 }}>불러오는 중...</div>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
              {cells.map((day,i) => {
                if (!day) return <div key={`e${i}`} />;
                const mm      = String(month+1).padStart(2,'0');
                const dd      = String(day).padStart(2,'0');
                const dateKey = `${year}${mm}${dd}`;
                const hasGame = !!schedule[dateKey];
                const isToday = dateKey === todayStr;
                const dow     = (firstDay + day - 1) % 7;
                return (
                  <div key={day} onClick={() => { if (hasGame) { onSelectDate(new Date(year,month,day)); onClose(); }}}
                    style={{ textAlign:'center', padding:'8px 2px', borderRadius:8, cursor:hasGame?'pointer':'default',
                      background:isToday?'#1e3a5f':hasGame?'#111827':'transparent',
                      border:isToday?'1px solid #3b82f6':hasGame?'1px solid #1e2d45':'1px solid transparent' }}>
                    <div style={{ fontSize:13, fontWeight:isToday?900:400, color:isToday?'#3b82f6':dow===0?'#ef4444':dow===6?'#60a5fa':'#e2e8f0' }}>{day}</div>
                    {hasGame && <div style={{ width:5, height:5, borderRadius:'50%', background:'#ef4444', margin:'2px auto 0' }} />}
                  </div>
                );
              })}
            </div>
        }
        <div style={{ marginTop:14, fontSize:11, color:'#475569', textAlign:'center' }}>🔴 경기 있는 날을 탭하면 해당 날짜로 이동해요</div>
      </div>
    </div>
  );
}

// ── 게임 카드 ────────────────────────────────────────
function GameCard({ game, onClick, isMyTeam }) {
  const isLive     = game.state === 'LIVE' || game.state === '경기중';
  const isDone     = game.state === '종료';
  const isUpcoming = !isLive && !isDone;
  const winnerAway = isDone && (
    game.awayScore != null ? game.awayScore > game.homeScore :
    game.winPitcher && game.awayPitcher && game.winPitcher.trim() === game.awayPitcher.trim()
  );
  const winnerHome = isDone && (
    game.homeScore != null ? game.homeScore > game.awayScore :
    game.winPitcher && game.homePitcher && game.winPitcher.trim() === game.homePitcher.trim()
  );
  const countdown = useCountdown(
    game.startTime,
    isUpcoming && (() => { const t=new Date(); const ts=`${t.getFullYear()}${String(t.getMonth()+1).padStart(2,'0')}${String(t.getDate()).padStart(2,'0')}`; return game.dateStr >= ts; })(),
    game.dateStr
  );

  return (
    <div onClick={onClick} style={{
      background: isMyTeam ? '#0f1f35' : '#111827',
      border: isLive ? '1px solid #ef444444' : isMyTeam ? '1px solid #3b82f6' : '1px solid #1e2d45',
      borderRadius:14, padding:14, marginBottom:10, cursor:'pointer', position:'relative', overflow:'hidden'
    }}>
      {isMyTeam && !isLive && <div style={{ height:2, background:'linear-gradient(90deg,#3b82f6,#8b5cf6)', position:'absolute', top:0, left:0, right:0 }} />}
      {isMyTeam && <div style={{ position:'absolute', top:8, right:10, fontSize:9, color:'#3b82f6', fontWeight:700, letterSpacing:1 }}>⭐ 내 팀</div>}
      {isLive && <div style={{ height:2, background:'linear-gradient(90deg,#ef4444,#f59e0b)', position:'absolute', top:0, left:0, right:0 }} />}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:isLive?6:0 }}>
        <div style={{ textAlign:'center', flex:1 }}>
          <div style={{ fontSize:10, color:'#475569', fontWeight:600, marginBottom:3 }}>원정</div>
          <div style={{ fontSize:17, fontWeight:900, color:isDone&&!winnerAway?'#64748b':'#e2e8f0' }}>{game.awayTeam}</div>
          {game.awayScore != null && <div style={{ fontSize:28, fontWeight:900, color:winnerAway?'#fff':isDone?'#64748b':'#e2e8f0', marginTop:2 }}>{game.awayScore}</div>}
          {isDone && game.awayScore == null && winnerAway && <div style={{ fontSize:11, color:'#10b981', fontWeight:700, marginTop:3 }}>승</div>}
          {isDone && game.awayScore == null && !winnerAway && game.winPitcher && <div style={{ fontSize:11, color:'#64748b', marginTop:3 }}>패</div>}
        </div>
        <div style={{ textAlign:'center', padding:'0 12px', minWidth:90 }}>
          {isLive && <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
            <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444433', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>● LIVE</span>
            {game.inning && <div style={{ fontSize:11, color:'#94a3b8' }}>{game.inning}</div>}
            {game.stadium && <div style={{ fontSize:10, color:'#475569' }}>🏟 {game.stadium} {game.weather}</div>}
          </div>}
          {isUpcoming && <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <span style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f644', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>예정</span>
            <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{game.startTime}</div>
            {countdown && <div style={{ fontSize:10, color:'#f59e0b', fontWeight:600 }}>⏱ {countdown}</div>}
            {game.stadium && <div style={{ fontSize:10, color:'#475569', marginTop:1 }}>🏟 {game.stadium} {game.weather}</div>}
          </div>}
          {isDone && <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
            <span style={{ fontSize:10, color:'#64748b', border:'1px solid #64748b44', borderRadius:4, padding:'2px 6px' }}>종료</span>
            {game.stadium && <div style={{ fontSize:10, color:'#475569', marginTop:2 }}>🏟 {game.stadium} {game.weather}</div>}
          </div>}
        </div>
        <div style={{ textAlign:'center', flex:1 }}>
          <div style={{ fontSize:10, color:'#3b82f6', fontWeight:600, marginBottom:3 }}>홈</div>
          <div style={{ fontSize:17, fontWeight:900, color:isDone&&!winnerHome?'#64748b':'#e2e8f0' }}>{game.homeTeam}</div>
          {game.homeScore != null && <div style={{ fontSize:28, fontWeight:900, color:winnerHome?'#fff':isDone?'#64748b':'#e2e8f0', marginTop:2 }}>{game.homeScore}</div>}
          {isDone && game.homeScore == null && winnerHome && <div style={{ fontSize:11, color:'#10b981', fontWeight:700, marginTop:3 }}>승</div>}
          {isDone && game.homeScore == null && !winnerHome && game.winPitcher && <div style={{ fontSize:11, color:'#64748b', marginTop:3 }}>패</div>}
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

// ── 메인 Home ────────────────────────────────────────
function Home({ onGoLive, user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [games, setGames]               = useState([]);
  const [hotPosts, setHotPosts]         = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [rankData, setRankData] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const intervalRef = useRef(null);

  async function fetchGames(date) {
    setGamesLoading(true);
    try {
      const dateStr  = toDateStr(date);
      const now2 = new Date();
      const gDate = new Date(parseInt(dateStr.slice(0,4)), parseInt(dateStr.slice(4,6))-1, parseInt(dateStr.slice(6,8)));
      const isPastDate = gDate < new Date(now2.getFullYear(), now2.getMonth(), now2.getDate());

      // 지난 날짜면 DB에서 먼저 조회
      if (isPastDate) {
        const dbRes = await fetch(`${SERVER}/api/kbo/results/${dateStr}`);
        const dbData = await dbRes.json();
        if (dbData.success && dbData.data.length > 0) {
          setGames(dbData.data.map((g,i) => ({
            id: i+1, gameId: g.gameId,
            awayTeam: g.awayTeam, homeTeam: g.homeTeam,
            awayScore: g.awayScore, homeScore: g.homeScore,
            innings: g.innings || [],
            state: '종료',
            startTime: g.startTime, stadium: g.stadium,
            dateStr: g.gameDate,
            weather: '',
            awayPitcher: g.awayPitcher, homePitcher: g.homePitcher,
            winPitcher: g.winPitcher, losePitcher: g.losePitcher, savePitcher: g.savePitcher,
          })));
          setGamesLoading(false);
          return;
        }
      }

      // Railway 백엔드 API 호출 (캐싱 적용, allorigins 대체)
      const apiRes = await fetch(`${SERVER}/api/kbo/games/${dateStr}`);
      const apiData = await apiRes.json();

      if (!apiData.success || !apiData.data.length) {
        setGames([]); setGamesLoading(false); return;
      }

      setGames(apiData.data);
      // 날씨 비동기 로드 (경기 카드 표시 후)
      (async () => {
        try {
          const uncached = stadiums.filter(s => !weatherCache[`${s}_${dateStr}`]);
          if (uncached.length === 0) return;
          await Promise.all(uncached.map(async s => {
            const cacheKey = `${s}_${dateStr}`;
            const coords = Object.entries(STADIUM_COORDS).find(([k]) => s?.includes(k));
            if (!coords) return;
            const [, {lat, lon}] = coords;
            const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,precipitation_probability_max&timezone=Asia%2FSeoul&forecast_days=7`;
            const wr = await fetch(wUrl);
            const wj = await wr.json();
            const idx = wj.daily?.time?.indexOf(targetDate);
            if (idx >= 0) {
              const emoji = getWeatherEmoji(wj.daily.weathercode[idx], wj.daily.precipitation_probability_max[idx]);
              weatherCache[cacheKey] = emoji;
            }
          }));
          // 날씨 업데이트 후 게임 카드 갱신
          setGames(prev => prev.map(g => ({
            ...g,
            weather: weatherCache[`${g.stadium?.trim()}_${dateStr}`] || ''
          })));
        } catch(e) {}
      })();
      // 날씨 비동기 로드 (경기 카드 표시 후)
      (async () => {
        try {
          const uncached = stadiums.filter(s => !weatherCache[`${s}_${dateStr}`]);
          if (uncached.length === 0) return;
          await Promise.all(uncached.map(async s => {
            const cacheKey = `${s}_${dateStr}`;
            const coords = Object.entries(STADIUM_COORDS).find(([k]) => s?.includes(k));
            if (!coords) return;
            const [, {lat, lon}] = coords;
            const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,precipitation_probability_max&timezone=Asia%2FSeoul&forecast_days=7`;
            const wr = await fetch(wUrl);
            const wj = await wr.json();
            const idx = wj.daily?.time?.indexOf(targetDate);
            if (idx >= 0) {
              const emoji = getWeatherEmoji(wj.daily.weathercode[idx], wj.daily.precipitation_probability_max[idx]);
              weatherCache[cacheKey] = emoji;
            }
          }));
          // 날씨 업데이트 후 게임 카드 갱신
          setGames(prev => prev.map(g => ({
            ...g,
            weather: weatherCache[`${g.stadium?.trim()}_${dateStr}`] || ''
          })));
        } catch(e) {}
      })();
    } catch(e) { console.log('fetchGames error:', e); }
    setGamesLoading(false);
  }

  async function fetchHotPosts() {
    try {
      const res  = await fetch(`${SERVER}/api/posts`);
      const data = await res.json();
      if (data.success) setHotPosts(data.data.filter(p=>(p.likes??0)>=1).slice(0,5));
    } catch(e) {}
    setPostsLoading(false);
  }

  useEffect(() => {
    fetchGames(selectedDate);
    // 오늘이면 60초마다 갱신
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isSameDay(selectedDate, TODAY)) {
      intervalRef.current = setInterval(() => fetchGames(selectedDate), 60000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [selectedDate]); // eslint-disable-line

  useEffect(() => { fetchHotPosts(); }, []);

  useEffect(() => {
    fetch(`${SERVER}/api/kbo/rank`)
      .then(r => r.json())
      .then(data => { if (data.success) setRankData(data.data); })
      .catch(() => {});
  }, []);

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d); };
  const isToday = isSameDay(selectedDate, TODAY);
  const hasLive = games.some(g => g.state==='LIVE' || g.state==='경기중');

  return (
    <div style={{ padding:'16px 16px 80px' }}>
      {selectedGame && <GameDetailModal game={selectedGame} onClose={() => setSelectedGame(null)} />}
      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} onSelectDate={d => setSelectedDate(d)} />}

      {/* 날짜 네비게이터 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700 }}>TODAY'S GAMES</div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {hasLive && <span style={{ fontSize:10, color:'#ef4444', fontWeight:700, marginRight:4 }}>● LIVE</span>}
          <button onClick={prevDay} style={{ background:'none', border:'none', color:'#64748b', fontSize:18, cursor:'pointer', padding:'2px 6px' }}>‹</button>
          <button onClick={() => setShowSchedule(true)} style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:8, padding:'4px 12px', color:isToday?'#3b82f6':'#e2e8f0', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {isToday ? '오늘 · ' : ''}{toDisplayStr(selectedDate)} 📅
          </button>
          <button onClick={nextDay} style={{ background:'none', border:'none', color:'#64748b', fontSize:18, cursor:'pointer', padding:'2px 6px' }}>›</button>
        </div>
      </div>

      {/* 경기 목록 */}
      {gamesLoading && <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b', fontSize:13 }}>경기 정보 불러오는 중...</div>}
      {!gamesLoading && games.length===0 && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b', fontSize:13 }}>
          이 날은 경기가 없어요 ⚾<br/>
          <span style={{ fontSize:11, color:'#475569' }}>📅 달력에서 경기 있는 날을 확인하세요</span>
        </div>
      )}
      {!gamesLoading && [...games]
        .sort((a, b) => {
          const myTeamShort = user?.team ? (TEAM_MAP[user.team] || user.team) : null;
          const aIsMyTeam = myTeamShort && (a.awayTeam?.includes(myTeamShort) || a.homeTeam?.includes(myTeamShort));
          const bIsMyTeam = myTeamShort && (b.awayTeam?.includes(myTeamShort) || b.homeTeam?.includes(myTeamShort));
          if (aIsMyTeam && !bIsMyTeam) return -1;
          if (!aIsMyTeam && bIsMyTeam) return 1;
          return 0;
        })
        .map(game => {
          const myTeamShort = user?.team ? (TEAM_MAP[user.team] || user.team) : null;
          const isMyTeam = myTeamShort && (game.awayTeam?.includes(myTeamShort) || game.homeTeam?.includes(myTeamShort));
          return (
            <GameCard key={game.id} game={game} isMyTeam={isMyTeam} onClick={() => {
              if (game.state === '예정' || game.state === 'LIVE' || game.state === '경기중') {
                onGoLive(game);
              } else {
                setSelectedGame(game);
              }
            }} />
          );
        })
      }

      {/* KBO 팀 순위 */}
      {rankData.length > 0 && (
        <div style={{ marginTop:20, marginBottom:8 }}>
          <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700, marginBottom:10 }}>🏆 KBO 팀 순위</div>
          <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:12, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'28px 1fr 36px 36px 36px 36px 52px', padding:'7px 12px', borderBottom:'1px solid #1e2d45' }}>
              {['순위','팀','경기','승','무','패','승률'].map(h => (
                <div key={h} style={{ fontSize:10, color:'#475569', fontWeight:700, textAlign: h==='팀'?'left':'center' }}>{h}</div>
              ))}
            </div>
            {rankData.map((r, i) => {
              const myTeamMap = {'LG 트윈스':'LG','KIA 타이거즈':'KIA','삼성 라이온즈':'삼성','두산 베어스':'두산','KT 위즈':'KT','SSG 랜더스':'SSG','롯데 자이언츠':'롯데','한화 이글스':'한화','NC 다이노스':'NC','키움 히어로즈':'키움'};
              const myTeamShort = user?.team ? (myTeamMap[user.team] || user.team) : null;
              const isMyTeam = myTeamShort && r.team?.includes(myTeamShort);
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'28px 1fr 36px 36px 36px 36px 52px', padding:'8px 12px', borderBottom: i < rankData.length-1 ? '1px solid #0f172a' : 'none', background: isMyTeam ? '#0f1f35' : 'transparent' }}>
                  <div style={{ fontSize:12, fontWeight:700, color: i<3?'#f59e0b':'#64748b', textAlign:'center' }}>{r.rank}</div>
                  <div style={{ fontSize:12, fontWeight: isMyTeam?900:500, color: isMyTeam?'#3b82f6':'#e2e8f0' }}>{r.team} {isMyTeam && '⭐'}</div>
                  <div style={{ fontSize:11, color:'#64748b', textAlign:'center' }}>{r.games}</div>
                  <div style={{ fontSize:11, color:'#10b981', textAlign:'center', fontWeight:700 }}>{r.win}</div>
                  <div style={{ fontSize:11, color:'#64748b', textAlign:'center' }}>{r.draw}</div>
                  <div style={{ fontSize:11, color:'#ef4444', textAlign:'center' }}>{r.lose}</div>
                  <div style={{ fontSize:11, color:'#94a3b8', textAlign:'center' }}>{r.behind}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HOT 게시글 */}
      {!postsLoading && hotPosts.length > 0 && (
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:11, color:'#64748b', letterSpacing:2, fontWeight:700, marginBottom:10 }}>🔥 HOT 게시글</div>
          {hotPosts.map((post,i) => (
            <div key={post.id} style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:12, padding:'11px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:13, fontWeight:900, color:'#ef4444', minWidth:16 }}>{i+1}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:'#e2e8f0', lineHeight:1.4 }}>{post.title}</div>
                <div style={{ display:'flex', gap:8, marginTop:4 }}>
                  <span style={{ fontSize:10, color:'#64748b' }}>{post.author?.nickname||post.author?.name}</span>
                  <span style={{ fontSize:10, color:'#ef4444' }}>👍 {post.likes??0}</span>
                  <span style={{ fontSize:10, color:'#64748b' }}>💬 {post._count?.comments??0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!postsLoading && hotPosts.length===0 && (
        <div style={{ marginTop:20, textAlign:'center', padding:'20px 0', color:'#475569', fontSize:12 }}>아직 인기 게시글이 없어요 ⚾</div>
      )}
    </div>
  );
}

export default Home;