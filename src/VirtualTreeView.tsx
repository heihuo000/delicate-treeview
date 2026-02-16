import React, { useState, useMemo, useRef, useEffect } from 'react';
import FolderFillIcon from '@rsuite/icons/FolderFill';
import PageIcon from '@rsuite/icons/Page';
import './VirtualTreeView.css';
import { filterTreeData } from './filterTree';

const ROW_HEIGHT = 26;

const ChevronIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

const EditIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export const VirtualTreeView = ({ data, searchQuery = '', activeKey, onSelect, onOpen, onDataChange, checkable, checkedKeys = [], onCheck }: any) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevExpandedKeysRef = useRef<Set<string> | null>(null);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [menu, setMenu] = useState<any>({ visible: false, x: 0, y: 0, item: null });
  const [confirmItem, setConfirmItem] = useState<any>(null);
  const timerRef = useRef<any>(null);

  const getCheckState = (node: any, currentChecked: Set<string>): number => {
    if (!node.children || node.children.length === 0) return currentChecked.has(node.id) ? 1 : 0;
    const states = node.children.map((c: any) => getCheckState(c, currentChecked));
    if (states.every((s: number) => s === 1)) return 1;
    if (states.every((s: number) => s === 0)) return 0;
    return 2;
  };

  const renderData = useMemo(() => filterTreeData(data, searchQuery), [data, searchQuery]);

  useEffect(() => {
    const q = (searchQuery ?? '').trim();
    if (q) {
      if (!prevExpandedKeysRef.current) prevExpandedKeysRef.current = expandedKeys;
      const next = new Set<string>();
      const walk = (nodes: any[]) => {
        nodes.forEach((n: any) => {
          if (n?.children?.length) {
            next.add(n.id);
            walk(n.children);
          }
        });
      };
      walk(renderData);
      setExpandedKeys(next);
      return;
    }
    if (prevExpandedKeysRef.current) {
      setExpandedKeys(prevExpandedKeysRef.current);
      prevExpandedKeysRef.current = null;
    }
  }, [expandedKeys, renderData, searchQuery]);

  const visibleRows = useMemo(() => {
    const rows: any[] = [];
    const flatten = (nodes: any[], level = 0) => {
      nodes.forEach(node => {
        const isOpen = expandedKeys.has(node.id);
        rows.push({ ...node, level, hasChildren: !!(node.children && node.children.length > 0), isOpen });
        if (isOpen && node.children) flatten(node.children, level + 1);
      });
    };
    flatten(renderData);
    return rows;
  }, [renderData, expandedKeys]);

  const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  const endIndex = Math.min(visibleRows.length - 1, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT));
  const displayRows = visibleRows.slice(Math.max(0, startIndex - 5), endIndex + 15);

  useEffect(() => { if (containerRef.current) setContainerHeight(containerRef.current.clientHeight); }, []);

  return (
    <div className="vtree-container" ref={containerRef} onScroll={(e: any) => setScrollTop(e.target.scrollTop)} onClick={() => setMenu({ visible: false })}>
      <div className="vtree-phantom" style={{ height: visibleRows.length * ROW_HEIGHT }} />
      <div className="vtree-content">
        {displayRows.map((node) => {
          const rowIdx = visibleRows.findIndex(r => r.id === node.id);
          const isSelected = activeKey === node.id;
          const isEditing = editingKey === node.id;
          const checkState = getCheckState(node, new Set(checkedKeys));
          const iconColor = node.hasChildren ? '#3498ff' : (node.color || '#94a3b8');

          return (
            <div 
              key={node.id}
              className={`vtree-row-wrapper ${isSelected ? 'selected' : ''}`}
              style={{ top: rowIdx * ROW_HEIGHT, height: ROW_HEIGHT, paddingLeft: node.level * 12 + 10 }}
              onClick={() => { onSelect(node); if (!isEditing) setEditingKey(null); }}
              onDoubleClick={(e) => { e.stopPropagation(); if(node.hasChildren) { const n = new Set(expandedKeys); n.has(node.id)?n.delete(node.id):n.add(node.id); setExpandedKeys(n); } else onOpen(node); }}
              onContextMenu={(e) => { e.preventDefault(); setMenu({ visible: true, x: e.clientX, y: e.clientY, item: node }); }}
            >
              <div className="vtree-label-group">
                <div className={`vtree-expander ${node.isOpen ? 'expanded' : ''}`} style={{ visibility: node.hasChildren ? 'visible' : 'hidden' }}><ChevronIcon /></div>
                {checkable && <div className={`tree-checkbox ${checkState === 1 ? 'checked' : ''} ${checkState === 2 ? 'indeterminate' : ''}`} onClick={(e) => { e.stopPropagation(); const next = new Set(checkedKeys); const flip = (n:any,v:boolean)=>{v?next.add(n.id):next.delete(n.id); n.children?.forEach((c:any)=>flip(c,v));}; flip(node, checkState!==1); onCheck(Array.from(next)); }} />}
                <div style={{ color: iconColor, marginRight: '6px', display: 'flex', flexShrink: 0 }}>{node.hasChildren ? <FolderFillIcon /> : <PageIcon />}</div>
                {isEditing ? (
                  <input autoFocus className="tree-input" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => setEditingKey(null)} onKeyDown={e => e.key==='Enter' && setEditingKey(null)} onClick={e => e.stopPropagation()} />
                ) : (
                  <span className="vtree-label">{node.label}</span>
                )}
              </div>
              {!node.hasChildren && isSelected && !isEditing && !checkable && (
                <div className="vtree-actions">
                  <span className="action-btn" onClick={(e) => { e.stopPropagation(); setEditingKey(node.id); setEditValue(node.label); }}><EditIcon /></span>
                  <span className="action-btn" style={{ color: '#ffcdd2' }} onClick={(e) => { e.stopPropagation(); setConfirmItem(node); }}><CloseIcon /></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {menu.visible && (
        <div className="tree-menu" style={{ left: menu.x, top: menu.y }} onClick={e => e.stopPropagation()}>
          <div className="menu-item" onClick={() => { setEditingKey(menu.item.id); setEditValue(menu.item.label); setMenu({ visible: false }); }}><EditIcon /> 重命名</div>
          <div className="menu-item" style={{ color: '#ff4d4f' }} onClick={() => { setConfirmItem(menu.item); setMenu({ visible: false }); }}><span>🗑️</span> 删除</div>
        </div>
      )}
      {confirmItem && (
        <div className="tree-modal-overlay">
          <div className="tree-modal">
            <p>确定删除 <b>{confirmItem.label}</b> 吗？</p>
            <div className="modal-btns">
              <button className="btn-pill btn-pill-danger" onClick={() => { onDataChange(data.filter((i:any)=>i.id!==confirmItem.id)); setConfirmItem(null); }}>彻底删除</button>
              <button className="btn-pill btn-pill-cancel" onClick={() => setConfirmItem(null)}>取消操作</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
