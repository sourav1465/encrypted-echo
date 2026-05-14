import { useState, useEffect } from 'react';
import axios from 'axios';

// NEW: Dynamic API URL for Vercel Deployment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) window.location.href = '/'; 
    else fetchPosts();
  }, [token]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data.reverse());
    } catch (error) { console.error(error); }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/posts/${editingId}`, 
          { title, content, imageUrl, videoUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('✅ Broadcast Updated!');
      } else {
        await axios.post(`${API_URL}/api/posts`, 
          { title, content, imageUrl, videoUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('✅ Broadcast Published!');
      }
      resetForm();
      fetchPosts();
    } catch (error) { setMessage('❌ Action Failed.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transmission forever?")) return;
    try {
      await axios.delete(`${API_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (error) { alert("Delete failed"); }
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.imageUrl || '');
    setVideoUrl(post.videoUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setVideoUrl('');
    setEditingId(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  return (
    <>
      <style>
        {`
          body, html { margin: 0; padding: 0; background-color: #0f172a !important; min-height: 100vh; }
          @keyframes pan { from { background-position: 0 0; } to { background-position: 800px 800px; } }
          
          .dashboard-bg {
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAwJyBoZWlnaHQ9JzQwMCcgdmlld0JveD0nMCAwIDQwMCA0MDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PGcgZmlsbD0nIzM4YmRmOCcgZmlsbC1vcGFjaXR5PScwLjI1JyBmb250LWZhbWlseT0nQXJpYWwsIHNhbnMtc2VyaWYnIGZvbnQtd2VpZ2h0PSdib2xkJz48dGV4dCB4PScyMCcgeT0nNTAnIGZvbnQtc2l6ZT0nMjQnPuKcjjwvdGV4dD48dGV4dCB4PScxNTAnIHk9JzYwJyBmb250LXNpemU9JzI4Jz4jPC90ZXh0Pjx0ZXh0IHg9JzI4MCcgeT0nNDAnIGZvbnQtc2l6ZT0nMjInPvCfk5Y8L3RleHQ+PHRleHQgeD0nMzUwJyB5PSc4MCcgZm9udC1zaXplPScyMCc+QDwvdGV4dD48dGV4dCB4PSc2MCcgeT0nMTYwJyBmb250LXNpemU9JzI2Jz7wn5GsPC90ZXh0Pjx0ZXh0IHg9JzE4MCcgeT0nMTQwJyBmb250LXNpemU9JzIwJz4mbHQ7LyZndDs8L3RleHQ+PHRleHQgeD0nMzAwJyB5PScxNzAnIGZvbnQtc2l6ZT0nMjQnPvCfkqg8L3RleHQ+PHRleHQgeD0nNDAnIHk9JzI3MCcgZm9udC1zaXplPScyMic+IiI8L3RleHQ+PHRleHQgeD0nMTQwJyB5PScyODAnIGZvbnQtc2l6ZT0nMTgnPuKMqDwvdGV4dD48dGV4dCB4PScyNjAnIHk9JzI2MCcgZm9udC1zaXplPScyNic+8J+DojwvdGV4dD48dGV4dCB4PSczNjAnIHk9JzMwMCcgZm9udC1zaXplPScyMCc+IzwvdGV4dD48L2c+PC9zdmc+");
            animation: pan 60s linear infinite; z-index: 0;
          }

          .dashboard-content { position: relative; z-index: 10; min-height: 100vh; padding: 20px; color: #f8fafc; box-sizing: border-box; font-family: 'Inter', sans-serif; }
          .dashboard-container { max-width: 1000px; margin: 0 auto; }

          .navbar { display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(56, 189, 248, 0.3); padding: 15px 30px; border-radius: 16px; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
          .navbar h1 { margin: 0; font-size: 24px; color: #38bdf8; text-transform: uppercase; font-weight: 800; }

          .editor-card { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px; padding: 30px; margin-bottom: 40px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); }
          .styled-input { width: 100%; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 15px; color: white; font-size: 16px; margin-bottom: 15px; box-sizing: border-box; transition: all 0.3s; }
          .styled-input:focus { border-color: #38bdf8; outline: none; background: rgba(255,255,255,0.1); }
          
          .url-input { padding: 12px; font-size: 14px; margin-bottom: 10px; }

          .publish-btn { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; width: 100%; text-transform: uppercase; letter-spacing: 1px; transition: transform 0.2s; margin-top: 10px; }
          .publish-btn:hover { transform: translateY(-2px); }
          .cancel-btn { background: transparent; color: #94a3b8; border: none; cursor: pointer; margin-top: 10px; width: 100%; font-weight: 600; }

          .feed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; padding-bottom: 50px; }
          .post-card { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 16px; padding: 25px; position: relative; transition: transform 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
          .post-card:hover { transform: translateY(-5px); border-color: rgba(56,189,248,0.4); }
          
          /* Updated Image Style for Portrait photos */
          .post-image { width: 100%; max-height: 500px; object-fit: contain; border-radius: 8px; margin-bottom: 15px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); }
          .post-video { width: 100%; height: 200px; border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.1); }

          .action-bar { display: flex; gap: 15px; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; }
          .action-icon { cursor: pointer; font-size: 13px; font-weight: bold; transition: opacity 0.2s; }
          .action-icon:hover { opacity: 0.7; }
          .edit-icon { color: #38bdf8; }
          .delete-icon { color: #f43f5e; }
        `}
      </style>

      <div className="dashboard-bg"></div>
      <div className="dashboard-content">
        <div className="dashboard-container">
          <div className="navbar">
            <h1>Encrypted Echo</h1>
            <button onClick={handleLogout} style={{background:'rgba(244,63,94,0.1)', color:'#fb7185', border:'1px solid rgba(244,63,94,0.4)', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Disconnect</button>
          </div>

          <div className="editor-card">
            <h2 style={{marginTop:0, color:'#e2e8f0', marginBottom:'20px'}}>{editingId ? 'Edit Broadcast' : 'Transmit New Broadcast'}</h2>
            <form onSubmit={handlePostSubmit}>
              <input type="text" placeholder="Subject / Title *" className="styled-input" value={title} onChange={(e)=>setTitle(e.target.value)} required />
              
              <textarea placeholder="Type your message here... *" className="styled-input" style={{minHeight:'120px', resize:'vertical'}} value={content} onChange={(e)=>setContent(e.target.value)} required />
              
              <div style={{display: 'flex', gap: '10px'}}>
                <input type="text" placeholder="Image Link (Optional)" className="styled-input url-input" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} />
                <input type="text" placeholder="YouTube Link (Optional)" className="styled-input url-input" value={videoUrl} onChange={(e)=>setVideoUrl(e.target.value)} />
              </div>

              <button type="submit" className="publish-btn">{editingId ? 'Update Transmission' : 'Transmit'}</button>
              {editingId && <button type="button" onClick={resetForm} className="cancel-btn">Cancel Edit</button>}
            </form>
            {message && <div style={{marginTop:'15px', textAlign:'center', fontWeight:'bold', color: message.includes('❌') ? '#fb7185' : '#34d399'}}>{message}</div>}
          </div>

          <h2 style={{ color: '#94a3b8', fontSize: '18px', borderBottom: '1px solid rgba(56,189,248,0.2)', paddingBottom: '10px' }}>Recent Transmissions</h2>

          <div className="feed-grid">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post Attachment" className="post-image" onError={(e) => e.target.style.display = 'none'} />
                )}

                {post.videoUrl && getEmbedUrl(post.videoUrl) && (
                  <iframe 
                    className="post-video"
                    src={getEmbedUrl(post.videoUrl)} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                )}

                <h3 style={{margin:'0 0 10px 0', fontSize:'20px'}}>{post.title}</h3>
                <p style={{color:'#cbd5e1', fontSize:'15px', lineHeight:'1.5', wordWrap:'break-word'}}>{post.content}</p>
                <div style={{fontSize:'12px', fontWeight:'600', color:'#7dd3fc', background:'rgba(56,189,248,0.15)', padding:'4px 10px', borderRadius:'6px', display:'inline-block'}}>By: {post.author}</div>
                
                {/* CO5: AI Sentiment Analyzer */}
                <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                  AI Insight: {
                    post.content.toLowerCase().includes('good') || post.content.toLowerCase().includes('great') || post.content.toLowerCase().includes('best') 
                    ? '✨ Positive Sentiment Detected' 
                    : '🤖 Neutral Analysis Complete'
                  }
                </div>

                <div className="action-bar">
                  <span className="action-icon edit-icon" onClick={() => startEdit(post)}>✎ EDIT</span>
                  <span className="action-icon delete-icon" onClick={() => handleDelete(post._id)}>🗑 DELETE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;