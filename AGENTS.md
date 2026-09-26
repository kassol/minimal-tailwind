# minimal-tailwind

## 职责

博客「無限進步」（blog.riverflows.in）的 Hugo 主题，只负责显示：模板、组件、样式、脚本。站点身份与内容数据（菜单、标语、分章 `data/chapters.yaml`、关于页）由使用它的站点仓库提供。设计约定见站点仓库的 `DESIGN.md`。

## 目录结构

- `layouts/` - 模板。页面模板：`home.html`（Hero、最新、年轮分镜，读站点 `data/chapters.yaml`）、`section.html`、`page.html`、`taxonomy.html`、`term.html`、`archives.html`（站点 `content/archives.md` 以 `layout: archives` 选用）、`about.html`（站点 `content/about.md` 以 `layout: about` 选用）、`404.html`；外壳 `baseof.html`（页面模板可 `define "head"` 追加 `<head>` 内容）；`rss.xml` 覆盖 Hugo 内置 RSS；`robots.txt`（站点开 `enableRobotsTXT` 时生效）
- `layouts/_partials/` - 组件（Hugo 只查找 `_partials/`）。`seal.html` 为 2×2 方印，页眉页脚与关于页共用；`theme-toggle.html` 为外观三态切换，桌面页眉与手机页脚共用；`post-list.html` 为文章列表，`section.html` 与 `term.html` 共用；`search.html` 为搜索浮层（`baseof.html` 引入），`search-index.html` 生成其索引
- `layouts/_shortcodes/` - `post-count.html`：文章总篇数，供站点内容页引用
- `layouts/_markup/` - Markdown 渲染钩子：`render-link.html`（外链新标签页 + ↗）、`render-image.html`（纸质照片 + 灯箱）
- `assets/css/styles.css` - Tailwind 4 入口与全部配置（`@source`、`@plugin`、`@theme` 颜色与字体映射、`@utility prose` 正文 token）、设计 token（`--c-*` CSS 变量，明暗两套）、组件样式
- `assets/js/main.js` - 外观切换、手机菜单、目录高亮、年轮点亮、搜索浮层、GLightbox 初始化
- `static/fonts/` - 自托管的 IBM Plex Mono（拉丁子集 400/500）及其 OFL 许可

## 模块规范

- 所有页面模板定义 `{{ define "main" }}`，继承 `baseof.html`
- 颜色只用设计 token，不写死十六进制值
- 外观三态已启用：明暗 token 常驻，`head.html` 防闪脚本与外观切换始终输出（桌面在页眉，手机在页脚）
- 模板不写死叙事数据：章名、年份、代表作只从站点 `data/chapters.yaml` 读取，篇数与年度统计构建时计算
- 站点身份从站点 params 读取：`seal`、`tagline`、`since`、`author`、`description`；favicon 与默认分享图 `og-default.png` 由站点 `static/` 提供，主题只写 `<link>` / `<meta>`
- 不从 staticfile / bootcdn / bootcss / polyfill.io 等域名加载任何资源
- Tailwind 配置只在 `styles.css`，不用 JS 配置文件；类名只从站点的 `hugo_stats.json` 扫描（`source(none)` 关闭自动扫描），所以类名须完整出现在模板产出的 HTML 里，不能在 JS 里拼接
- 覆盖 `.prose` 后代的规则放在 `styles.css` 末尾、不进任何层：排版插件在 utilities 层，放进 `@layer components` 会被它压过

## 依赖关系

- Hugo ≥ 0.146（跟随最新版），不依赖 extended：只用 css.TailwindCSS、js.Build、fingerprint、templates.Defer，没有 Sass 与图片处理
- 站点 `node_modules` 的 Tailwind CSS 4（`tailwindcss` + `@tailwindcss/cli`）+ @tailwindcss/typography；站点须开启 `buildStats`、把 `hugo_stats.json` 挂载到 `assets/notwatching/`、在 `security.exec.allow` 放行 `tailwindcss`（见站点 `hugo.toml`）
- 浏览器下限 Safari 16.4+ / Chrome 111+ / Firefox 128+（Tailwind 4 的要求）
- GLightbox 3.3.1（jsDelivr CDN，锁定版本 + SRI；升级时重算 `head.html` 里的 integrity）
- 京華老宋体 webfont（imagekit CSS）
- IBM Plex Mono（`@fontsource/ibm-plex-mono` 的 woff2，只复制文件，OFL）

