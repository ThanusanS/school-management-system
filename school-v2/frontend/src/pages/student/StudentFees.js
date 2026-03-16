import React, { useEffect, useState } from 'react';
import API from '../../utils/api';

const STATUS_COLOR = { paid: 'success', pending: 'warning', partial: 'info', overdue: 'danger' };
const FEE_ICON = { tuition: '🏫', transport: '🚌', library: '📚', sports: '⚽', exam: '📝', other: '💰' };

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const r = await API.get('/fees');
        setFees(r.data);
        const total = r.data.reduce((s, f) => s + f.amount, 0);
        const paid = r.data.reduce((s, f) => s + f.paidAmount, 0);
        setSummary({ total, paid, pending: total - paid, count: r.data.length, overdue: r.data.filter(f => f.status === 'overdue').length });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">My Fees</div><div className="page-subtitle">Fee payment status</div></div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', marginBottom: 24 }}>
        {[
          { l: 'Total Fees', v: `$${summary.total?.toLocaleString()}`, i: '💰', bg: 'rgba(67,97,238,0.1)' },
          { l: 'Paid', v: `$${summary.paid?.toLocaleString()}`, i: '✅', bg: 'rgba(16,185,129,0.1)' },
          { l: 'Pending', v: `$${summary.pending?.toLocaleString()}`, i: '⏳', bg: summary.pending > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' },
          { l: 'Overdue', v: summary.overdue, i: '🚨', bg: 'rgba(239,68,68,0.1)' },
        ].map(c => (
          <div key={c.l} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: c.bg }}><span style={{ fontSize: 22 }}>{c.i}</span></div>
            <div className="stat-body"><div className="stat-label">{c.l}</div><div className="stat-value" style={{ fontSize: 22 }}>{c.v}</div></div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      {summary.total > 0 && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 700 }}>Payment Progress</span>
            <span style={{ fontWeight: 800, color: 'var(--success)' }}>{((summary.paid / summary.total) * 100).toFixed(0)}%</span>
          </div>
          <div className="progress-bar" style={{ height: 12 }}>
            <div className="progress-fill" style={{ width: `${(summary.paid / summary.total) * 100}%`, background: 'var(--success)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>
            <span>Paid: ${summary.paid?.toLocaleString()}</span>
            <span>Remaining: ${summary.pending?.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Fee Details</div>
        {fees.length === 0 ? (
          <div className="empty-state"><p>No fee records</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Fee Type</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Due Date</th><th>Receipt</th><th>Status</th></tr></thead>
              <tbody>
                {fees.map(fee => (
                  <tr key={fee._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{FEE_ICON[fee.feeType] || '💰'}</span>
                        <div>
                          <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{fee.feeType}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{fee.semester}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>${fee.amount.toLocaleString()}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>${fee.paidAmount.toLocaleString()}</td>
                    <td>
                      <span style={{ color: fee.amount - fee.paidAmount > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                        ${(fee.amount - fee.paidAmount).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: new Date() > new Date(fee.dueDate) && fee.status !== 'paid' ? 'var(--danger)' : 'var(--text-3)', fontSize: 13 }}>
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-3)' }}>{fee.receiptNumber || '-'}</td>
                    <td>
                      <span className={`badge badge-${STATUS_COLOR[fee.status]}`}>{fee.status}</span>
                      <div className="progress-bar" style={{ marginTop: 4, width: 70 }}>
                        <div className="progress-fill" style={{ width: `${Math.min(100, (fee.paidAmount / fee.amount) * 100)}%`, background: `var(--${STATUS_COLOR[fee.status] === 'success' ? 'success' : STATUS_COLOR[fee.status] === 'warning' ? 'warning' : 'danger'})` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
