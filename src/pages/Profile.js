import { useState } from 'react';

const TEAMS = [
  { id:'lg', name:'LG 트윈스', emoji:'🔴', color:'#C00000' },
  { id:'kia', name:'KIA 타이거즈', emoji:'🐯', color:'#EA0029' },
  { id:'samsung', name:'삼성 라이온즈', emoji:'🦁', color:'#074CA1' },
  { id:'doosan', name:'두산 베어스', emoji:'🐻', color:'#131230' },
  { id:'kt', name:'KT 위즈', emoji:'⚡', color:'#444444' },
  { id:'ssg', name:'SSG 랜더스', emoji:'💎', color:'#CE0E2D' },
  { id:'lotte', name:'롯데 자이언츠', emoji:'🌊', color:'#002C5F' },
  { id:'hanwha', name:'한화 이글스', emoji:'🦅', color:'#FC4E00' },
  { id:'nc', name:'NC 다이노스', emoji:'🦕', color:'#071D4F' },
  { id:'kiwoom', name:'키움 히어로즈', emoji:'🦸', color:'#820024' },
];

const EMOTICONS = [
  { id:1, emoji:'🔥', name:'화염', cost:0, unlocked:true },
  { id:2, emoji:'⚾', name:'야구공', cost:0, unlocked:true },
  { id:3, emoji:'👏', name:'박수', cost:0, unlocked:true },
  { id:4, emoji:'💪', name:'파이팅', cost:0, unlocked:true },
  { id:5, emoji:'🏆', name:'우승', cost:100, unlocked:false },
  { id:6, emoji:'💎', name:'다이아', cost:200, unlocked:false },
  { id:7, emoji:'🎯', name:'홈런', cost:500, unlocked:false },
  { id:8, emoji:'👑', name:'왕관', cost:1000, unlocked:false },
  { id:9, emoji:'🌟', name:'스타', cost:1500, unlocked:false },
  { id:10, emoji:'🚀', name:'로켓', cost:3000, unlocked:false },
];

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width:44, height:24, borderRadius:12,
      background: on ? '#3b82f6' : '#243550',
      position:'relative', cursor:'pointer', transition:'all 0.2s', flexShrink:0,
    }}>
      <div style={{
        position:'absolute', width:18, height:18, borderRadius:'50%',
        background:'#fff', top:3, left: on ? 23 : 3,
        transition:'all 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

function Profile() {
  const [myTeam, setMyTeam] = useState('lg');
  const [points, setPoints] = useState(350);
  const [checked, setChecked] = useState(false);
  const [emoticons, setEmoticons] = useState(EMOTICONS);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState('');
  const [settings, setSettings] = useState({
    notiGame:true, notiComment:true, notiLike:false,
    notiChat:true, darkMode:true, autoPlay:true,
    profilePublic:true, dataMode:false,
  });

  const team = TEAMS.find(t => t.id === myTeam) || TEAMS[0];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const checkIn = () => {
    if (checked) return;
    setChecked(true);
    setPoints(p => p + 50);
    showToast('출석 완료! +50 포인트 ⭐');
  };

  const unlockEmoticon = (id) => {
    const emo = emoticons.find(e => e.id === id);
    if (!emo || emo.unlocked) return;
    if (points < emo.cost) { showToast('포인트가 부족해요!'); return; }
    setPoints(p => p - emo.cost);
    setEmoticons(prev => prev.map(e => e.id === id ? { ...e, unlocked:true } : e));
    showToast(`${emo.emoji} 잠금 해제! ✨`);
  };

  // 설정 화면
  if (showSettings) {
    const settingItems = [
      { section:'🔔 알림 설정', items:[
        { label:'경기 시작 알림', desc:'경기 30분 전 알림', key:'notiGame' },
        { label:'댓글 알림', key:'notiComment' },
        { label:'좋아요 알림', key:'notiLike' },
        { label:'채팅 알림', key:'notiChat' },
      ]},
      { section:'🎨 디스플레이', items:[
        { label:'다크 모드', key:'darkMode' },
        { label:'자동 재생', desc:'GIF 자동 재생', key:'autoPlay' },
      ]},
      { section:'🔒 개인정보', items:[
        { label:'프로필 공개', key:'profilePublic' },
        { label:'데이터 절약 모드', key:'dataMode' },
      ]},
    ];

    return (
      <div style={{ paddingBottom:80 }}>
        {/* 헤더 */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px 10px', borderBottom:'1px solid #1e2d45' }}>
          <button onClick={() => setShowSettings(false)} style={{ background:'none', border:'none', color:'#3b82f6', fontSize:14, fontWeight:700, cursor:'pointer', padding:0 }}>← 돌아가기</button>
          <span style={{ fontSize:16, fontWeight:900, color:'#e2e8f0' }}>설정</span>
        </div>
        <div style={{ padding:'14px 16px' }}>
          {settingItems.map(({ section, items }) => (
            <div key={section}>
              <div style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:1.5, margin:'16px 0 8px' }}>{section}</div>
              <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:14, overflow:'hidden' }}>
                {items.map(({ label, desc, key }, i) => (
                  <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom: i < items.length-1 ? '1px solid #1e2d45' : 'none' }}>
                    <div>
                      <div style={{ fontSize:14, color:'#e2e8f0' }}>{label}</div>
                      {desc && <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{desc}</div>}
                    </div>
                    <Toggle on={settings[key]} onChange={v => setSettings(p => ({ ...p, [key]:v }))} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* 계정 관리 */}
          <div style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:1.5, margin:'16px 0 8px' }}>⚠️ 계정 관리</div>
          <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:14, overflow:'hidden' }}>
            {[
              { label:'로그아웃', color:'#ef4444' },
              { label:'계정 탈퇴', color:'#ef4444' },
            ].map(({ label, color }, i) => (
              <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom: i===0 ? '1px solid #1e2d45' : 'none' }}>
                <span style={{ fontSize:14, color }}>{label}</span>
                <button onClick={() => showToast('고객센터를 통해 진행해주세요')} style={{ background:'#ef444422', border:'1px solid #ef444444', borderRadius:8, padding:'5px 12px', color:'#ef4444', fontSize:12, fontWeight:700, cursor:'pointer' }}>선택</button>
              </div>
            ))}
          </div>
          <div style={{ fontSize:11, color:'#64748b', textAlign:'center', marginTop:16 }}>버전 v1.0.0</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:'14px 16px 80px', position:'relative' }}>

      {/* 토스트 */}
      {toast && (
        <div style={{
          position:'fixed', top:80, left:'50%', transform:'translateX(-50%)',
          background:'#10b981', color:'#fff', padding:'7px 18px',
          borderRadius:20, fontSize:12, fontWeight:700, zIndex:999, whiteSpace:'nowrap',
        }}>{toast}</div>
      )}

      {/* 구단 변경 모달 */}
      {showTeamModal && (
        <div onClick={() => setShowTeamModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#0d1220', borderRadius:'20px 20px 0 0', padding:'20px 16px 36px', maxHeight:'80vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ fontSize:16, fontWeight:900, color:'#e2e8f0' }}>응원 구단 변경</span>
              <button onClick={() => setShowTeamModal(false)} style={{ background:'#1e2d45', border:'none', borderRadius:'50%', width:28, height:28, color:'#94a3b8', fontSize:14, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {TEAMS.map(t => (
                <div key={t.id} onClick={() => { setMyTeam(t.id); setShowTeamModal(false); showToast(`${t.emoji} ${t.name} 팬으로 변경됐어요!`); }} style={{
                  background: myTeam===t.id ? t.color+'18' : '#111827',
                  border:`2px solid ${myTeam===t.id ? t.color : '#1e2d45'}`,
                  borderRadius:12, padding:'14px 10px',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer', position:'relative',
                }}>
                  {myTeam===t.id && <div style={{ position:'absolute', top:7, right:7, width:16, height:16, borderRadius:'50%', background:t.color, color:'#fff', fontSize:9, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>✓</div>}
                  <div style={{ fontSize:26 }}>{t.emoji}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#e2e8f0', textAlign:'center', lineHeight:1.3 }}>{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 프로필 카드 */}
      <div style={{ background:'#0d1220', border:'1px solid #1e2d45', borderRadius:14, padding:18, marginBottom:14, textAlign:'center' }}>
        <div style={{ fontSize:44, marginBottom:10 }}>😎</div>
        <div style={{ fontSize:17, fontWeight:900, color:'#e2e8f0' }}>오용환</div>
        <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>{team.emoji} {team.name} 팬</div>
        <div style={{ display:'flex', justifyContent:'space-around', marginTop:14, paddingTop:12, borderTop:'1px solid #1e2d45' }}>
          {[['127','참여 경기'],['3.2k','댓글'],['14일','출석']].map(([v,k]) => (
            <div key={k}>
              <div style={{ fontSize:16, fontWeight:900, color:'#e2e8f0' }}>{v}</div>
              <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{k}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowTeamModal(true)} style={{
          marginTop:12, padding:'7px 18px', borderRadius:20,
          border:'1px solid #243550', background:'#111827',
          color:'#94a3b8', fontSize:12, fontWeight:700, cursor:'pointer',
          display:'flex', alignItems:'center', gap:6, margin:'12px auto 0',
        }}>⚾ 응원 구단 변경</button>
      </div>

      {/* 포인트 카드 */}
      <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:14, padding:14, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>내 포인트</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
              <span style={{ fontSize:26, fontWeight:900, color:'#e2e8f0' }}>{points.toLocaleString()}</span>
              <span style={{ fontSize:12, color:'#64748b' }}>pt</span>
            </div>
          </div>
          <button onClick={checkIn} style={{
            padding:'10px 16px', borderRadius:10,
            border:`1px solid ${checked ? '#1e2d45' : '#10b98166'}`,
            background: checked ? '#0d1220' : '#10b98122',
            color: checked ? '#64748b' : '#10b981',
            fontSize:12, fontWeight:700, cursor: checked ? 'default' : 'pointer',
          }}>{checked ? '✓ 출석완료' : '☀️ 출석체크'}</button>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[['출석체크','+50pt'],['추천받기','+10pt'],['댓글작성','+5pt']].map(([label,pt]) => (
            <div key={label} style={{ padding:'4px 10px', borderRadius:12, background:'#0d1220', border:'1px solid #1e2d45', display:'flex', gap:5, alignItems:'center' }}>
              <span style={{ fontSize:11, color:'#94a3b8' }}>{label}</span>
              <span style={{ fontSize:11, fontWeight:700, color:'#10b981' }}>{pt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 이모티콘 상점 */}
      <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:14, padding:14, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>🎁 이모티콘 상점</span>
          <span style={{ fontSize:11, color:'#64748b' }}>포인트로 잠금 해제</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8 }}>
          {emoticons.map(e => (
            <div key={e.id} onClick={() => !e.unlocked && unlockEmoticon(e.id)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
              padding:'10px 6px', borderRadius:10,
              border:`1px solid ${e.unlocked ? '#10b98155' : '#1e2d45'}`,
              background: e.unlocked ? '#10b98111' : '#0d1220',
              cursor: e.unlocked ? 'default' : 'pointer', position:'relative',
            }}>
              <div style={{ fontSize:22, filter: e.unlocked ? 'none' : 'grayscale(1)', opacity: e.unlocked ? 1 : 0.4 }}>{e.emoji}</div>
              <div style={{ fontSize:9, color: e.unlocked ? '#10b981' : '#64748b', textAlign:'center' }}>{e.name}</div>
              {e.unlocked
                ? <div style={{ position:'absolute', top:4, right:5, fontSize:9, color:'#10b981', fontWeight:900 }}>✓</div>
                : <div style={{ fontSize:9, fontWeight:700, color: points >= e.cost ? '#e2e8f0' : '#64748b' }}>⭐{e.cost}</div>
              }
            </div>
          ))}
        </div>
      </div>

      {/* 설정 버튼 */}
      <button onClick={() => setShowSettings(true)} style={{
        width:'100%', padding:14, background:'#111827',
        border:'1px solid #1e2d45', borderRadius:14,
        color:'#e2e8f0', fontSize:14, fontWeight:700,
        display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>⚙️</span>
          <span>설정</span>
        </div>
        <span style={{ color:'#64748b' }}>›</span>
      </button>

    </div>
  );
}

export default Profile;