import { FormEvent, useMemo, useState } from 'react'

type Exchange = 'NSE' | 'BSE'
type Side = 'CE' | 'PE'
type OptionRow = { symbol: string; expiry: string; strike: number; side: Side; ltp: number; change: number; volume: string; oi: string; iv: string }
type Position = OptionRow & { quantity: number; entry: number; last: number }

const demoRows: OptionRow[] = [
  { symbol: 'NIFTY', expiry: '03 OCT 2026', strike: 25_000, side: 'CE', ltp: 184.2, change: 8.4, volume: '18.4L', oi: '2.8Cr', iv: '12.8%' },
  { symbol: 'NIFTY', expiry: '03 OCT 2026', strike: 25_000, side: 'PE', ltp: 161.8, change: -5.1, volume: '16.1L', oi: '2.2Cr', iv: '13.2%' },
  { symbol: 'BANKNIFTY', expiry: '09 OCT 2026', strike: 52_000, side: 'CE', ltp: 412.6, change: 12.7, volume: '9.8L', oi: '1.4Cr', iv: '16.6%' },
  { symbol: 'BANKNIFTY', expiry: '09 OCT 2026', strike: 52_000, side: 'PE', ltp: 386.4, change: -9.2, volume: '8.9L', oi: '1.1Cr', iv: '17.1%' },
  { symbol: 'SENSEX', expiry: '09 OCT 2026', strike: 82_000, side: 'CE', ltp: 528.9, change: 18.6, volume: '4.2L', oi: '62.4L', iv: '14.9%' },
  { symbol: 'SENSEX', expiry: '09 OCT 2026', strike: 82_000, side: 'PE', ltp: 494.1, change: -12.4, volume: '3.8L', oi: '58.7L', iv: '15.4%' },
]

