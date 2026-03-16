import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const CATEGORIES = ['Mathematics','Science','English','History','Computer Science','Literature','Geography','Art','Music','Reference'];
const emptyBook = { title:'', author:'', isbn:'', category:'Mathematics', publisher:'', publishYear:'', totalCopies:1, availableCopies:1, location:'', description:'' };
const emptyIssue = { book:'', borrower:'', borrowerModel:'Student', dueDate:'' };

export default function Library() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('books');
  const [search, setSearch] = useState('');
  const [bookModal, setBookModal] = useState(false);
  const [issueModal, setIssueModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [bookForm, setBookForm] = useState(emptyBook);
  const [issueForm, setIssueForm] = useState(emptyIssue);
  const [saving, setSaving] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const [br, ir, sr] = await Promise.all([
        API.get('/library/books', { params: search ? { search } : {} }),
        API.get('/library/issues', { params: { status: 'issued' } }),
        API.get('/students', { params: { limit: 200 } }),
      ]);
      setBooks(br.data); setIssues(ir.data); setStudents(sr.data.students);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleBookSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      editId ? await API.put(`/library/books/${editId}`, bookForm) : await API.post('/library/books', bookForm);
      toast.success(editId ? 'Updated!' : 'Book added!');
      setBookModal(false); fetchBooks();
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleIssueSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post('/library/issue', issueForm);
      toast.success('Book issued!');
      setIssueModal(false); fetchBooks();
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleReturn = async id => {
    try { await API.patch(`/library/return/${id}`); toast.success('Book returned!'); fetchBooks(); }
    catch { toast.error('Error'); }
  };

  const bf = (k, v) => setBookForm(p => ({ ...p, [k]: v }));
  const isf = (k, v) => setIssueForm(p => ({ ...p, [k]: v }));

  const totalBooks = books.reduce((s, b) => s + b.totalCopies, 0);
  const availableBooks = books.reduce((s, b) => s + b.availableCopies, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Library</div>
          <div className="page-subtitle">{books.length} titles · {totalBooks} total copies</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => { setIssueForm(emptyIssue); setIssueModal(true); }}>📤 Issue Book</button>
          <button className="btn btn-primary" onClick={() => { setBookForm(emptyBook); setEditId(null); setBookModal(true); }}>+ Add Book</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', marginBottom: 20 }}>
        {[
          { l: 'Total Titles', v: books.length, i: '📚', bg: 'rgba(67,97,238,0.1)' },
          { l: 'Total Copies', v: totalBooks, i: '📖', bg: 'rgba(16,185,129,0.1)' },
          { l: 'Available', v: availableBooks, i: '✅', bg: 'rgba(245,158,11,0.1)' },
          { l: 'Issued', v: issues.length, i: '📤', bg: 'rgba(239,68,68,0.1)' },
        ].map(c => (
          <div key={c.l} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: c.bg }}><span style={{ fontSize: 22 }}>{c.i}</span></div>
            <div className="stat-body"><div className="stat-label">{c.l}</div><div className="stat-value">{c.v}</div></div>
          </div>
        ))}
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'books' ? 'active' : ''}`} onClick={() => setTab('books')}>📚 Books</button>
        <button className={`tab-btn ${tab === 'issued' ? 'active' : ''}`} onClick={() => setTab('issued')}>📤 Issued ({issues.length})</button>
      </div>

      {tab === 'books' && (
        <>
          <div className="search-bar">
            <div className="search-box">
              <span className="search-box-icon">🔍</span>
              <input placeholder="Search title, author, ISBN..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="card">
            {loading ? <div className="loading-wrap"><div className="spinner" /></div> :
              books.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📚</div><p>No books found</p></div> : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Book</th><th>Author</th><th>Category</th><th>ISBN</th><th>Copies</th><th>Available</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {books.map(b => (
                        <tr key={b._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#4361ee,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📖</div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{b.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.bookId} · {b.publishYear || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 13 }}>{b.author}</td>
                          <td><span className="badge badge-accent">{b.category}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'monospace' }}>{b.isbn || '-'}</td>
                          <td style={{ fontWeight: 600 }}>{b.totalCopies}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: b.availableCopies > 0 ? 'var(--success)' : 'var(--danger)' }}>{b.availableCopies}</span>
                          </td>
                          <td><span className={`badge badge-${b.availableCopies > 0 ? 'success' : 'danger'}`}>{b.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button className="btn btn-sm btn-secondary" onClick={() => { setBookForm({ title: b.title, author: b.author, isbn: b.isbn || '', category: b.category, publisher: b.publisher || '', publishYear: b.publishYear || '', totalCopies: b.totalCopies, availableCopies: b.availableCopies, location: b.location || '', description: b.description || '' }); setEditId(b._id); setBookModal(true); }}>✏️</button>
                              <button className="btn btn-sm btn-danger" onClick={async () => { if (!window.confirm('Delete?')) return; await API.delete(`/library/books/${b._id}`); fetchBooks(); }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </>
      )}

      {tab === 'issued' && (
        <div className="card">
          {issues.length === 0 ? <div className="empty-state"><p>No books currently issued</p></div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Book</th><th>Borrower</th><th>Issue Date</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {issues.map(issue => {
                    const isOverdue = new Date() > new Date(issue.dueDate) && issue.status === 'issued';
                    return (
                      <tr key={issue._id}>
                        <td style={{ fontWeight: 600 }}>{issue.book?.title}</td>
                        <td>{issue.borrower?.firstName} {issue.borrower?.lastName}</td>
                        <td style={{ fontSize: 13, color: 'var(--text-3)' }}>{new Date(issue.issueDate).toLocaleDateString()}</td>
                        <td>
                          <span style={{ color: isOverdue ? 'var(--danger)' : 'var(--text)', fontWeight: isOverdue ? 700 : 400 }}>
                            {isOverdue && '⚠️ '}{new Date(issue.dueDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td><span className={`badge badge-${isOverdue ? 'danger' : 'info'}`}>{isOverdue ? 'overdue' : 'issued'}</span></td>
                        <td><button className="btn btn-sm btn-success" onClick={() => handleReturn(issue._id)}>↩️ Return</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Book Modal */}
      {bookModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setBookModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Edit Book' : 'Add Book'}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setBookModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleBookSubmit}>
                <div className="modal-grid">
                  <div className="form-group col-span-2"><label className="form-label">Title *</label><input className="form-input" value={bookForm.title} onChange={e => bf('title', e.target.value)} required /></div>
                  <div className="form-group"><label className="form-label">Author *</label><input className="form-input" value={bookForm.author} onChange={e => bf('author', e.target.value)} required /></div>
                  <div className="form-group"><label className="form-label">ISBN</label><input className="form-input" value={bookForm.isbn} onChange={e => bf('isbn', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Category</label><select className="form-input" value={bookForm.category} onChange={e => bf('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Publisher</label><input className="form-input" value={bookForm.publisher} onChange={e => bf('publisher', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Total Copies</label><input type="number" className="form-input" value={bookForm.totalCopies} onChange={e => bf('totalCopies', parseInt(e.target.value))} min="1" /></div>
                  <div className="form-group"><label className="form-label">Available Copies</label><input type="number" className="form-input" value={bookForm.availableCopies} onChange={e => bf('availableCopies', parseInt(e.target.value))} min="0" /></div>
                  <div className="form-group"><label className="form-label">Publish Year</label><input type="number" className="form-input" value={bookForm.publishYear} onChange={e => bf('publishYear', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Location / Shelf</label><input className="form-input" value={bookForm.location} onChange={e => bf('location', e.target.value)} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setBookModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Book'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {issueModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIssueModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Issue Book</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setIssueModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleIssueSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Book *</label>
                    <select className="form-input" value={issueForm.book} onChange={e => isf('book', e.target.value)} required>
                      <option value="">Select book...</option>
                      {books.filter(b => b.availableCopies > 0).map(b => <option key={b._id} value={b._id}>{b.title} by {b.author} ({b.availableCopies} available)</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Borrower *</label>
                    <select className="form-input" value={issueForm.borrower} onChange={e => isf('borrower', e.target.value)} required>
                      <option value="">Select student...</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentId})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input type="date" className="form-input" value={issueForm.dueDate} onChange={e => isf('dueDate', e.target.value)} required
                      min={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIssueModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Issuing...' : '📤 Issue Book'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