## 变更日志

### 2026-09-26 Tailwind CSS 3 → 4
- `head/css.html` 改用 `css.TailwindCSS`（生产构建由 Tailwind 压缩，保留 fingerprint + SRI）；`head.html` 用 `templates.Defer` 调用它，全部页面渲染完、`hugo_stats.json` 写好后再编译，首次构建即得到完整 CSS
- `styles.css`：`@tailwind` 三行换成 `@import "tailwindcss" source(none)` + `@source "hugo_stats.json"` + `@plugin`；原站点 `tailwind.config.ts` 的颜色映射改为 `@theme inline`（值仍是 `rgb(var(--c-*))`，透明度修饰照常可用），字体为 `@theme`，正文排版插件的颜色与引用块样式改为 `@utility prose`（编译后排在插件规则之后）
- 保持与迁移前一致的补丁：`text-xs`…`text-4xl` 的行高改回 3 的 rem 值（4 为无单位比例，子元素继承后按自身字号重算，如归档行的日期行高 28px → 20px）；`.toc ul ul a` 显式 `leading-5`（4 里 `leading-snug` 压过 `text-sm` 的行高）；按钮恢复手型光标（4 的 preflight 改为 default）
- 纸质照片 `.photo` 与行内代码去反引号两组规则移出 `@layer components`，放在文件末尾不进层：插件在 utilities 层，原位置会让图片边距、图注样式、反引号全部回到插件默认
- 类名改名：`rounded` → `rounded-sm`、`rounded-sm` → `rounded-xs`（半径不变）、`outline-none` → `outline-hidden`
- 行为变化（未回退）：悬停样式只在支持悬停的设备生效（4 的默认，手机上点按后不再残留悬停色）；`prose-a:hover:text-accent-hover` 在 3 里实际编译为「悬停整个正文时全部链接变色」，4 按从左到右堆叠，变为只有被悬停的链接变色，与 2026-09-25 的本意一致

### 2026-09-25 性能、SEO 与可访问性修整
- `head.html`：GLightbox 锁定 3.3.1 并加 SRI，只在正文含 `data-glightbox` 的页面加载，脚本 `defer`；`main.js` 也 `defer`（两者按文档顺序在 DOMContentLoaded 前执行）。viewport 加 `initial-scale=1`；分页第 2 页起标题加「· 第 N 页」；全站 RSS 自动发现；文章页输出 `article:published_time`，og:image 用正文第一张图（没有图用 `og-default.png`，只有默认图带宽高）
- 文章页「同分类」跳过上一篇、下一篇，避免与上下篇导航重复
- 目录：删除 `main.js` 接管点击的平滑滚动（按吸顶页眉减 80px，但页眉不吸顶）和永不触发的补 id；改由 CSS 的 `scroll-margin-top`（1.5rem）与 `scroll-behavior: smooth`（仅 `prefers-reduced-motion: no-preference`）完成。滚动高亮不变
- 渲染钩子迁到 `layouts/_markup/`（Hugo 0.146 起的目录结构）；放大链接的可访问名称带序号「放大查看第 N 张图」
- 新增 `robots.txt` 模板；搜索索引 `jsonify` 关闭 HTML 转义（内容不变，原始体积小 0.07%：索引体积由正文决定）
- `.prose` 行内代码不再加反引号；删除被 `.prose` 覆盖、从未生效的基础层 `blockquote` 规则
- 分类法索引删除标签小节（站点不再启用 tags）
- 首页：年轮点亮规则的 `<style>` 从 `<section>` 移到 `<head>`（`baseof.html` 新增 `head` 块）；没有文章时不输出年轮分镜，构建不再报错
- 桌面导航当前项带 `aria-current`；归档「展开其余」展开后可收起；非 Apple 平台搜索快捷键提示显示 Ctrl K
- 删除 Hugo 脚手架留下的 `content/` 示例文章与 `hugo.toml` 的 example.org / en-US / 示例菜单（站点生效配置不变）