const formatMoney = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [exchange, setExchange] = useState<Exchange>('NSE')
  const [sector, setSector] = useState('All contracts')
  const [wallet, setWallet] = useState(500_000)
  const [positions, setPositions] = useState<Position[]>([])
  const [notice, setNotice] = useState('Paper mode is active. Orders never reach a broker.')

  const rows = useMemo(() => exchange === 'BSE' ? demoRows.filter((row) => row.symbol === 'SENSEX') : demoRows.filter((row) => sector === 'All contracts' || row.symbol === sector), [exchange, sector])
  const invested = positions.reduce((total, position) => total + position.entry * position.quantity, 0)
  const pnl = positions.reduce((total, position) => total + (position.last - position.entry) * position.quantity, 0)

  const login = (event: FormEvent) => {
    event.preventDefault()
    const expectedUser = import.meta.env.VITE_DEMO_USER || 'trader'
    const expectedPassword = import.meta.env.VITE_DEMO_PASSWORD || 'change-me'
    if (userId === expectedUser && password === expectedPassword) {
      setAuthenticated(true)
      setLoginError('')
    } else setLoginError('Credentials do not match the configured demo account.')
  }

  const executeOrder = (row: OptionRow) => {
    const quantity = 25
    const cost = row.ltp * quantity
    if (cost > wallet) {
      setNotice('Insufficient paper wallet balance for this order.')
      return
    }
    setWallet((value) => value - cost)
    setPositions((current) => [...current, { ...row, quantity, entry: row.ltp, last: row.ltp + row.change / 10 }])
    setNotice(`Bought ${quantity} units of ${row.symbol} ${row.strike} ${row.side} in paper mode.`)
  }

  if (!authenticated) return <LoginScreen userId={userId} password={password} error={loginError} setUserId={setUserId} setPassword={setPassword} onSubmit={login} />

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="DevilTrade home"><img src="/logo.svg" alt="" /><span>DEVIL<span>TRADE</span></span></a>
        <div className="market-status"><span className="status-dot" /> Markets simulated <small>26 Sep 2026 · 11:42 IST</small></div>
        <button className="ghost-button" onClick={() => setAuthenticated(false)}>Sign out</button>
      </header>

      <main className="dashboard">
        <section className="dashboard-heading"><div><p className="eyebrow">Paper trading terminal</p><h1>Good morning, trader.</h1><p className="muted">Read the chain. Model the move. Trade with discipline.</p></div><div className="session-chip"><span className="status-dot" /> Simulated account</div></section>
        <section className="metric-grid">
          <Metric label="Paper wallet" value={formatMoney(wallet)} detail="Available margin" />
          <Metric label="Capital deployed" value={formatMoney(invested)} detail="Across open positions" />
          <Metric label="Open P&L" value={`${pnl >= 0 ? '+' : ''}${formatMoney(pnl)}`} detail="Marked to simulated LTP" positive={pnl >= 0} />
        </section>
        <section className="workspace-grid">
          <div className="chain-panel panel">
            <div className="panel-heading"><div><p className="eyebrow">Derivatives / Options</p><h2>Option chain</h2></div><span className="live-pill">● Simulated feed</span></div>
            <div className="filters"><div className="segmented">{(['NSE', 'BSE'] as Exchange[]).map((value) => <button className={exchange === value ? 'active' : ''} key={value} onClick={() => { setExchange(value); setSector('All contracts') }}>{value}</button>)}</div><select value={sector} onChange={(event) => setSector(event.target.value)}><option>All contracts</option><option>NIFTY</option><option>BANKNIFTY</option><option>SENSEX</option></select></div>
            <div className="table-wrap"><table><thead><tr><th>Contract</th><th>Expiry</th><th>Strike</th><th>Side</th><th>LTP</th><th>Change</th><th>Volume</th><th>OI</th><th>IV</th><th /></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.symbol}-${row.side}-${index}`}><td className="strong">{row.symbol}</td><td>{row.expiry}</td><td>{row.strike.toLocaleString('en-IN')}</td><td><span className={`side-tag ${row.side.toLowerCase()}`}>{row.side}</span></td><td className="strong">{formatMoney(row.ltp)}</td><td className={row.change >= 0 ? 'positive' : 'negative'}>{row.change >= 0 ? '+' : ''}{row.change}%</td><td>{row.volume}</td><td>{row.oi}</td><td>{row.iv}</td><td><button className="buy-button" onClick={() => executeOrder(row)}>Buy</button></td></tr>)}</tbody></table></div>
            <p className="table-note">Indicative values for paper trading only. NSE/BSE exchange data requires a licensed market-data provider.</p>
          </div>
          <aside className="side-column"><div className="order-panel panel"><p className="eyebrow">Order tape</p><h2>Recent activity</h2>{notice && <div className="notice">{notice}</div>}{positions.length === 0 ? <div className="empty-state"><span className="empty-icon">＋</span><p>No orders yet</p><small>Buy a contract from the chain to open a paper position.</small></div> : <div className="order-list">{positions.slice(-4).reverse().map((position, index) => <div className="order-item" key={`${position.symbol}-${index}`}><div><strong>{position.symbol} {position.strike} {position.side}</strong><small>{position.quantity} units · Entry {formatMoney(position.entry)}</small></div><span className="positive">{formatMoney((position.last - position.entry) * position.quantity)}</span></div>)}</div>}</div><div className="risk-panel panel"><p className="eyebrow">Desk note</p><h3>Paper first. Real money later.</h3><p>Use this dashboard to test sizing, entries, and exits. Every value here is simulated and no order is sent to an exchange.</p></div></aside>
        </section>
        <section className="positions-panel panel"><div className="panel-heading"><div><p className="eyebrow">Portfolio</p><h2>Open positions</h2></div><span className="muted">{positions.length} contracts</span></div>{positions.length === 0 ? <p className="muted empty-row">Your executed paper orders will appear here with live-style P&L marking.</p> : <div className="table-wrap"><table><thead><tr><th>Contract</th><th>Side</th><th>Qty</th><th>Entry</th><th>Simulated LTP</th><th>P&L</th></tr></thead><tbody>{positions.map((position, index) => <tr key={`${position.symbol}-${index}`}><td className="strong">{position.symbol} {position.strike}</td><td><span className={`side-tag ${position.side.toLowerCase()}`}>{position.side}</span></td><td>{position.quantity}</td><td>{formatMoney(position.entry)}</td><td>{formatMoney(position.last)}</td><td className="positive">+{formatMoney((position.last - position.entry) * position.quantity)}</td></tr>)}</tbody></table></div>}</section>
      </main>
      <footer className="footer"><div className="brand footer-brand"><img src="/logo.svg" alt="" /><span>DEVIL<span>TRADE</span></span></div><p>Options give traders the right, not the obligation, to buy or sell an underlying asset at a chosen strike before expiry. Understand time decay, implied volatility, position sizing, and risk before every trade.</p><small>Built for learning. Not investment advice.</small></footer>
    </div>
  )
}

function Metric({ label, value, detail, positive }: { label: string; value: string; detail: string; positive?: boolean }) { return <div className="metric panel"><p>{label}</p><strong className={positive ? 'positive' : ''}>{value}</strong><small>{detail}</small></div> }
function LoginScreen({ userId, password, error, setUserId, setPassword, onSubmit }: { userId: string; password: string; error: string; setUserId: (value: string) => void; setPassword: (value: string) => void; onSubmit: (event: FormEvent) => void }) { return <div className="login-page"><div className="login-art"><div className="brand"><img src="/logo.svg" alt="" /><span>DEVIL<span>TRADE</span></span></div><div><p className="eyebrow">Private paper terminal</p><h1>Trade the idea<br /><em>before the capital.</em></h1><p>Study option behavior across NSE and BSE with a paper wallet built for thoughtful decisions.</p></div><small>Simulated markets · No broker connection</small></div><form className="login-card" onSubmit={onSubmit}><p className="eyebrow">Welcome back</p><h2>Sign in to your desk</h2><p className="muted">Use the credentials configured in your local environment.</p><label>User ID<input value={userId} onChange={(event) => setUserId(event.target.value)} autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">Enter paper terminal <span>→</span></button><small className="form-hint">Default local demo: trader / change-me. Set your own values in <code>.env</code>.</small></form></div> }

export default App
