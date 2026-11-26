import React, { useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowUpRight, Bot, Bell, Check, ChevronDown,
  CircleHelp, CreditCard, LayoutDashboard, LogOut, Menu, MessageSquare,
  MoreHorizontal, Plus, Search, Send, Settings, ShieldCheck, Sparkles,
  Users, Wallet, X, Zap, Clock3, CircleDollarSign, TrendingUp, Command
} from 'lucide-react';

const initialMessages = [
  { role: 'assistant', text: "Good evening! I'm NIGHT AI, your business assistant. I can help organize tasks, summarize activity, and answer questions about your workspace." }
];

function App() {
  const [active, setActive] = useState('Overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [toast, setToast] = useState('');
  const [tasks, setTasks] = useState([
    { title: 'Review new customer requests', tag: 'Customers', done: false },
    { title: 'Prepare weekly performance summary', tag: 'Reports', done: false },
    { title: 'Update service descriptions', tag: 'Website', done: true }
  ]);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText },
      { role: 'assistant', text: "I can help plan that. This frontend is currently using a demo assistant, so it doesn't connect to a live AI model yet. Once a secure backend and AI API are configured, I'll be able to provide real AI responses." }]);
    setInput('');
  };

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'AI Assistant', icon: Bot },
    { name: 'Customers', icon: Users },
    { name: 'Payments', icon: Wallet },
    { name: 'Activity', icon: Activity }
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={19} /></div>
          <div><strong>NIGHT<span> AI</span></strong><small>BUSINESS WORKSPACE</small></div>
          <button className="mobile-close icon-btn" onClick={() => setMobileNav(false)}><X size={18}/></button>
        </div>
        <div className="workspace-switch">
          <div className="workspace-avatar">N</div>
          <div className="workspace-label"><b>Night Studio</b><small>Free workspace</small></div>
          <ChevronDown size={15} className="muted"/>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navItems.map(({name, icon: Icon}) => (
            <button key={name} className={`nav-item ${active === name ? 'selected' : ''}`}
              onClick={() => { setActive(name); setMobileNav(false); }}>
              <Icon size={18}/><span>{name}</span>{name === 'AI Assistant' && <span className="nav-new">AI</span>}
            </button>
          ))}
        </nav>
        <div className="nav-label tools-label">MANAGEMENT</div>
        <nav>
          <button className="nav-item" onClick={() => notify('Settings will be available when accounts are connected.')}><Settings size={18}/><span>Settings</span></button>
          <button className="nav-item" onClick={() => notify('Help center is coming soon.')}><CircleHelp size={18}/><span>Help center</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><Zap size={16}/></div>
            <b>Unlock more with AI</b>
            <p>Explore plans as your business grows.</p>
            <button onClick={() => notify('Plans are a demo in this starter project.')}>Explore plans <ArrowUpRight size={14}/></button>
          </div>
          <button className="user-profile" onClick={() => setShowProfile(!showProfile)}>
            <div className="user-avatar">JB</div>
            <div className="user-info"><b>Workspace Owner</b><small>owner@example.com</small></div>
            <MoreHorizontal size={18} className="muted"/>
          </button>
          {showProfile && <div className="profile-pop"><b>Demo profile</b><p>Authentication is not connected yet.</p><button onClick={() => notify('Connect authentication before enabling sign out.')}>Account settings</button></div>}
        </div>
      </aside>

      {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}
      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="mobile-menu icon-btn" onClick={() => setMobileNav(true)}><Menu size={20}/></button>
            <div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div>
          </div>
          <div className="top-actions">
            <div className="search-box"><Search size={16}/><input placeholder="Search anything..." value={query} onChange={e => setQuery(e.target.value)}/><kbd>⌘ K</kbd></div>
            <button className="icon-btn notification" onClick={() => notify('You are all caught up.')}><Bell size={18}/><i/></button>
            <div className="top-avatar">JB</div>
          </div>
        </header>

        {active === 'AI Assistant' ? (
          <section className="content chat-page">
            <div className="page-heading"><div><div className="eyebrow"><span className="live-dot"/> NIGHT AI ASSISTANT</div><h1>Your AI workspace.</h1><p>Ask questions and organize your business workflow.</p></div></div>
            <div className="chat-panel">
              <div className="chat-top"><div className="bot-orb"><Bot size={20}/></div><div><b>NIGHT AI</b><small><span className="live-dot"/> Demo assistant · Not connected to live AI</small></div><span className="demo-pill">PREVIEW</span></div>
              <div className="chat-messages">
                {messages.map((m, i) => <div key={i} className={`message-row ${m.role}`}><div className="message-avatar">{m.role === 'assistant' ? <Sparkles size={15}/> : 'JB'}</div><div className="message-bubble"><small>{m.role === 'assistant' ? 'NIGHT AI' : 'YOU'}</small><p>{m.text}</p></div></div>)}
              </div>
              <form className="chat-input" onSubmit={sendMessage}><input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask NIGHT AI anything..." /><button aria-label="Send message" type="submit"><Send size={17}/></button></form>
              <p className="chat-disclaimer">Demo interface. Connect a server-side AI provider to enable real responses.</p>
            </div>
          </section>
        ) : active === 'Customers' ? (
          <section className="content">
            <div className="page-heading split"><div><div className="eyebrow">RELATIONSHIPS</div><h1>Customers</h1><p>Manage customer records in one place.</p></div><button className="primary-btn" onClick={() => notify('Customer creation requires a secure database and account system.')}><Plus size={16}/> Add customer</button></div>
            <div className="empty-panel"><div className="empty-icon"><Users size={24}/></div><h3>Your customer list starts here</h3><p>Customer records will appear here after you connect a database and authentication.</p><button className="secondary-btn" onClick={() => notify('Database setup is the next development step.')}>Set up customer database</button></div>
          </section>
        ) : active === 'Payments' ? (
          <section className="content">
            <div className="page-heading split"><div><div className="eyebrow">REVENUE MANAGEMENT</div><h1>Payments</h1><p>Track transactions and manage payment setup.</p></div><button className="primary-btn" onClick={() => setShowPayment(true)}><CreditCard size={16}/> Payment setup</button></div>
            <div className="notice"><ShieldCheck size={19}/><div><b>Payment integration is not active</b><p>This preview does not collect money or verify GCash payments. Use an approved payment provider and verify transactions on your backend.</p></div></div>
            <div className="stats-grid"><Stat title="Total revenue" value="₱0.00" change="No live transactions" icon={CircleDollarSign}/><Stat title="Successful payments" value="0" change="Awaiting integration" icon={Check}/><Stat title="Pending payments" value="0" change="No pending transactions" icon={Clock3}/></div>
            <div className="panel table-panel"><div className="panel-heading"><div><h3>Recent transactions</h3><p>Transactions will appear after payment setup.</p></div><button className="text-btn" onClick={() => notify('No transactions to export.')}>Export <ArrowUpRight size={14}/></button></div><div className="empty-small">No transactions yet</div></div>
          </section>
        ) : active === 'Activity' ? (
          <section className="content"><div className="page-heading"><div><div className="eyebrow">WORKSPACE LOG</div><h1>Activity</h1><p>Stay up to date with workspace events.</p></div></div><div className="empty-panel"><div className="empty-icon"><Activity size={24}/></div><h3>No activity yet</h3><p>Events will appear here when your backend is connected.</p></div></section>
        ) : (
          <section className="content">
            <div className="welcome-row">
              <div><div className="eyebrow"><span className="live-dot"/> THURSDAY, NOVEMBER 26, 2026</div><h1>Good evening, <span>there.</span></h1><p>Here's what's happening with your business today.</p></div>
              <button className="date-btn"><Clock3 size={15}/> Today <ChevronDown size={14}/></button>
            </div>
            <div className="hero-banner">
              <div className="hero-copy"><div className="hero-tag"><Sparkles size={13}/> YOUR BUSINESS, AUGMENTED</div><h2>Make room for<br/><span>what matters.</span></h2><p>Let AI help you plan, organize, and move your business forward.</p><button onClick={() => setActive('AI Assistant')}>Talk to NIGHT AI <ArrowUpRight size={15}/></button></div>
              <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-core"><Sparkles size={35}/></div><div className="float-chip chip-a"><Activity size={14}/> Smart insights</div><div className="float-chip chip-b"><Zap size={14}/> AI powered</div><div className="float-chip chip-c"><ShieldCheck size={14}/> Your workspace</div></div>
            </div>
            <div className="section-title"><div><h2>Business overview</h2><p>A snapshot of your workspace performance.</p></div><button className="subtle-btn" onClick={() => notify('Your dashboard is up to date.')}>Last 30 days <ChevronDown size={14}/></button></div>
            <div className="stats-grid">
              <Stat title="Total revenue" value="₱0.00" change="Connect payments to begin" icon={Wallet}/>
              <Stat title="Customers" value="0" change="Build your customer base" icon={Users}/>
              <Stat title="AI conversations" value="0" change="Demo assistant only" icon={MessageSquare}/>
              <Stat title="Workspace activity" value="0" change="Events will show here" icon={TrendingUp}/>
            </div>
            <div className="lower-grid">
              <div className="panel tasks-panel"><div className="panel-heading"><div><h3>Priority tasks</h3><p>Keep your business moving.</p></div><button className="more-btn" onClick={() => notify('Task options coming soon.')}><MoreHorizontal size={19}/></button></div>
                <div className="task-list">{tasks.map((task, i) => <label className={`task ${task.done ? 'completed' : ''}`} key={i}><input type="checkbox" checked={task.done} onChange={() => setTasks(prev => prev.map((t,j) => j===i ? {...t,done:!t.done} : t))}/><span className="custom-check"><Check size={12}/></span><span className="task-title">{task.title}</span><span className="task-tag">{task.tag}</span></label>)}</div>
                <button className="add-task" onClick={() => setTasks(prev => [...prev, {title:'New business task',tag:'General',done:false}])}><Plus size={15}/> Add a task</button>
              </div>
              <div className="panel assistant-panel"><div className="assistant-heading"><div className="mini-orb"><Sparkles size={17}/></div><div><h3>Meet your AI assistant</h3><p>One place for your next big idea.</p></div></div><div className="assistant-prompt"><span>✦</span> "Help me plan my business week..."</div><button className="assistant-cta" onClick={() => setActive('AI Assistant')}>Open AI assistant <ArrowUpRight size={15}/></button><div className="assistant-foot"><span><span className="live-dot"/> Ready to explore</span><span>DEMO MODE</span></div></div>
            </div>
            <div className="footer-note"><ShieldCheck size={14}/> NIGHT AI preview · Your data is not saved to a server yet.</div>
          </section>
        )}
      </main>

      {showPayment && <div className="modal-backdrop" onClick={() => setShowPayment(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="modal-close icon-btn" onClick={() => setShowPayment(false)}><X size={18}/></button><div className="modal-icon"><CreditCard size={22}/></div><h2>Connect payments</h2><p>To accept GCash online, an eligible adult business owner must register with an approved payment provider that supports GCash. The provider handles checkout; your backend verifies payment notifications.</p><div className="modal-steps"><div><span>1</span> Complete provider merchant onboarding</div><div><span>2</span> Configure secure server-side credentials</div><div><span>3</span> Verify signed payment webhooks on your backend</div></div><div className="security-note"><ShieldCheck size={16}/> Never collect a customer's MPIN or OTP. Never put secret API keys in frontend code.</div><button className="primary-btn full" onClick={() => {setShowPayment(false);notify('Payment setup guide: see README.md');}}>Got it</button></div></div>}
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  );
}

function Stat({title, value, change, icon: Icon}) {
  return <div className="stat-card"><div className="stat-top"><span>{title}</span><div className="stat-icon"><Icon size={17}/></div></div><div className="stat-value">{value}</div><div className="stat-change"><span className="stat-dot"/>{change}</div></div>;
}

export default App;