### 2026-09-25 关于页窄屏溢出
- 关于页等宽网址加 `overflow-wrap: anywhere`，修复 360px 宽度下横向溢出 24px

### 2026-09-25 手机页眉
- 手机（<768px）页眉只留方印 + 站名与两个 44px 图标按钮：搜索（打开现有浮层）、菜单。导航、外观切换、RSS 移出手机页眉；桌面页眉不变。替代阶段 5「页眉右侧组允许换行、手机上分两行」的做法
- 菜单：`header.html` 内的原生 popover（`#site-menu`，按钮 `popovertarget`），点外部与 Esc 关闭、关闭后焦点回到菜单按钮均由浏览器处理；面板为纸色底、细线分隔、52px 行高，列出 `site.Menus.main` 与 RSS，当前页（`RelPermalink` 以菜单 URL 开头，文章页亮「文章」）强调色 + 圆点并带 `aria-current`。`main.js` 的 `initMenu` 在打开前把面板贴到页眉下沿，并同步按钮 `aria-expanded`。不支持 popover 的浏览器（Safari 17 以前）菜单按钮无效
- 外观切换抽成 `_partials/theme-toggle.html`（按钮尺寸与图标边长由调用方传入）：桌面页眉 32px，手机页脚 44px；`initThemeToggle` 本就对所有 `[data-theme-toggle]` 组同步 `aria-pressed`，脚本未改
- 手机页脚按设计稿 MobileHome：外观切换 /「RSS 归档 分类 关于」/「© 起止年 站名 · 由 Hugo 驱动」三行；桌面页脚不变

### 2026-09-25 阶段 5 收尾
- 站点 RSS 只收 posts 区文章（关于、归档页恢复进入页面集合后不混入 feed）；频道标题与描述改为中文
- 文章列表与分类详情的 canonical 指向当前页码
- 页脚加入「归档」「关于」链接

### 2026-09-25 阶段 5：搜索、关于页、分享元信息、RSS 摘要
- 搜索：`_partials/search-index.html` 把全部文章的标题、日期、链接、AI 总结、正文纯文本输出为带指纹的 `search.<hash>.json`（`resources.FromString`，站点无需配置输出格式）；`_partials/search.html` 为 `<dialog>` 浮层，`main.js` 的 `initSearch` 首次打开时加载索引，不分词子串匹配（空格分隔多个词须全部出现），标题命中在前，其余按日期倒序；片段取正文首个命中处，关键词胭脂底 + 强调色字，选中行上改用 `muted/40`
- 交互：页眉搜索按钮（桌面「搜索 ⌘K」，手机 44px 图标）、⌘K / Ctrl+K 打开、Esc 或点遮罩关闭（手机有「取消」）、↑↓ 选择、↵ 打开；输入框为 combobox + `aria-activedescendant`，输入法组合中不搜索、不响应方向键与回车；模态由原生 `showModal()` 提供，关闭后焦点回到打开者；`type=search` 输入框里的 Esc 由脚本直接关闭浮层（浏览器默认先清空内容）。无 JS 时 `head.html` 的 `<noscript>` 样式隐藏搜索入口
- 404 页加入搜索表单，回车后在浮层中显示结果
- 页眉右侧组允许换行：菜单增至 4 项并加入搜索按钮后，手机上菜单与外观切换、搜索、RSS 分两行，避免横向溢出
- 新增 token `--c-scrim`（遮罩底色）与 `--shadow-dialog`（面板阴影），明暗两套
- 新增 `about.html`（大号方印 + 标题，正文为站点 about.md 的 `<section>`，样式 `.about-body`）与 `_shortcodes/post-count.html`
- `head.html`：输出 meta description（文章用 frontmatter `description`，其他页用站点描述，为空时用标语）、canonical、Open Graph（og:image 为站点 `static/og-default.png`）、`twitter:card`。分页列表页的 canonical 指向第一页，没有调用 `.Paginator`，避免不分页的页面生成 `/page/N/`
- 新增 `rss.xml`：基于 Hugo 0.166.0 内置模板，只改 `<description>` 为 frontmatter `description`，没有时回退到摘要纯文本；不再含 `<figure>` 等 HTML，`/index.xml` 由约 616 KB 降到约 222 KB

