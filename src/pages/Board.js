import { useState, useEffect, useCallback } from 'react';

const SERVER = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

const TABS = [
  { key:'team',     label:'팀 응원' },
  { key:'together', label:'같이가요' },
  { key:'photo',    label:'사진' },
  { key:'news',     label:'뉴스' },
  { key:'trade',    label:'거래' },
  { key:'mlb',      label:'MLB' },
];

const STADIUMS = [
  '잠실(LG·두산)','수원(KT)','인천(SSG)','대전(한화)',
  '광주(KIA)','대구(삼성)','창원(NC)','사직(롯데)',
  '고척(키움)','포항(포항야구장)',
];
const PHOTO_TAGS = ['선수', '직관인증'];
const TRADE_TAGS = ['삽니다', '팝니다', '나눔'];

// ── 게시글 카드 ──────────────────────────────────────
function PostCard({ post, type, onLike, onDislike, liked, disliked, reported, onReport, onClick, onDelete, isMyPost }) {
  if (reported) return (
    <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:12, padding:'12px 14px', marginBottom:8, color:'#64748b', fontSize:13 }}>
      🚨 신고된 게시글입니다
    </div>
  );
  return (
    <div onClick={onClick} style={{ background:'#111827', border:`1px solid ${(post.likes??0)>=10?'#243550':'#1e2d45'}`, borderRadius:12, padding:'12px 14px', marginBottom:8, cursor:'pointer' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
        {(post.likes??0)>=10 && <span style={{ fontSize:10, color:'#ef4444', border:'1px solid #ef444444', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>🔥 HOT</span>}
        {post.team && <span style={{ fontSize:10, color:'#94a3b8', border:'1px solid #1e2d45', borderRadius:4, padding:'2px 7px' }}>{post.team}</span>}
        {post.tag  && <span style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f644', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>{post.tag}</span>}
        <span style={{ fontSize:10, color:'#64748b', marginLeft:'auto' }}>
          {post.createdAt ? new Date(post.createdAt).toLocaleString('ko-KR', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' }) : ''}
        </span>
      </div>
      <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', marginBottom:7, lineHeight:1.4 }}>{post.title}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8 }}>
          <span style={{ fontSize:11, color:'#64748b' }}>{post.author?.nickname || post.author?.name}</span>
          <span style={{ fontSize:11, color:'#64748b' }}>💬 {post._count?.comments ?? 0}</span>
          <span style={{ fontSize:11, color:'#64748b' }}>👁 {post.views ?? 0}</span>
        </div>
        <div style={{ display:'flex', gap:5, alignItems:'center' }}>
          {isMyPost && (
            <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ fontSize:11, color:'#ef4444', background:'transparent', border:'none', cursor:'pointer' }}>삭제</button>
          )}
          <button onClick={e => { e.stopPropagation(); onReport(); }} style={{ fontSize:11, color:'#64748b', background:'transparent', border:'none', cursor:'pointer' }}>신고</button>
          <button onClick={e => { e.stopPropagation(); onDislike(); }} style={{ padding:'3px 8px', borderRadius:12, border:`1px solid ${disliked?'#6366f155':'#1e2d45'}`, background:disliked?'#6366f122':'transparent', fontSize:11, color:disliked?'#6366f1':'#64748b', fontWeight:700, cursor:'pointer' }}>
            👎 {(post.dislikes??0)+(disliked?1:0)}
          </button>
          <button onClick={e => { e.stopPropagation(); onLike(); }} style={{ padding:'3px 8px', borderRadius:12, border:`1px solid ${liked?'#ef444455':'#1e2d45'}`, background:liked?'#ef444422':'transparent', fontSize:11, color:liked?'#ef4444':'#64748b', fontWeight:700, cursor:'pointer' }}>
            👍 {(post.likes??0)+(liked?1:0)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 뉴스 카드 ────────────────────────────────────────
function NewsCard({ item }) {
  return (
    <a href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
      <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
        <div style={{ fontSize:11, color:'#3b82f6', marginBottom:5, fontWeight:700 }}>📰 KBO 뉴스</div>
        <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', lineHeight:1.4 }}>{item.title}</div>
        <div style={{ fontSize:11, color:'#64748b', marginTop:6 }}>네이버 스포츠 →</div>
      </div>
    </a>
  );
}

// ── 댓글 컴포넌트 ────────────────────────────────────
function CommentItem({ comment, onLike, onDislike, liked, disliked, onDelete, isMyComment }) {
  const isBest = (comment.likes ?? 0) >= 10;
  return (
    <div style={{ marginBottom:10, padding:'10px 12px', borderRadius:10, background:isBest?'#0f2a1a':'#111827', border:`1px solid ${isBest?'#10b98155':'#1e2d45'}` }}>
      {isBest && <div style={{ fontSize:10, color:'#10b981', fontWeight:700, marginBottom:6 }}>🏆 베스트 댓글</div>}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
        <div style={{ width:22, height:22, borderRadius:'50%', background:'#1e2d45', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>⚾</div>
        <span style={{ fontSize:12, fontWeight:700, color:'#e2e8f0' }}>{comment.author?.nickname || comment.author?.name}</span>
        <span style={{ fontSize:10, color:'#64748b' }}>
          {new Date(comment.createdAt).toLocaleString('ko-KR', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' })}
        </span>
        {isMyComment && (
          <button onClick={onDelete} style={{ marginLeft:'auto', fontSize:11, color:'#ef4444', background:'transparent', border:'none', cursor:'pointer' }}>삭제</button>
        )}
      </div>
      <div style={{ fontSize:13, color:'#cbd5e1', paddingLeft:28, lineHeight:1.5, marginBottom:8 }}>{comment.content}</div>
      <div style={{ paddingLeft:28, display:'flex', gap:6 }}>
        <button onClick={onLike} style={{ padding:'2px 10px', borderRadius:10, fontSize:11, cursor:'pointer', border:`1px solid ${liked?'#ef444455':'#1e2d45'}`, background:liked?'#ef444422':'transparent', color:liked?'#ef4444':'#64748b', fontWeight:700 }}>
          👍 {(comment.likes??0)+(liked?1:0)}
        </button>
        <button onClick={onDislike} style={{ padding:'2px 10px', borderRadius:10, fontSize:11, cursor:'pointer', border:`1px solid ${disliked?'#6366f155':'#1e2d45'}`, background:disliked?'#6366f122':'transparent', color:disliked?'#6366f1':'#64748b', fontWeight:700 }}>
          👎 {(comment.dislikes??0)+(disliked?1:0)}
        </button>
      </div>
    </div>
  );
}

// ── 게시글 상세 + 댓글 ──────────────────────────────
function PostDetail({ post, user, onClose, onDeleted }) {
  const [comments, setComments]         = useState([]);
  const [input, setInput]               = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [commentLikes, setCommentLikes]       = useState({});
  const [commentDislikes, setCommentDislikes] = useState({});

  useEffect(() => {
    fetch(`${SERVER}/api/posts/${post.id}/comments`)
      .then(r => r.json())
      .then(d => { if (d.success) setComments(d.data); });
  }, [post.id]);

  const submitComment = async () => {
    if (!input.trim()) return;
    const token = localStorage.getItem('dugout_token');
    if (!token) return alert('로그인이 필요합니다');
    setSubmitting(true);
    try {
      const res = await fetch(`${SERVER}/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + token },
        body: JSON.stringify({ content: input }),
      });
      const data = await res.json();
      if (data.success) { setComments(prev => [...prev, data.data]); setInput(''); }
    } catch(e) { alert('댓글 작성 실패'); }
    setSubmitting(false);
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제할까요?')) return;
    const token = localStorage.getItem('dugout_token');
    try {
      const res = await fetch(`${SERVER}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization':'Bearer ' + token },
      });
      const data = await res.json();
      if (data.success) setComments(prev => prev.filter(c => c.id !== commentId));
      else alert(data.message);
    } catch(e) { alert('삭제 실패'); }
  };

  const handleCommentLike = async (id) => {
    if (commentLikes[id]) return;
    setCommentLikes(p => ({ ...p, [id]: true }));
    await fetch(`${SERVER}/api/comments/${id}/like`, { method:'POST' });
  };

  const handleCommentDislike = async (id) => {
    if (commentDislikes[id]) return;
    setCommentDislikes(p => ({ ...p, [id]: true }));
    await fetch(`${SERVER}/api/comments/${id}/dislike`, { method:'POST' });
  };

  const bestComments   = comments.filter(c => (c.likes??0) >= 10).sort((a,b) => b.likes - a.likes);
  const normalComments = comments.filter(c => (c.likes??0) < 10);

  return (
    <div style={{ position:'fixed', inset:0, background:'#080c14', zIndex:100, overflowY:'auto', paddingBottom:80 }}>
      {/* 헤더 */}
      <div style={{ position:'sticky', top:0, background:'#080c14', borderBottom:'1px solid #1e2d45', padding:'12px 16px', display:'flex', alignItems:'center', gap:10, zIndex:10 }}>
        <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#94a3b8', fontSize:20, cursor:'pointer' }}>←</button>
        <span style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>게시글</span>
        {/* 본인 게시글 삭제 버튼 */}
        {user && post.authorId === user.id && (
          <button onClick={async () => {
            if (!window.confirm('게시글을 삭제할까요?')) return;
            const token = localStorage.getItem('dugout_token');
            const res = await fetch(`${SERVER}/api/posts/${post.id}`, {
              method: 'DELETE',
              headers: { 'Authorization':'Bearer ' + token },
            });
            const data = await res.json();
            if (data.success) { onDeleted(); onClose(); }
            else alert(data.message);
          }} style={{ marginLeft:'auto', fontSize:12, color:'#ef4444', background:'#ef444422', border:'1px solid #ef444444', borderRadius:8, padding:'4px 12px', cursor:'pointer', fontWeight:700 }}>
            🗑 삭제
          </button>
        )}
      </div>

      <div style={{ padding:'16px' }}>
        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
          {post.team && <span style={{ fontSize:10, color:'#94a3b8', border:'1px solid #1e2d45', borderRadius:4, padding:'2px 7px' }}>{post.team}</span>}
          {post.tag  && <span style={{ fontSize:10, color:'#3b82f6', border:'1px solid #3b82f644', borderRadius:4, padding:'2px 7px', fontWeight:700 }}>{post.tag}</span>}
        </div>
        <div style={{ fontSize:17, fontWeight:800, color:'#e2e8f0', lineHeight:1.4, marginBottom:10 }}>{post.title}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, paddingBottom:14, borderBottom:'1px solid #1e2d45' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'#1e2d45', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>⚾</div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#e2e8f0' }}>{post.author?.nickname || post.author?.name}</div>
            <div style={{ fontSize:10, color:'#64748b' }}>{post.createdAt ? new Date(post.createdAt).toLocaleString('ko-KR') : ''}</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <span style={{ fontSize:11, color:'#64748b' }}>👍 {post.likes??0}</span>
            <span style={{ fontSize:11, color:'#64748b' }}>👎 {post.dislikes??0}</span>
            <span style={{ fontSize:11, color:'#64748b' }}>👁 {post.views??0}</span>
          </div>
        </div>
        <div style={{ fontSize:14, color:'#cbd5e1', lineHeight:1.8, marginBottom:24, minHeight:60, whiteSpace:'pre-wrap' }}>
          {post.content || '내용이 없습니다.'}
        </div>

        {/* 댓글 */}
        <div style={{ borderTop:'1px solid #1e2d45', paddingTop:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', marginBottom:12 }}>💬 댓글 {comments.length}개</div>
          {bestComments.length > 0 && (
            <div style={{ marginBottom:12 }}>
              {bestComments.map(c => (
                <CommentItem key={c.id} comment={c}
                  liked={commentLikes[c.id]} disliked={commentDislikes[c.id]}
                  onLike={() => handleCommentLike(c.id)} onDislike={() => handleCommentDislike(c.id)}
                  isMyComment={user && c.authorId === user.id}
                  onDelete={() => deleteComment(c.id)}
                />
              ))}
              <div style={{ height:1, background:'#1e2d45', margin:'12px 0' }} />
            </div>
          )}
          {comments.length === 0 && (
            <div style={{ textAlign:'center', padding:'20px 0', color:'#64748b', fontSize:13 }}>첫 댓글을 작성해보세요!</div>
          )}
          {normalComments.map(c => (
            <CommentItem key={c.id} comment={c}
              liked={commentLikes[c.id]} disliked={commentDislikes[c.id]}
              onLike={() => handleCommentLike(c.id)} onDislike={() => handleCommentDislike(c.id)}
              isMyComment={user && c.authorId === user.id}
              onDelete={() => deleteComment(c.id)}
            />
          ))}
        </div>
      </div>

      {/* 댓글 입력 */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:430, background:'#0d1220', borderTop:'1px solid #1e2d45', padding:'10px 12px 20px' }}>
        <div style={{ display:'flex', gap:7 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && submitComment()}
            placeholder={user ? '댓글을 입력하세요...' : '로그인 후 댓글을 작성할 수 있어요'}
            disabled={!user}
            style={{ flex:1, background:'#111827', border:'1px solid #243550', borderRadius:10, padding:'9px 12px', color:'#e2e8f0', fontSize:13, outline:'none' }}
          />
          <button onClick={submitComment} disabled={submitting||!user} style={{ background:user?'#3b82f6':'#1e2d45', border:'none', borderRadius:10, padding:'9px 15px', color:'#fff', fontWeight:700, fontSize:12, cursor:user?'pointer':'default' }}>
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 글쓰기 모달 ──────────────────────────────────────
function WriteModal({ tab, onClose, onSuccess }) {
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [team, setTeam]         = useState('LG');
  const [stadium, setStadium]   = useState(STADIUMS[0]);
  const [photoTag, setPhotoTag] = useState(PHOTO_TAGS[0]);
  const [tradeTag, setTradeTag] = useState(TRADE_TAGS[0]);
  const [submitting, setSubmitting] = useState(false);

  const KBO_TEAMS = ['LG','KIA','삼성','두산','롯데','SSG','키움','NC','한화','KT'];

  const submit = async () => {
    if (!title.trim()) return alert('제목을 입력해주세요');
    const token = localStorage.getItem('dugout_token');
    if (!token) return alert('로그인이 필요합니다');
    setSubmitting(true);
    try {
      let tag = '';
      if (tab==='together') tag = stadium;
      if (tab==='photo')    tag = photoTag;
      if (tab==='trade')    tag = tradeTag;
      const res = await fetch(SERVER + '/api/posts', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + token },
        body: JSON.stringify({ title, content, boardType:tab, team:tab==='team'?team:undefined, tag:tag||undefined }),
      });
      const data = await res.json();
      if (data.success) onSuccess();
      else alert('글쓰기 실패: ' + (data.message||'오류'));
    } catch(e) { alert('서버 연결 실패'); }
    setSubmitting(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:100, display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', background:'#0f172a', borderRadius:'16px 16px 0 0', padding:'20px 16px 40px', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>✏️ 글쓰기</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>
        {tab==='team' && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:6 }}>응원 팀</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {KBO_TEAMS.map(t => (
                <button key={t} onClick={() => setTeam(t)} style={{ padding:'4px 10px', borderRadius:12, fontSize:12, cursor:'pointer', border:`1px solid ${team===t?'#3b82f6':'#1e2d45'}`, background:team===t?'#3b82f622':'transparent', color:team===t?'#3b82f6':'#94a3b8', fontWeight:team===t?700:400 }}>{t}</button>
              ))}
            </div>
          </div>
        )}
        {tab==='together' && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:6 }}>🏟 경기장</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {STADIUMS.map(s => (
                <button key={s} onClick={() => setStadium(s)} style={{ padding:'4px 10px', borderRadius:12, fontSize:11, cursor:'pointer', border:`1px solid ${stadium===s?'#10b981':'#1e2d45'}`, background:stadium===s?'#10b98122':'transparent', color:stadium===s?'#10b981':'#94a3b8', fontWeight:stadium===s?700:400 }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {tab==='photo' && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:6 }}>📷 말머리</div>
            <div style={{ display:'flex', gap:8 }}>
              {PHOTO_TAGS.map(t => (
                <button key={t} onClick={() => setPhotoTag(t)} style={{ padding:'6px 16px', borderRadius:12, fontSize:12, cursor:'pointer', border:`1px solid ${photoTag===t?'#f59e0b':'#1e2d45'}`, background:photoTag===t?'#f59e0b22':'transparent', color:photoTag===t?'#f59e0b':'#94a3b8', fontWeight:photoTag===t?700:400 }}>{t}</button>
              ))}
            </div>
          </div>
        )}
        {tab==='trade' && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:6 }}>🏷 거래 유형</div>
            <div style={{ display:'flex', gap:8 }}>
              {TRADE_TAGS.map(t => (
                <button key={t} onClick={() => setTradeTag(t)} style={{ padding:'6px 16px', borderRadius:12, fontSize:12, cursor:'pointer', border:`1px solid ${tradeTag===t?'#8b5cf6':'#1e2d45'}`, background:tradeTag===t?'#8b5cf622':'transparent', color:tradeTag===t?'#8b5cf6':'#94a3b8', fontWeight:tradeTag===t?700:400 }}>{t}</button>
              ))}
            </div>
          </div>
        )}
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요" maxLength={100}
          style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:'#111827', border:'1px solid #1e2d45', color:'#e2e8f0', fontSize:13, marginBottom:10, boxSizing:'border-box', outline:'none' }} />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용을 입력하세요 (선택)" rows={4}
          style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:'#111827', border:'1px solid #1e2d45', color:'#e2e8f0', fontSize:13, marginBottom:14, boxSizing:'border-box', resize:'none', outline:'none' }} />
        <button onClick={submit} disabled={submitting} style={{ width:'100%', padding:'12px', borderRadius:10, background:submitting?'#1e2d45':'#3b82f6', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
          {submitting ? '등록 중...' : '게시글 등록'}
        </button>
      </div>
    </div>
  );
}

// ── 메인 Board ───────────────────────────────────────
function Board({ user }) {
  const [tab, setTab]             = useState('team');
  const [posts, setPosts]         = useState([]);
  const [news, setNews]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [showWrite, setShowWrite] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [likes, setLikes]         = useState({});
  const [dislikes, setDislikes]   = useState({});
  const [reports, setReports]     = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = 검색 안 한 상태
  const [searching, setSearching] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (tab === 'news') return;
    setLoading(true);
    try {
      const res  = await fetch(`${SERVER}/api/posts?boardType=${tab}`);
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch(e) { console.log('게시글 불러오기 실패:', e); }
    setLoading(false);
  }, [tab]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${SERVER}/api/news`);
      const data = await res.json();
      if (data.success) setNews(data.data);
    } catch(e) { console.log('뉴스 불러오기 실패:', e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    setSearchResults(null);
    setSearchQuery('');
    if (tab === 'news') fetchNews();
    else fetchPosts();
  }, [tab, fetchPosts, fetchNews]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res  = await fetch(`${SERVER}/api/search?q=${encodeURIComponent(searchQuery)}&boardType=${tab}`);
      const data = await res.json();
      if (data.success) setSearchResults(data.data);
    } catch(e) { console.log('검색 실패:', e); }
    setSearching(false);
  };

  const handleLike = async (postId) => {
    if (likes[postId]) return;
    setLikes(p => ({ ...p, [postId]: true }));
    await fetch(`${SERVER}/api/posts/${postId}/like`, { method:'POST' });
  };

  const handleDislike = async (postId) => {
    if (dislikes[postId]) return;
    setDislikes(p => ({ ...p, [postId]: true }));
    await fetch(`${SERVER}/api/posts/${postId}/dislike`, { method:'POST' });
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('게시글을 삭제할까요?')) return;
    const token = localStorage.getItem('dugout_token');
    try {
      const res  = await fetch(`${SERVER}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization':'Bearer ' + token },
      });
      const data = await res.json();
      if (data.success) fetchPosts();
      else alert(data.message);
    } catch(e) { alert('삭제 실패'); }
  };

  const displayPosts  = searchResults !== null ? searchResults : posts;
  const hotPosts      = displayPosts.filter(p => (p.likes??0) >= 10);
  const normalPosts   = displayPosts.filter(p => (p.likes??0) < 10);

  return (
    <div style={{ paddingBottom:80 }}>
      {selected && (
        <PostDetail post={selected} user={user}
          onClose={() => setSelected(null)}
          onDeleted={() => { fetchPosts(); setSelected(null); }}
        />
      )}

      {/* 탭 */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e2d45', overflowX:'auto', backgroundColor:'#080c14', position:'sticky', top:0, zIndex:5 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:'11px 14px', border:'none', background:'transparent',
            fontSize:13, fontWeight:700, cursor:'pointer', flexShrink:0,
            color: tab===t.key?'#3b82f6':'#64748b',
            borderBottom: `2px solid ${tab===t.key?'#3b82f6':'transparent'}`,
          }}>{t.label}</button>
        ))}
      </div>

      {/* 검색 바 (뉴스 탭 제외) */}
      {tab !== 'news' && (
        <div style={{ padding:'10px 14px 0', display:'flex', gap:7 }}>
          <input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); if(!e.target.value) setSearchResults(null); }}
            onKeyDown={e => e.key==='Enter' && handleSearch()}
            placeholder="게시글 검색..."
            style={{ flex:1, background:'#111827', border:'1px solid #1e2d45', borderRadius:10, padding:'8px 12px', color:'#e2e8f0', fontSize:13, outline:'none' }}
          />
          {searchResults !== null ? (
            <button onClick={() => { setSearchResults(null); setSearchQuery(''); }} style={{ padding:'8px 12px', borderRadius:10, background:'#1e2d45', border:'none', color:'#94a3b8', fontSize:12, cursor:'pointer' }}>✕ 취소</button>
          ) : (
            <button onClick={handleSearch} disabled={searching} style={{ padding:'8px 14px', borderRadius:10, background:'#3b82f6', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              {searching ? '...' : '🔍'}
            </button>
          )}
        </div>
      )}

      <div style={{ padding:'10px 14px' }}>
        {/* 검색 결과 헤더 */}
        {searchResults !== null && (
          <div style={{ fontSize:12, color:'#64748b', marginBottom:10 }}>
            🔍 "{searchQuery}" 검색 결과 {searchResults.length}개
          </div>
        )}

        {loading && <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b', fontSize:13 }}>불러오는 중...</div>}

        {tab==='news' && !loading && (
          news.length===0
            ? <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b', fontSize:13 }}>뉴스를 불러오는 중이에요...</div>
            : news.map((item,i) => <NewsCard key={i} item={item} />)
        )}

        {tab!=='news' && !loading && (
          <>
            {displayPosts.length===0 && (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b', fontSize:13 }}>
                {searchResults !== null ? '검색 결과가 없어요 😢' : '아직 게시글이 없어요. 첫 글을 작성해보세요! ✍️'}
              </div>
            )}
            {searchResults === null && hotPosts.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
                  <span style={{ fontSize:13 }}>🔥</span>
                  <span style={{ fontSize:11, fontWeight:700, color:'#ef4444' }}>HOT 게시글</span>
                </div>
                {hotPosts.slice(0,3).map(post => (
                  <PostCard key={post.id} post={post} type={tab}
                    onClick={() => setSelected(post)}
                    liked={likes[post.id]} onLike={() => handleLike(post.id)}
                    disliked={dislikes[post.id]} onDislike={() => handleDislike(post.id)}
                    reported={reports[post.id]} onReport={() => setReports(p => ({ ...p, [post.id]:true }))}
                    isMyPost={user && post.authorId === user.id}
                    onDelete={() => handleDelete(post.id)}
                  />
                ))}
                <div style={{ height:1, background:'#1e2d45', margin:'12px 0' }} />
              </div>
            )}
            {(searchResults !== null ? displayPosts : normalPosts).map(post => (
              <PostCard key={post.id} post={post} type={tab}
                onClick={() => setSelected(post)}
                liked={likes[post.id]} onLike={() => handleLike(post.id)}
                disliked={dislikes[post.id]} onDislike={() => handleDislike(post.id)}
                reported={reports[post.id]} onReport={() => setReports(p => ({ ...p, [post.id]:true }))}
                isMyPost={user && post.authorId === user.id}
                onDelete={() => handleDelete(post.id)}
              />
            ))}
            {searchResults === null && (
              <div style={{ textAlign:'center', marginTop:12 }}>
                <button onClick={() => setShowWrite(true)} style={{ padding:'10px 24px', background:'#3b82f6', border:'none', borderRadius:20, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  ✏️ 글쓰기
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showWrite && (
        <WriteModal tab={tab} onClose={() => setShowWrite(false)}
          onSuccess={() => { setShowWrite(false); fetchPosts(); }} />
      )}
    </div>
  );
}

export default Board;