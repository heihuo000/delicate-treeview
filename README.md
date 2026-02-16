# Delicate Treeview

一个精美的树形视图组件库，使用 React + TypeScript + Vite + RSuite UI 构建。

## 特性

- 🎨 **三种精美主题**：深邃夜、黑客绿、极简白
- 🚀 **双渲染模式**：递归渲染 + 虚拟滚动
- ✅ **支持勾选模式**：完整的父子联动勾选
- 🖱️ **丰富的交互**：右键菜单、重命名、删除
- 📱 **响应式设计**：适配移动端和桌面端
- 💎 **精致 UI**：平滑动画、毛玻璃效果、渐变高亮

## 安装

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 使用

```tsx
import { TreeView, VirtualTreeView } from './src';

const data = [
  { id: '1', label: '项目根目录', children: [
    { id: '1-1', label: 'src', children: [
      { id: '1-1-1', label: 'components' },
      { id: '1-1-2', label: 'utils' }
    ]}
  ]}
];

function App() {
  return (
    <TreeView 
      data={data} 
      checkable={true}
      onDataChange={setData}
      onOpen={(node) => console.log('Open:', node)}
    />
  );
}
```

## 组件

### TreeView
递归渲染的树形视图，适合中小型数据集。

### VirtualTreeView
虚拟滚动的树形视图，适合大型数据集，性能更好。

## 主题切换

```tsx
const [theme, setTheme] = useState<'theme-dark' | 'theme-neon' | 'theme-light'>('theme-dark');

<div className={`page-layout ${theme}`}>
  {/* 内容 */}
</div>
```

## 许可证

MIT