import { useState, useEffect } from 'react';

const TABS = [
  { key:'team', label:'팀 응원' },
  { key:'together', label:'같이가요' },
  { key:'photo', label:'사진' },
  { key:'news', label:'뉴스' },
  { key:'mlb', label:'MLB' },
];

const POSTS = {
  team: [
    { id:1, team:'LG', title:'임찬규 오늘 8이닝 1실점 레전드', author:'야구광123', likes:234, comments:45, time:'19분 전', hot:true, views:1203 },
    { id:2, team:'KIA', title:'KIA 타선 오늘 왜이래... 답답', author:'호랑이팬', likes:89, comments:23, time:'32분 전', hot:false, views:445 },
    { id:3, team:'LG', title:'박찬호 올시즌 커리어하이 각이다', author:'LG사랑', likes:178, comments:67, time:'1시간 전', hot:true, views:892 },
    { id:4, team:'한화', title:'류현진 컴백 진짜냐?? 설레는데', author:'이글스맨', likes:312, comments:134, time:'4시간 전', hot:true, views:2341 },
  ],
  together: [
    { id:1, title:'[LG] 4/5 잠실 LG vs 두산 같이가요', author:'직관왕', likes:12, comments:8, time:'10분 전', date:'4/5(토)', seat:'1루 익사이팅존', left:2, views:89 },
    { id:2, title:'[KIA] 광주 원정 버스 같이 타실 분', author:'광주원정대', likes:34, comments:21, time:'1시간 전', date:'4/12(토)', seat:'3루 응원석', left:5, views:234 },
    { id:3, title:'[한화] 대전 원정 4명 팟 구합니다', author:'이글스원정', likes:8, comments:6, time:'2시간 전', date:'4/8(일)', seat:'외야 응원석', left:3, views:123 },
  ],
  photo: [
    { id:1, title:'오늘 잠실 석양 너무 예쁘지 않아요?', author:'직관러99', likes:445, comments:67, time:'30분 전', emoji:'🌅', hot:true, views:2341 },
    { id:2, title:'임찬규 오늘 피칭폼 찍었어요', author:'야구사진관', likes:234, comments:45, time:'1시간 전', emoji:'📸', hot:true, views:1203 },
    { id:3, title:'오늘 홈런볼 잡았어요!!!', author:'홈런포수', likes:892, comments:234, time:'4시간 전', emoji:'⚾', hot:true, views:6782 },
  ],
  news: [
    { id:1, title:'[속보] 류현진, 한화와 2년 계약 발표', author:'야구뉴스', likes:567, comments:234, time:'2시간 전', tag:'이적', hot:true, views:12341 },
    { id:2, title:'2026 KBO 개막 일정 확정', author:'KBO공식', likes:234, comments:89, time:'1일 전', tag:'일정', hot:true, views:8923 },
    { id:3, title:'KBO 외국인 선수 쿼터 확대 검토', author:'스포츠기자', likes:123, comments:67, time:'3시간 전', tag:'공지', hot:false, views:3421 },
  ],
  mlb: [
    { id:1, title:'오타니 오늘 2홈런+7이닝... 외계인', author:'MLB팬', likes:892, comments:345, time:'1시간 전', player:'오타니', hot:true, views:15234 },
    { id:2, title:'이정후 멀티히트! 타율 .298', author:'SF팬', likes:567, comments:123, time:'2시간 전', player:'이정후', hot:true, views:8923 },
    { id:3, title:'김하성 수비 하이라이트 미쳤다', author:'한인팬', likes:234, comments:78, time:'3시간 전', player:'김하성', hot:false, views:4521 },
  ],
};

