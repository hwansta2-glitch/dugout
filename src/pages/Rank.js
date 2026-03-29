import { useState, useEffect } from 'react';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

const TEAM_COLORS = {
  'LG':'#C00000','KIA':'#EA0029','삼성':'#074CA1','두산':'#131230',
  'KT':'#444444','SSG':'#CE0E2D','롯데':'#002C5F','한화':'#FC4E00',
  'NC':'#071D4F','키움':'#820024',
};

const TEAM_MAP = {
  'LG 트윈스':'LG','KIA 타이거즈':'KIA','삼성 라이온즈':'삼성','두산 베어스':'두산',
  'KT 위즈':'KT','SSG 랜더스':'SSG','롯데 자이언츠':'롯데','한화 이글스':'한화',
  'NC 다이노스':'NC','키움 히어로즈':'키움',
};

function TeamRank({ user }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const myTeamShort = user?.team ? (TEAM_MAP[user.team] || user.team) : null;

  useEffect(() => {
    fetch(`${SERVER}/api/kbo/rank`)
      .then(r => r.json())
      .then(data => { if (data.success) setTeams(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px 0', color:'#64748b', fontSize:13 }}>
      순위 불러오는 중...
    </div>
  );

  return (
    <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:12, overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:'36px 1fr 40px 40px 40px 40px 60px', padding:'10px 14px', background:'#0d1220', borderBottom:'1px solid #1e2d45' }}>
        {['순위','팀','경기','승','무','패','승률'].map(h => (
          <div key={h} style={{ fontSize:11, color:'#475569', fontWeight:700, textAlign:h==='팀'?'left':'center' }}>{h}</div>
        ))}
      </div>
      {teams.map((r, i) => {
        const isMyTeam = myTeamShort && r.team?.includes(myTeamShort);
        const teamColor = Object.entries(TEAM_COLORS).find(([k]) => r.team?.includes(k))?.[1];
        const rankNum = parseInt(r.rank);
        return (
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'36px 1fr 40px 40px 40px 40px 60px',
            padding:'11px 14px',
            borderBottom: i < teams.length-1 ? '1px solid #0f172a' : 'none',
            background: isMyTeam ? '#0f1f35' : i%2===0 ? '#111827' : '#0f1624',
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
              {rankNum <= 3
                ? <div style={{ width:20, height:20, borderRadius:'50%', background:rankNum===1?'#f59e0b':rankNum===2?'#94a3b8':'#cd7c3c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:900, color:'#fff' }}>{r.rank}</div>
                : <div style={{ fontSize:12, color:'#64748b', fontWeight:700, textAlign:'center' }}>{r.rank}</div>
              }
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {teamColor && <div style={{ width:3, height:20, borderRadius:2, background:teamColor }} />}
              <span style={{ fontSize:13, fontWeight:isMyTeam?900:500, color:isMyTeam?'#3b82f6':'#e2e8f0' }}>
                {r.team} {isMyTeam && '⭐'}
              </span>
            </div>
            <div style={{ fontSize:12, color:'#64748b', textAlign:'center' }}>{r.games}</div>
            <div style={{ fontSize:12, color:'#10b981', textAlign:'center', fontWeight:700 }}>{r.win}</div>
            <div style={{ fontSize:12, color:'#64748b', textAlign:'center' }}>{r.draw}</div>
            <div style={{ fontSize:12, color:'#ef4444', textAlign:'center' }}>{r.lose}</div>
            <div style={{ fontSize:12, color:'#94a3b8', textAlign:'center' }}>{r.behind}</div>
          </div>
        );
      })}
    </div>
  );
}

function Rank({ user }) {
  const [activeTab, setActiveTab] = useState('team');
  return (
    <div style={{ padding:'16px 16px 80px' }}>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[
          { id:'team',    label:'팀 순위' },
          { id:'batter',  label:'타자 순위', soon:true },
          { id:'pitcher', label:'투수 순위', soon:true },
        ].map(t => (
          <button key={t.id} onClick={() => !t.soon && setActiveTab(t.id)} style={{
            padding:'7px 16px', borderRadius:20,
            background: activeTab===t.id ? '#3b82f6' : '#111827',
            border: activeTab===t.id ? 'none' : '1px solid #1e2d45',
            color: activeTab===t.id ? '#fff' : t.soon ? '#475569' : '#94a3b8',
            fontSize:12, fontWeight:700, cursor:t.soon?'default':'pointer',
          }}>
            {t.label}{t.soon && <span style={{ fontSize:8, marginLeft:4, color:'#475569' }}>준비중</span>}
          </button>
        ))}
      </div>
      {activeTab === 'team' && <TeamRank user={user} />}
      <div style={{ textAlign:'center', padding:'12px 0', fontSize:11, color:'#475569' }}>* 데이터 출처: KBO 공식</div>
    </div>
  );
}

export default Rank;
