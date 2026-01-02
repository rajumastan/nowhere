// NOTE: this is a drop-in replacement / patch for the existing ui.js fetch usage.
// It uses window.NOWHERE_API_BASE if set (recommended), otherwise falls back to
// http://localhost:3000 for local development.

const API_BASE = window.NOWHERE_API_BASE || (location.hostname === 'localhost' ? 'http://localhost:3000' : '');

function fullUrl(path) {
  // If API_BASE is empty string, assume same origin (relative path)
  if (!API_BASE) {
    return path.startsWith('/') ? path : '/' + path;
  }
  return API_BASE.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
}

// Example usage changes in the UI code below:
// old: fetch(`http://localhost:3000/api/messages/channel/${server._id}/${ch.id}`)
// new:
  // fetch(fullUrl(`/api/messages/channel/${server._id}/${ch.id}`), { headers: { Authorization: 'Bearer ' + token } })

// --- Below: keep the rest of the ui code but update fetch calls to use fullUrl(...) ---

// ... existing ui.js content, but ensure every fetch(...) uses fullUrl(...)
sidebarChannels.appendChild(header);

const list = document.createElement('div'); 
list.className = 'channel-list';

server.channels.forEach(ch => {
  const el = document.createElement('div'); 
  el.className = 'channel'; 
  el.textContent = '# ' + ch.name;
  
  el.addEventListener('click', async () => {
    document.querySelectorAll('.channel').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    
    current.serverId = server._id;
    current.channelId = ch.id;
    current.dmUserId = null;
    channelTitle.textContent = `# ${ch.name}`;
    
    window.__nowhere_socket.joinChannel(server._id, ch.id);
    
    const token = localStorage.getItem('nowhere_token');
    const res = await fetch(
      fullUrl(`/api/messages/channel/${server._id}/${ch.id}`), 
      { headers: { Authorization: 'Bearer ' + token } }
    );
    const msgs = await res.json();
    renderMessages(msgs);
  });
  
  list.appendChild(el);
});

// --- similarly update other fetch calls in the file ---
