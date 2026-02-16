import React, { useState, useRef, useMemo } from 'react';
import FolderFillIcon from '@rsuite/icons/FolderFill';
import PageIcon from '@rsuite/icons/Page';
import './TreeView.css';
import { filterTreeData } from './filterTree';

const ChevronIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

const EditIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const TreeItem = ({ item, checkable, selectedId, onSelect, onOpen, checkedIds, toggleCheck, onDelete, onMenu, editingKey, editValue, setEditValue, submitRename, setEditingKey, getCheckState, forceExpand }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const timerRef = useRef<any>(null);

  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedId === item.id;
  const isEditing = editingKey === item.id;
  const checkState = getCheckState(item);
  
  const iconColor = hasChildren ? '#3498ff' : (item.color || '#94a3b8');

  return (
    <div className="tree-node">
      <div 
        className={`tree-item-wrapper ${isSelected ? 'selected' : ''}`}
        onClick={() => { onSelect(item); if (!isEditing) setEditingKey(null); }}
        onDoubleClick={(e) => { e.stopPropagation(); if (hasChildren) setIsExpanded(!isExpanded); else onOpen(item); }}
        onMouseDown={(e) => { if (checkable || isEditing) return; const x = e.clientX; const y = e.clientY; timerRef.current = setTimeout(() => onMenu(e, item, x, y), 700); }}
        onMouseUp={() => clearTimeout(timerRef.current)}
        onContextMenu={(e) => { e.preventDefault(); if(!checkable) onMenu(e, item, e.clientX, e.clientY); }}
      >
        <div className="tree-label-group">
          <div className={`tree-expander ${(isExpanded || forceExpand) ? 'expanded' : ''}`} onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} style={{ visibility: hasChildren ? 'visible' : 'hidden' }}><ChevronIcon /></div>
          {checkable && <div className={`tree-checkbox ${checkState === 1 ? 'checked' : ''} ${checkState === 2 ? 'indeterminate' : ''}`} onClick={(e) => { e.stopPropagation(); toggleCheck(item); }} />}
          
          <span style={{ marginRight: '6px', color: iconColor, display: 'flex', flexShrink: 0 }}>
            {hasChildren ? <FolderFillIcon /> : <PageIcon />}
          </span>
          
          {isEditing ? (
            <input autoFocus className="tree-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={submitRename} onKeyDown={(e) => { if(e.key==='Enter') submitRename(); if(e.key==='Escape') setEditingKey(null); }} onClick={(e) => e.stopPropagation()} />
          ) : (
            <span className="tree-label">{item.label}</span>
          )}
        </div>
        {!checkable && isSelected && !hasChildren && !isEditing && (
          <div className="tree-actions">
            <span className="action-btn" onClick={(e) => { e.stopPropagation(); setEditingKey(item.id); setEditValue(item.label); }}><EditIcon /></span>
            <span className="action-btn" style={{ color: '#ffcdd2' }} onClick={(e) => { e.stopPropagation(); onDelete(item); }}><CloseIcon /></span>
          </div>
        )}
      </div>
      {hasChildren && (isExpanded || forceExpand) && (
        <div className="tree-children">
          {item.children.map((child: any) => (
            <TreeItem key={child.id} item={child} checkable={checkable} selectedId={selectedId} onSelect={onSelect} onOpen={onOpen} checkedIds={checkedIds} toggleCheck={toggleCheck} onDelete={onDelete} onMenu={onMenu} editingKey={editingKey} editValue={editValue} setEditValue={setEditValue} submitRename={submitRename} setEditingKey={setEditingKey} getCheckState={getCheckState} forceExpand={forceExpand} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView = ({ data, searchQuery = '', checkable, onDataChange, onOpen }: any) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkedIds, setCheckedKeys] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<any>({ visible: false, x: 0, y: 0, item: null });
  const [confirmItem, setConfirmItem] = useState<any>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const renderData = useMemo(() => filterTreeData(data, searchQuery), [data, searchQuery]);
  const forceExpand = !!searchQuery.trim();

  const getCheckState = (node: any): number => {
    const currentSet = new Set(checkedIds);
    if (!node.children || node.children.length === 0) return currentSet.has(node.id) ? 1 : 0;
    const states = node.children.map((c: any) => getCheckState(c));
    if (states.every(s => s === 1)) return 1;
    if (states.every(s => s === 0)) return 0;
    return 2;
  };

  return (
    <div className="tree-root" onClick={() => setMenu({ visible: false })}>
      <div className="tree-scroll-area">
        <div className="tree-content">
          {renderData.map((item: any) => (
            <TreeItem key={item.id} item={item} checkable={checkable} selectedId={selectedId} onSelect={(i: any) => setSelectedId(i.id)} onOpen={onOpen} checkedIds={checkedIds} toggleCheck={(item: any) => {
              const next = new Set(checkedIds);
              const flip = (node: any, val: boolean) => { val ? next.add(node.id) : next.delete(node.id); node.children?.forEach((c: any) => flip(c, val)); };
              flip(item, getCheckState(item) !== 1);
              setCheckedKeys(next);
            }} onDelete={setConfirmItem} onMenu={(e: any, i: any, x: any, y: any) => setMenu({ visible: true, x, y, item: i })} editingKey={editingKey} editValue={editValue} setEditValue={setEditValue} submitRename={() => {
              if (editingKey && editValue.trim()) {
                const update = (list: any[]): any[] => list.map(i => i.id === editingKey ? { ...i, label: editValue } : { ...i, children: i.children ? update(i.children) : undefined });
                onDataChange(update(data));
              }
              setEditingKey(null);
            }} setEditingKey={setEditingKey} getCheckState={getCheckState} forceExpand={forceExpand} />
          ))}
        </div>
      </div>
      {menu.visible && (
        <div className="tree-menu" style={{ left: menu.x, top: menu.y }} onClick={e => e.stopPropagation()}>
          <div className="menu-item" onClick={() => { setEditingKey(menu.item.id); setEditValue(menu.item.label); setMenu({ visible: false }); }}><EditIcon /> 重命名 (Rename)</div>
          <div className="menu-item" style={{ color: '#ff4d4f' }} onClick={() => { setConfirmItem(menu.item); setMenu({ visible: false }); }}><span>🗑️</span> 删除 (Delete)</div>
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

export type TreeDataItem = {
  id: string;
  label: string;
  color?: string;
  children?: TreeDataItem[];
};
