# 时光胶囊 ⏳

> 封存每一个值得珍藏的瞬间

一个优雅的**纪念日倒计时/已过天数**记录 PWA 应用。以圆形卡片的方式展示你的重要日子——恋爱纪念日、生日、家庭聚会、人生里程碑……岁月流转，回忆长存。

![screenshot](icons/icon-512.png)

---

## ✨ 特性

- **📅 已过 & 待来** — 双 tab 切换，分别展示已经过去的日子和即将到来的日子
- **🎨 暖金美学** — 奶油 parchment 底色 + 金色钻石 icon，玻璃拟态质感
- **🌗 深色模式** — 支持系统主题自动切换，也可手动切换
- **🔍 搜索过滤** — 按名称快速搜索卡片
- **🔀 长按排序** — 拖拽调整卡片顺序，自动保存
- **🏷️ 分类标签** — 爱情/友情/亲情/生日/纪念日/自我/其他，彩色分类边框
- **📖 经典语录** — 每张卡片底部随机展示契合分类的中外名句
- **🎉 里程碑庆祝** — 100天、365天、1000天……到里程碑时自动弹窗庆祝
- **💾 离线可用** — 基于 Service Worker 的 PWA，添加到主屏幕后无需网络
- **📤 数据导入/导出** — 备份你的所有记录，自由迁移
- **💬 反馈建议** — 内置反馈表单，直接提交到 GitHub Issues

## 🚀 快速上手

### 在线体验

访问 [https://totoro-hong.github.io/time-capsule/](https://totoro-hong.github.io/time-capsule/)

手机浏览器打开后，**添加到主屏幕** 即可获得类原生 App 体验。

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/totoro-hong/time-capsule.git
cd time-capsule

# 用任意静态服务器启动
npx serve .
```

## 🛠️ 技术栈

- 原生 HTML / CSS / JavaScript（零依赖）
- IndexedDB 本地持久化存储
- Service Worker 离线缓存
- PWA manifest 可安装应用
- Playfair Display & JetBrains Mono 字体
- Vercel / GitHub Pages 部署

## 📁 项目结构

```
time-capsule/
├── index.html          # 主页面
├── manifest.json       # PWA 清单
├── sw.js               # Service Worker
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── app.js          # 应用逻辑
│   └── db.js           # IndexedDB 操作封装
├── icons/              # PWA 图标
├── api/
│   └── feedback.js     # 反馈 API（Vercel Serverless）
└── vercel.json         # Vercel 部署配置
```

## 📦 部署

### GitHub Pages（推荐，国内可访问）

1. 在 GitHub 仓库 Settings → Pages 中
2. Source 选择 **Deploy from a branch**
3. 分支选择 `gh-pages`，目录 `/ (root)`
4. 保存即可

### Vercel

项目中已包含 `vercel.json`，直接导入仓库即可自动部署。

### 国内镜像

Gitee 同步仓库：[https://gitee.com/totoro-hong/important-dates](https://gitee.com/totoro-hong/important-dates)

## 📄 开源

MIT License
