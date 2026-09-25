# minimal-tailwind

## 职责

博客「無限進步」（blog.riverflows.in）的 Hugo 主题，只负责显示：模板、组件、样式、脚本。站点身份与内容数据（菜单、标语、分章 `data/chapters.yaml`、关于页）由使用它的站点仓库提供。设计约定见站点仓库的 `DESIGN.md`。

## 目录结构

- `layouts/` - 模板。页面模板：`home.html`、`section.html`、`page.html`、`taxonomy.html`、`term.html`；外壳 `baseof.html`
- `layouts/_partials/` - 组件（Hugo 只查找 `_partials/`）。`seal.html` 为 2×2 方印，页眉页脚共用
- `layouts/_default/_markup/` - Markdown 渲染钩子：`render-link.html`（外链新标签页 + ↗）、`render-image.html`（纸质照片 + 灯箱）
- `assets/css/styles.css` - Tailwind 入口、设计 token（`--c-*` CSS 变量，明暗两套）、组件样式
- `assets/js/main.js` - 外观切换、目录高亮、GLightbox 初始化
- `static/fonts/` - 自托管的 IBM Plex Mono（拉丁子集 400/500）及其 OFL 许可

## 模块规范

- 所有页面模板定义 `{{ define "main" }}`，继承 `baseof.html`
- 颜色只用设计 token，不写死十六进制值。`wine-*` 只是给旧模板的过渡别名，新代码用 token 名
- 暗色受站点 `params.darkMode` 控制：false 时 `<html data-theme="light">`，不输出防闪脚本与外观切换
- 站点身份从站点 params 读取：`seal`、`tagline`、`since`；favicon 由站点 `static/` 提供，主题只写 `<link>`
- 不从 staticfile / bootcdn / bootcss / polyfill.io 等域名加载任何资源
- Tailwind 配置在站点根目录的 `tailwind.config.ts`，其 `content` 会扫描本主题的 `layouts/` 与 `assets/`

## 依赖关系

- Hugo extended（跟随最新版）
- 站点根目录的 PostCSS + Tailwind CSS 3 + @tailwindcss/typography
- GLightbox（jsDelivr CDN）
- 京華老宋体 webfont（imagekit CSS）
- IBM Plex Mono（`@fontsource/ibm-plex-mono` 的 woff2，只复制文件，OFL）

## 变更日志

### 2026-09-25 阶段 2：文章页
- `page.html` 重写：内容区 1120，桌面正文 688 + 右侧目录 224，手机单列；返回链接、56px 标题、等宽元信息行（日期 · 分类 · 字数 · 约 N 分钟，取 `.WordCount` / `.ReadingTime`，依赖站点 `hasCJKLanguage`）
- AI 总结改为胭脂底圆角块 + 小号强调色标签，去掉左边框与图标
- 正文 H2 前加两位序号（`.article-body` 的 CSS counter）；外链追加 `rel="noopener noreferrer"`，`.prose` 内新标签页链接用 `::after` 显示 ↗（替代文本为空）
- 新增 `render-image.html`：`<figure class="photo">` + 指向原图的 `<a data-glightbox>` + 懒加载 `<img>` + 有 title 时 `<figcaption>`。纸质样式从 `.prose img` 的 `!important` 规则迁到 `.photo`：相框色 `--c-frame`（明暗两套）、4:3 画框、奇偶交替 -0.8° / 0.6° 并左右交替、悬停转正、减少动效时不旋转。图片与文字同段时浏览器会把 `<figure>` 拆出 `<p>`，残留空段落用 `.prose p:empty` 隐藏
- `main.js` 不再包裹图片，GLightbox 仍按 `[data-glightbox]` 初始化；目录折叠改为切换 `hidden` 与 `aria-expanded`
- `toc.html` 重写：桌面 sticky，细线 + 当前项强调色竖线，H3 缩进；手机为「目录 · N 节 ▾」按钮；没有标题的文章不渲染（此前 44 篇输出空目录）
- `post-navigation.html` 重写为上一篇（更早）/ 下一篇两栏；文末新增「同分类」按日期离本篇最近的 3 篇
- 删除 `_partials/terms.html`（没有文章设置 tags，设计稿也不展示）；`page.html` 不再处理 `cover`、`author`、`reading_time`（没有文章使用）

### 2026-09-25 清理写死的颜色与死代码
- `styles.css` 中 code、pre、blockquote、按钮、卡片、目录的 gray/white/black 改为设计 token，随明暗切换；blockquote 改为 2px 粗分隔线、不再斜体
- 删除未被引用的 `_partials/menu.html`
- 删除从未被选用的 `_default/single.html`、`_default/list.html`（删除前后 HTML 产物一致）
- 正文（`.prose`）颜色改由站点 `tailwind.config.ts` 的 typography 配置统一指向 token，文章页去掉 `prose-*:text-black`、`prose-blockquote:*` 等颜色修饰类；基础层 `blockquote` 规则对 `.prose` 内的引用块不生效
- 文章页 AI 总结块从 Tailwind 默认红改为 token；正文链接悬停改为 `prose-a:hover:`（原 `hover:prose-a:` 实际是悬停整个正文时生效）

### 2026-09-25 阶段 1：基础层
- 设计 token：`styles.css` 定义明暗两套 `--c-*` 变量，暗色在 `[data-theme="dark"]` 与跟随系统的媒体查询下生效
- 外观三态（跟随系统 / 浅色 / 深色）：`head.html` 首部防闪脚本 + 页眉切换组件 + `main.js` 的 `initThemeToggle`，受 `params.darkMode` 开关控制
- 页眉页脚重写：方印 + 站名、主菜单、RSS；内容宽 1120px，手机左右 20px，右侧组可换行
- 字体：正文栈改为宋体系，全站字重 400；元信息等宽字体 IBM Plex Mono 自托管
- favicon `<link>` 指向站点 `static/`；删除主题自带的旧 `favicon.ico`

### 2026-09-25
- 移除 `cdn.staticfile.org` 的霞鹜文楷引用：该域名与 polyfill.io 供应链攻击为同一运营方
- 新增本文件
