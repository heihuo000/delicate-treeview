import React, { useState } from 'react';
import './TreeView.css';
import { TreeView } from './TreeView';
import { VirtualTreeView } from './VirtualTreeView';

const INITIAL_DATA = [
  { id: '1', label: 'Cloud_Infrastructure_Control_System_v2026.config' },
  { id: '2', label: 'Development_Source', children: [
    { id: '2-1', label: 'Main_Module.ts', color: '#4caf50' },
    { id: '2-2', label: 'Styles_Def.css', color: '#9c27b0' },
  ]},
  { id: '3', label: 'README_LEGAL_LICENSE.md' }
];

const App = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [theme, setTheme] = useState<'theme-dark' | 'theme-neon' | 'theme-light'>('theme-dark');
  const [useVirtual, setUseVirtual] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [isCheckMode, setIsCheckMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={`page-layout ${theme}`}>
      
      {/* 主题选择 */}
      <div style={{ display: 'flex', gap: '8px', padding: '4px', background: 'rgba(128,128,128,0.1)', borderRadius: '30px', marginBottom: '24px' }}>
        <button onClick={() => setTheme('theme-dark')} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', background: theme === 'theme-dark' ? 'var(--t-active-bg)' : 'transparent', color: theme === 'theme-dark' ? '#fff' : 'var(--t-text)' }}>深邃夜</button>
        <button onClick={() => setTheme('theme-neon')} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', background: theme === 'theme-neon' ? 'var(--t-active-bg)' : 'transparent', color: theme === 'theme-neon' ? '#fff' : 'var(--t-text)' }}>黑客绿</button>
        <button onClick={() => setTheme('theme-light')} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', background: theme === 'theme-light' ? 'var(--t-active-bg)' : 'transparent', color: theme === 'theme-light' ? '#fff' : 'var(--t-text)' }}>极简白</button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
        <button onClick={() => setIsCheckMode(!isCheckMode)} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--t-text)', border: '1px solid var(--t-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
          {isCheckMode ? '🔒 锁定' : '🔓 勾选'}
        </button>
        <button onClick={() => setUseVirtual(!useVirtual)} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--t-text)', border: '1px solid var(--t-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
          {useVirtual ? '🚀 虚拟' : '📂 递归'}
        </button>
      </div>

      <div className="tree-panel">
        <div className="tree-header">
          <input className="tree-search" placeholder="搜索项目..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery.trim() && (
            <button className="tree-search-clear" onClick={() => setSearchQuery('')} aria-label="清空搜索">×</button>
          )}
        </div>
        <div className="tree-body">
          {useVirtual ? (
            <VirtualTreeView data={data} searchQuery={searchQuery} activeKey={activeKey} onSelect={(n: any) => setActiveKey(n.id)} onOpen={(n:any)=>alert(n.label)} onDataChange={setData} checkable={isCheckMode} checkedKeys={checkedKeys} onCheck={setCheckedKeys} />
          ) : (
            <TreeView data={data} searchQuery={searchQuery} activeKey={activeKey} onSelect={(n: any) => setActiveKey(n.id)} onOpen={(n:any)=>alert(n.label)} onDataChange={setData} checkable={isCheckMode} checkedKeys={checkedKeys} onCheck={setCheckedKeys} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