function PostCard({ post, type, onLike, liked, reported, onReport }) {
  if (reported) {
    return (
      <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:12, padding:'12px 14px', marginBottom:8, color:'#64748b', fontSize:13 }}>
        🚨 신고된 게시글입니다
      </div>
    );
  }

  return (
    <div style={{ background:'#111827', border:`1px solid ${post.hot ? '#243550' : '#1e2d45'}`, borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
      {/* 상단 배지 */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
        {post.hot && <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444444', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>🔥 HOT</span>}
        {post.team && <span style={{ fontSize:10, color:'#94a3b8', border:'1px solid #1e2d45', borderRadius:4, padding:'2px 7px' }}>{post.team}</span>}
        {post.tag && <span style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f644', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>{post.tag}</span>}
        {post.player && <span style={{ fontSize:10, color:'#10b981', border:'1px solid #10b98144', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>{post.player}</span>}
        <span style={{ fontSize:10, color:'#64748b', marginLeft:'auto' }}>{post.time}</span>
      </div>

      {/* 제목 */}
      <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', marginBottom: type==='together' ? 8 : 7, lineHeight:1.4 }}>
        {type==='photo' && post.emoji + ' '}{post.title}
      </div>

      {/* 같이가요 정보 */}
      {type === 'together' && (
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <span style={{ fontSize:11, color:'#94a3b8' }}>📍 {post.seat}</span>
          <span style={{ fontSize:11, color:'#ef4444', fontWeight:700 }}>잔여 {post.left}자리</span>
          <span style={{ fontSize:11, color:'#64748b' }}>📅 {post.date}</span>
        </div>
      )}

      {/* 하단 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8 }}>
          <span style={{ fontSize:11, color:'#64748b' }}>{post.author}</span>
          <span style={{ fontSize:11, color:'#64748b' }}>💬 {post.comments}</span>
          <span style={{ fontSize:11, color:'#64748b' }}>👁 {post.views}</span>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <button onClick={onReport} style={{ fontSize:11, color:'#64748b', background:'transparent', border:'none', cursor:'pointer' }}>신고</button>
          <button onClick={onLike} style={{
            display:'flex', alignItems:'center', gap:3,
            padding:'3px 10px', borderRadius:12,
            border:`1px solid ${liked ? '#ef444455' : '#1e2d45'}`,
            background: liked ? '#ef444422' : 'transparent',
            fontSize:11, color: liked ? '#ef4444' : '#64748b',
            fontWeight:700, cursor:'pointer',
          }}>👍 {post.likes + (liked ? 1 : 0)}</button>
        </div>
      </div>
    </div>
  );
}

function Board() {
  const [tab, setTab] = useState('team');
  const [apiPosts, setApiPosts] = useState([]);

useEffect(() => {
  fetch('http://localhost:3001/api/posts')
    .then(res => res.json())
    .then(data => {
      if (data.success) setApiPosts(data.data);
    })
    .catch(err => console.log('서버 연결 안됨:', err));
}, []);
  const [likes, setLikes] = useState({});
  const [reports, setReports] = useState({});

  const posts = POSTS[tab] || [];
  const hotPosts = posts.filter(p => p.hot);
  const normalPosts = posts.filter(p => !p.hot);

  return (
    <div style={{ paddingBottom:80 }}>
      {/* 탭 */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e2d45', overflowX:'auto', backgroundColor:'#080c14', position:'sticky', top:0, zIndex:5 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:'11px 14px', border:'none', background:'transparent',
            fontSize:13, fontWeight:700, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap',
            color: tab===t.key ? '#3b82f6' : '#64748b',
            borderBottom: `2px solid ${tab===t.key ? '#3b82f6' : 'transparent'}`,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding:'10px 14px' }}>
        {/* HOT 게시글 */}
        {hotPosts.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
              <span style={{ fontSize:13 }}>🔥</span>
              <span style={{ fontSize:11, fontWeight:700, color:'#ef4444' }}>HOT 게시글</span>
            </div>
            {hotPosts.slice(0,3).map(post => (
              <PostCard
                key={post.id} post={post} type={tab}
                liked={likes[post.id]} onLike={() => setLikes(p => ({ ...p, [post.id]: !p[post.id] }))}
                reported={reports[post.id]} onReport={() => setReports(p => ({ ...p, [post.id]: true }))}
              />
            ))}
            <div style={{ height:1, background:'#1e2d45', margin:'12px 0' }} />
          </div>
        )}

        {/* 일반 게시글 */}
        {normalPosts.map(post => (
          <PostCard
            key={post.id} post={post} type={tab}
            liked={likes[post.id]} onLike={() => setLikes(p => ({ ...p, [post.id]: !p[post.id] }))}
            reported={reports[post.id]} onReport={() => setReports(p => ({ ...p, [post.id]: true }))}
          />
        ))}

        {/* 글쓰기 버튼 */}
        <div style={{ textAlign:'center', marginTop:12 }}>
          <button style={{ padding:'10px 24px', background:'#3b82f6', border:'none', borderRadius:20, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            ✏️ 글쓰기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Board;