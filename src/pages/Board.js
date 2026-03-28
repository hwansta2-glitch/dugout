import { useState, useEffect, useCallback } from 'react';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
const TABS = [
  { key:'team', label:'팀 응원' },
  { key:'together', label:'같이가요' },
  { key:'photo', label:'사진' },
  { key:'news', label:'뉴스' },
  { key:'mlb', label:'MLB' },
];

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
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
        {post.hot && <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444444', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>🔥 HOT</span>}
        {post.team && <span style={{ fontSize:10, color:'#94a3b8', border:'1px solid #1e2d45', borderRadius:4, padding:'2px 7px' }}>{post.team}</span>}
        {post.tag && <span style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f644', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>{post.tag}</span>}
        <span style={{ fontSize:10, color:'#64748b', marginLeft:'auto' }}>
          {post.createdAt ? new Date(post.createdAt).toLocaleString('ko-KR', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' }) : post.time}
        </span>
      </div>
      <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', marginBottom:7, lineHeight:1.4 }}>
        {post.title}
      </div>
      {type === 'together' && post.seat && (
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <span style={{ fontSize:11, color:'#94a3b8' }}>📍 {post.seat}</span>
          {post.left && <span style={{ fontSize:11, color:'#ef4444', fontWeight:700 }}>잔여 {post.left}자리</span>}
          {post.date && <span style={{ fontSize:11, color:'#64748b' }}>📅 {post.date}</span>}
        </div>
      )}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8 }}>
          <span style={{ fontSize:11, color:'#64748b' }}>{post.author?.name || post.author}</span>
          <span style={{ fontSize:11, color:'#64748b' }}>💬 {post.comments ?? post._count?.comments ?? 0}</span>
          <span style={{ fontSize:11, color:'#64748b' }}>👁 {post.views ?? 0}</span>
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
          }}>👍 {(post.likes ?? 0) + (liked ? 1 : 0)}</button>
        </div>
      </div>
    </div>
  );
}

// ✅ 글쓰기 모달
function WriteModal({ tab, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [team, setTeam] = useState('LG');
  const [submitting, setSubmitting] = useState(false);

  const KBO_TEAMS = ['LG','KIA','삼성','두산','롯데','SSG','키움','NC','한화','KT'];

  const submit = async () => {
    if (!title.trim()) return alert('제목을 입력해주세요');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('dugout_token');
      const res = await fetch(SERVER + '/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          title,
          content,
          boardType: tab,
          team: tab === 'team' ? team : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        alert(data.message || '글쓰기 실패');
      }
    } catch(e) {
      alert('서버 연결 실패');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:100, display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', background:'#0f172a', borderRadius:'16px 16px 0 0', padding:'20px 16px 40px' }}>
        {/* 헤더 */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>✏️ 글쓰기</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        {/* 팀 선택 (팀응원 탭일 때만) */}
        {tab === 'team' && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:6 }}>응원 팀</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {KBO_TEAMS.map(t => (
                <button key={t} onClick={() => setTeam(t)} style={{
                  padding:'4px 10px', borderRadius:12, fontSize:12, cursor:'pointer',
                  border:`1px solid ${team===t ? '#3b82f6' : '#1e2d45'}`,
                  background: team===t ? '#3b82f622' : 'transparent',
                  color: team===t ? '#3b82f6' : '#94a3b8',
                  fontWeight: team===t ? 700 : 400,
                }}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {/* 제목 */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          maxLength={100}
          style={{
            width:'100%', padding:'10px 12px', borderRadius:8,
            background:'#111827', border:'1px solid #1e2d45',
            color:'#e2e8f0', fontSize:13, marginBottom:10,
            boxSizing:'border-box', outline:'none',
          }}
        />

        {/* 내용 */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="내용을 입력하세요 (선택)"
          rows={4}
          style={{
            width:'100%', padding:'10px 12px', borderRadius:8,
            background:'#111827', border:'1px solid #1e2d45',
            color:'#e2e8f0', fontSize:13, marginBottom:14,
            boxSizing:'border-box', resize:'none', outline:'none',
          }}
        />

        {/* 등록 버튼 */}
        <button
          onClick={submit}
          disabled={submitting}
          style={{
            width:'100%', padding:'12px', borderRadius:10,
            background: submitting ? '#1e2d45' : '#3b82f6',
            border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer',
          }}
        >{submitting ? '등록 중...' : '게시글 등록'}</button>
      </div>
    </div>
  );
}

function Board({ user }) {
  const [tab, setTab] = useState('team');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWrite, setShowWrite] = useState(false);
  const [likes, setLikes] = useState({});
  const [reports, setReports] = useState({});

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER}/api/posts?boardType=${tab}`);
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch(e) {
      console.log('게시글 불러오기 실패:', e);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const hotPosts = posts.filter(p => p.hot || p.likes >= 100);
  const normalPosts = posts.filter(p => !p.hot && (p.likes ?? 0) < 100);

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
        {/* 로딩 */}
        {loading && (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b', fontSize:13 }}>불러오는 중...</div>
        )}

        {/* 게시글 없을 때 */}
        {!loading && posts.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b', fontSize:13 }}>
            아직 게시글이 없어요. 첫 글을 작성해보세요! ✍️
          </div>
        )}

        {/* HOT 게시글 */}
        {!loading && hotPosts.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
              <span style={{ fontSize:13 }}>🔥</span>
              <span style={{ fontSize:11, fontWeight:700, color:'#ef4444' }}>HOT 게시글</span>
            </div>
            {hotPosts.slice(0,3).map(post => (
              <PostCard key={post.id} post={post} type={tab}
                liked={likes[post.id]} onLike={() => setLikes(p => ({ ...p, [post.id]: !p[post.id] }))}
                reported={reports[post.id]} onReport={() => setReports(p => ({ ...p, [post.id]: true }))}
              />
            ))}
            <div style={{ height:1, background:'#1e2d45', margin:'12px 0' }} />
          </div>
        )}

        {/* 일반 게시글 */}
        {!loading && normalPosts.map(post => (
          <PostCard key={post.id} post={post} type={tab}
            liked={likes[post.id]} onLike={() => setLikes(p => ({ ...p, [post.id]: !p[post.id] }))}
            reported={reports[post.id]} onReport={() => setReports(p => ({ ...p, [post.id]: true }))}
          />
        ))}

        {/* 글쓰기 버튼 */}
        <div style={{ textAlign:'center', marginTop:12 }}>
          <button
            onClick={() => setShowWrite(true)}
            style={{ padding:'10px 24px', background:'#3b82f6', border:'none', borderRadius:20, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}
          >✏️ 글쓰기</button>
        </div>
      </div>

      {/* 글쓰기 모달 */}
      {showWrite && (
        <WriteModal
          tab={tab}
          onClose={() => setShowWrite(false)}
          onSuccess={() => { setShowWrite(false); fetchPosts(); }}
        />
      )}
    </div>
  );
}

export default Board;