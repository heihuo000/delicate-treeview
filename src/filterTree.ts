export const filterTreeData = (nodes: any[], query: string): any[] => {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return nodes;

  const filterNode = (node: any): any | null => {
    const label = String(node?.label ?? '').toLowerCase();
    const selfMatch = label.includes(q);
    const nextChildren = Array.isArray(node?.children)
      ? node.children.map(filterNode).filter(Boolean)
      : [];

    if (selfMatch || nextChildren.length > 0) return { ...node, children: nextChildren };
    return null;
  };

  return nodes.map(filterNode).filter(Boolean);
};