### 2026-09-25 阶段 4 收尾
- 纸质照片阴影改用 `--shadow-photo` token，暗色下加深（原阴影在暗色底上不可见）
- 减少动态效果时全站过渡与动画归零（一条全局规则，替代逐组件的 transition: none）
- 首页末章「最近 N 篇」跳过已在「最新」区展示的文章

### 2026-09-25 阶段 4：首页年轮分镜，启用暗色
- `home.html` 重写：Hero（竖排标语 + 大号站名 +「作者 · SINCE · N POSTS」）、「最新」（标题 + AI 总结 + 链接）、「N 年」分镜。年份跨度与阶段数由数据算出并转成中文数字（行内 partial `cn-num`，只到 99）
- 分镜读站点 `data/chapters.yaml`：每年一根柱（零篇画细线，柱高按峰值归一）、章节目录、每章篇数；代表作按标题在 `/posts` 中匹配，找不到时 `warnf` 但不中断构建；`photos` 渲染为纸质照片拼贴，`recent: N` 渲染为「标题 | 日期」中轴对称的最新 N 篇
- 点亮机制：年份柱、年份标签、目录项、章序带 `data-chapter`（章节序号），分镜 section 的 `data-active-chapter` 默认 0（无 JS 时第一章点亮）；模板按章节数生成 `[data-active-chapter=i] [data-chapter=i] { --tone }` 规则，`styles.css` 的 `.year-bar` / `.chapter-tone` / `.chapter-num` 据此取色；`main.js` 的 `initChapterRing` 用 IntersectionObserver 在章节顶部越过视口 40% 时改写 `data-active-chapter`；桌面每章最小高度 `max(640px, 60vh)`，高屏上滚到底时最后一章也能越过这条线
- 桌面左列 400px 吸顶；手机（<1024px）改为顶部吸顶的迷你年轮条 + 章序，照片缩小横向叠放，按钮全宽；减少动效时去掉过渡与照片旋转
- 删除 `params.darkMode` 分支：`baseof.html` 不再输出 `data-theme="light"`，防闪脚本与外观切换常驻
- 删除旧首页专用的 `.btn`

### 2026-09-25 阶段 3 收尾
- 404 页 `<title>` 改为「此页不在这里 | 站名」
- 删除未使用的 `.btn-outline`、`.card`、`.content-auto`，以及与 Tailwind 3.4 自带类重复的 `.line-clamp-1/2/3`

### 2026-09-25 阶段 3：列表类页面
- `baseof.html`：main 顶部间距由约 112px 收为桌面 72px、手机 28px（首页同受影响）
- 新增 `_partials/post-list.html`，`section.html` 与 `term.html` 只调用它：72px 大标题 +「N 篇 · 按时间倒序」；每条日期 / 标题 / AI 总结（`description`，两行截断）/ 字数与分类，1px 细线分隔；`/posts/` 页头带「按年份浏览 →」。不再按分页内重排日期（Hugo 默认已按日期倒序）
- `pagination.html` 重写：44×44 页码方块，当前页强调色实底，首末页与当前页 ±1（在首末页时 ±2）之外折成 …；「上一页 / 下一页」到头时为禁用态
- 新增 `archives.html`：「N 篇 · 起止年份」与年份跳转均由数据算出；按年分节，每年前 10 篇直接显示，其余放进 `<details>`
- `taxonomy.html` 重写：每个分类一个大条目（篇数、年份跨度、按年篇数柱图、最近 3 篇）；标签小节列出标签，没有时显示「暂无标签」。`/tags/` 用同一模板，只有标签小节
- 新增 `404.html`：Cloudflare Pages 检测到 `404.html` 后对未命中路径返回 404 状态

### 2026-09-25 图片只在独立成段时渲染为 figure
- `render-image.html` 按 `.IsBlock` 分支：独立成段输出纸质照片 `<figure>`，行内图片输出不带相框的 `<img>`，避免 `<figure>` 落进 `<p>`；删除为此兜底的 `.prose p:empty` 隐藏规则

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
