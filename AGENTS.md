# minimal-tailwind

## 职责

博客「無限進步」（blog.riverflows.in）的 Hugo 主题，只负责显示：模板、组件、样式、脚本。站点身份与内容数据（菜单、标语、分章 `data/chapters.yaml`、关于页）由使用它的站点仓库提供。设计约定见站点仓库的 `DESIGN.md`。

## 目录结构

- `layouts/` - 模板。页面模板：`home.html`、`section.html`、`page.html`、`taxonomy.html`、`term.html`；外壳 `baseof.html`
- `layouts/_partials/` - 组件（Hugo 只查找 `_partials/`）
- `layouts/_default/_markup/` - Markdown 渲染钩子
- `assets/css/styles.css` - Tailwind 入口与组件样式
- `assets/js/main.js` - 目录高亮、GLightbox 初始化

## 模块规范

- 所有页面模板定义 `{{ define "main" }}`，继承 `baseof.html`
- 颜色只用设计 token，不写死十六进制值
- 不从 staticfile / bootcdn / bootcss / polyfill.io 等域名加载任何资源
- Tailwind 配置在站点根目录的 `tailwind.config.ts`，其 `content` 会扫描本主题的 `layouts/` 与 `assets/`

## 依赖关系

- Hugo extended（跟随最新版）
- 站点根目录的 PostCSS + Tailwind CSS 3 + @tailwindcss/typography
- GLightbox（jsDelivr CDN）
- 京華老宋体 webfont

## 变更日志

### 2026-09-25
- 移除 `cdn.staticfile.org` 的霞鹜文楷引用：该域名与 polyfill.io 供应链攻击为同一运营方
- 新增本文件
