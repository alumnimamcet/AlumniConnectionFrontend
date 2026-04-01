import React, { useState, useEffect } from 'react';
import { FiFileText, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { postService } from '../../services/api';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const AdminPosts = () => {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [delId, setDelId]     = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postService.getFeed();
      setPosts(res.data.data || []);
    } catch {
      toast.error('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    setDelId(postId);
    try {
      await postService.deletePost(postId);
      setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
      toast.success('Post deleted.');
    } catch {
      toast.error('Failed to delete post.');
    } finally {
      setDelId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
            <FiFileText size={18} style={{ marginRight: 8, color: '#10b981', verticalAlign: 'middle' }} />
            Post Moderation
          </h2>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 4, marginBottom: 0 }}>{posts.length} posts in the feed</p>
        </div>
        <button
          onClick={fetchPosts}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#555', fontWeight: 600 }}
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><ClipLoader color="#10b981" size={36} /></div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#aaa', background: '#fff', borderRadius: 14 }}>No posts found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map(post => {
            const pid = post._id || post.id;
            const author = post.author || post.user;
            return (
              <div
                key={pid}
                style={{
                  background: '#fff', borderRadius: 14, padding: '16px 20px',
                  border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  opacity: delId === pid ? 0.5 : 1, transition: 'opacity 0.2s',
                }}
              >
                {/* Avatar */}
                <div className="ap-mini-avatar" style={{ width: 36, height: 36, fontSize: 14, background: '#6366f118', color: '#6366f1', flexShrink: 0 }}>
                  {author?.name?.[0]?.toUpperCase() || '?'}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{author?.name || 'Unknown'}</span>
                      <span style={{
                        marginLeft: 8,
                        background: '#6366f118', color: '#6366f1',
                        borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 600,
                      }}>{author?.role || 'user'}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(pid)}
                      disabled={delId === pid}
                      style={{
                        background: 'rgba(200,64,34,0.08)', border: 'none', borderRadius: 8,
                        padding: '6px 10px', cursor: 'pointer', color: '#c84022',
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                      }}
                    >
                      {delId === pid ? <ClipLoader size={12} color="#c84022" /> : <><FiTrash2 size={13} /> Delete</>}
                    </button>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: 13.5, color: '#444', lineHeight: 1.5 }}>
                    {(post.content || '').slice(0, 200)}{(post.content || '').length > 200 ? '…' : ''}
                  </p>
                  {post.media && (
                    <img
                      src={post.media}
                      alt="post media"
                      style={{ maxHeight: 140, borderRadius: 8, objectFit: 'cover', marginBottom: 6 }}
                    />
                  )}
                  <div style={{ fontSize: 11, color: '#bbb' }}>
                    {post.likes?.length || 0} likes · {post.comments?.length || 0} comments ·{' '}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
