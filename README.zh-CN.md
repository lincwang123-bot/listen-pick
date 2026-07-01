# Listen & Pick 中文说明

[English README](README.md)

Listen & Pick 是一个面向儿童英语启蒙的“听力选图”学习系统原型，采用“源码可查看、禁止商用”的非商业授权方式发布。

孩子会听到一句简短英文，页面展示两张图片，然后根据听到的意思选择匹配的图片。核心训练目标是：

```text
听到英文 -> 脑中形成画面 -> 理解句子意思
```

项目主要面向 6-10 岁、英语零基础到小学启蒙阶段的中国儿童。当前产品形态是网页版 Demo，后续可迁移为微信小程序。

线上 Demo：

```text
https://linc.wang/listen-pick/
```

## 授权说明

本项目使用 PolyForm Noncommercial License 1.0.0。

未经项目所有者事先书面许可，禁止任何商业用途。包括但不限于：售卖课程、付费托管、白标部署、打包进商业 App、用于付费教学平台、广告变现版本、基于本项目生成或改编后出售课程材料等。

由于“禁止商用”不符合 OSI 对开源软件的定义，本项目应描述为：

```text
源码可查看，非商业使用
```

而不是不加限定地称为“开源项目”。

请同时阅读：

- `LICENSE`
- `NOTICE.md`
- `docs/OPEN_SOURCE.md`

## 当前状态

- 已支持 1-300 关，每关 15 题
- 关卡选择按 25 关学习区间分组展示
- 每题播放一句英文，并展示两张图片供选择
- 每次答题会随机左右图片顺序，避免记固定位置
- 使用本地音频文件，发音更清楚
- 支持男声和女声选择，默认男声
- 支持语速调整
- 支持英文提示开关和中文提示开关
- 中文提示开启后显示在英文提示下方
- 已加入错题复习调度逻辑，复习位置为 `+3 / +10 / +25`
- 最终成绩按首次作答正确数计算，反复重选不会虚高
- 结算页会根据分数显示不同中文鼓励
- 可输入孩子小名，小名仅用于屏幕文字鼓励
- 当前关卡和后续关卡资源预加载，提升体验
- 适合静态部署到 VPS、GitHub Pages、Nginx、Caddy 等环境

## 本地运行

```bash
npm install
npm start
```

然后打开：

```text
http://127.0.0.1:4173/index.html
```

公开源码仓库没有包含体积很大的教材媒体目录。干净克隆后可以启动页面外壳，但如果要完整离线试玩 Level 1-300，需要额外把生成好的素材包放到：

```text
assets/textbook/
```

如果没有这个目录，当前可玩教材关卡会缺少题目插图和英文音频，依赖本地素材的完整性检查也会失败。

## 测试

```bash
npm test
```

## 课程数据

当前浏览器版本主要使用 `src/course/` 下的课程模块。

常用命令：

```bash
npm run validate:course
npm run generate:textbook-playable
npm run audit:textbook-images
npm run optimize:textbook-images
```

音频生成相关命令保留在 `package.json` 中。大型本地 TTS 环境和临时生成文件不会进入 Git。

完整本地试玩需要准备这些生成素材：

```text
assets/textbook/images/
assets/textbook/audio/
assets/textbook/audio-male/
assets/textbook/audio-female/
assets/textbook/contact-sheets/
```

这些素材可以通过 GitHub Release、Git LFS、CDN、对象存储或私有部署包单独分发。

运行时 WebP 图片路径约定为：

```text
assets/textbook/images/level-XXX/qYYY-correct.webp
assets/textbook/images/level-XXX/qYYY-wrong.webp
```

近期 WebP 优化目标为 `640x480`，用于减小网页版 Demo 和未来小程序资源包体积。

## 素材说明

项目素材分为两类：

- 体积较小、运行必需的素材，可以按需要提交
- 批量生成的插画和音频素材，建议放在 Release、Git LFS、对象存储、CDN 或部署服务器上

准备公开仓库时，不要提交浏览器缓存、本地 TTS 环境、临时生成图片、本机配置、密钥、孩子数据或一次性的设计实验目录。

## 隐私说明

当前原型不要求微信登录，也没有后台账号系统。孩子的小名只保存在浏览器本地，用于屏幕上的中文鼓励。

如果后续增加访问统计或用户分析，建议不要采集孩子真实姓名、语音录音或其他不必要的个人信息。

## 部署

本项目是静态站点，项目根目录可以直接交给静态文件服务托管。

示例线上路径：

```text
https://linc.wang/listen-pick/
```

部署时保持文件结构不变，避免破坏已有图片、音频和脚本路径。

当前 VPS 部署通常把代码/数据和生成素材分开同步：

```bash
rsync -az index.html src linc-vps:/opt/linc/sites/localpilot/listen-pick/
rsync -az --include='*/' --include='*.webp' --exclude='*' assets/textbook/images/ linc-vps:/opt/linc/sites/localpilot/listen-pick/assets/textbook/images/
```

不要直接全量同步 `assets/textbook/images/`，因为本地 PNG 母版体积很大。

## 小程序迁移方向

后续可以将当前网页版迁移为微信小程序：

- `src/course/` -> 小程序数据模块
- `assets/audio/` 和课程音频 -> 小程序资源或 CDN
- `assets/course/` 和课程插画 -> 小程序资源或 CDN
- `index.html`、`styles.css`、`src/app.mjs` -> 小程序页面、组件、WXML/WXSS 逻辑

## 公开仓库前检查

发布到公开仓库前建议运行：

```bash
npm test
rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!tmp/**' --glob '!.venv*/**' "api[_-]?key|secret|token|password|PRIVATE KEY|/Users/"
git status --short
```

更多公开发布注意事项见 `docs/OPEN_SOURCE.md`。
