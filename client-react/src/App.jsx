import { useState } from 'react';

const STATUS = {
  idle: 'idle',
  pending: 'pending',
  ok: 'ok',
  err: 'err'
};

export default function App() {
  const [serverUrl, setServerUrl] = useState('http://localhost:4000');
  const [page, setPage] = useState('Home');
  const [title, setTitle] = useState('Welcome');
  const [description, setDescription] = useState('Updated Text');

  const [status, setStatus] = useState(STATUS.idle);
  const [message, setMessage] = useState('');

  async function handlePublish(e) {
    e.preventDefault();
    setStatus(STATUS.pending);
    setMessage('Publishing... contacting server...');

    const cleanUrl = serverUrl.replace(/\/$/, '');
    const payload = { page, title, description };

    try {
      const res = await fetch(cleanUrl + '/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setStatus(STATUS.ok);
        setMessage('SUCCESS\n\n' + JSON.stringify(data, null, 2));
      } else {
        setStatus(STATUS.err);
        setMessage(`FAILED (HTTP ${res.status})\n\n` + JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setStatus(STATUS.err);
      setMessage(
        `Could not reach server at ${cleanUrl}\n\n${err.message}\n\n` +
        'Check: is the server running? Is the URL/port correct? Is CORS enabled on the server?'
      );
    }
  }

  return (
    <div className="page">
      <h1>Client App (CMS)</h1>
      <p>
        This is the "Client App" box in the diagram. It POSTs to the Server
        Application's <code>/publish</code> endpoint.
      </p>

      <form onSubmit={handlePublish}>
        <label>Server URL</label>
        <input value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} />

        <label>Page</label>
        <input value={page} onChange={(e) => setPage(e.target.value)} />

        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

        <button type="submit" disabled={status === STATUS.pending}>
          {status === STATUS.pending ? 'Publishing...' : 'Publish'}
        </button>
      </form>

      {status !== STATUS.idle && (
        <pre className={`status ${status}`}>{message}</pre>
      )}
    </div>
  );
}
