# Listen & Pick 项目交接说明

更新时间：2026-07-01
项目路径：本地工作区根目录
线上地址：`https://linc.wang/listen-pick/`

## 1. 项目定位

这是一个面向中国 6-10 岁儿童的英语听力选图学习系统。

核心目标不是背单词、学语法或刷题，而是训练：

> 听到英文 -> 脑中形成画面 -> 理解句子意思

当前产品形态是网页版 Demo，后续计划迁移为微信小程序。

## 2. 当前线上状态

- 线上路径：`https://linc.wang/listen-pick/`
- VPS SSH：`ssh linc-vps`
- VPS 静态目录：`/opt/linc/sites/localpilot/listen-pick/`
- 当前缓存版本：
  - `stage3-assets-v6`
  - `zh-hints-v5`
- 最近验证：
  - `npm test` 通过，`98/98`
  - 300 关专项校验通过：4500 道题、22500 个运行时文件，错误数 0
  - 图片审计检查 4500 对题图，缺图 0，可疑项 79
  - 线上应加载 `src/app.mjs?v=stage3-assets-v6`
  - 线上 `app.mjs` 已确认加载 `hints.mjs?v=zh-hints-v5`

## 3. 已实现功能

- 首页登录页，可输入孩子小名。
- 关卡选择页按 25 关分组，并按 Day 结构展示。
- 已有 1-300 关课程数据，每关 15 题。
- 每题播放一句英文，展示两张图片，孩子选择对应图片。
- 图片左右顺序会随机，避免孩子记固定位置。
- 英文提示、中文提示可开关。
- 中文提示显示在英文提示下方。
- 语速可选，默认标准语速。
- 声音可选男声、女声，目前默认男声。
- 当前已暂停跟读按钮，避免顶部栏拥挤。
- 答错后会短暂显示红绿反馈，然后重新播放英文并允许重选。
- 最终成绩按首次作答正确数计算，不会永远显示满分。
- 结束页显示孩子小名，并根据分数显示不同中文鼓励。
- 鼓励语音统一使用“宝贝”，避免孩子名字 TTS 机械感太强。
- 已加入错题复习调度逻辑，核心思路为 `+3 / +10 / +25`。
- 已做当前关和后续资源预加载，优化打开下一题/下一关体验。
- 已支持“接着上次学习”的本地进度思路。

## 4. 关键文件

- 入口页面：`index.html`
- 主应用逻辑：`src/app.mjs`
- 游戏逻辑：`src/game.mjs`
- 中文提示：`src/hints.mjs`
- 当前运行题库：`src/course/textbook-playable.generated.mjs`
- 1-300 关合并数据：`src/course/textbook-levels-001-300.generated.mjs`
- 101-300 关数据：`src/course/textbook-levels-101-300.generated.mjs`
- 中文 README：`README.zh-CN.md`
- 英文 README：`README.md`
- 贡献说明：`CONTRIBUTING.md`
- 许可文件：`LICENSE`
- 署名/素材说明：`NOTICE.md`

## 5. 图片与音频资源

运行时图片使用 WebP：

```text
assets/textbook/images/level-XXX/qYYY-correct.webp
assets/textbook/images/level-XXX/qYYY-wrong.webp
```

本地还保留了 PNG 原图母版，但体积很大，线上和小程序运行不应该依赖 PNG。

音频目录大致为：

```text
assets/textbook/audio
assets/textbook/audio-male
assets/textbook/audio-female
assets/result-audio
```

最近已压缩运行时 WebP：

- 尺寸：`840x630` -> `640x480`
- WebP 总体积：约 `178.30 MB` -> `95.75 MB`
- 平均单图：约 `19.39 KB` -> `10.41 KB`
- 最大单图：约 `66.85 KB` -> `31.90 KB`

## 6. 常用命令

安装依赖：

```bash
npm install
```

本地测试：

```bash
npm test
```

检查插图重复/可疑项：

```bash
npm run audit:textbook-images
```

压缩运行时 WebP 图片：

```bash
npm run optimize:textbook-images
```

生成可运行题库索引：

```bash
npm run generate:textbook-playable
```

## 7. 部署方式

只部署代码和数据：

```bash
rsync -az index.html src linc-vps:/opt/linc/sites/localpilot/listen-pick/
```

只同步运行时 WebP 图片：

```bash
rsync -az --include='*/' --include='*.webp' --exclude='*' assets/textbook/images/ linc-vps:/opt/linc/sites/localpilot/listen-pick/assets/textbook/images/
```

注意：不要直接全量同步 `assets/textbook/images`，里面包含 PNG 母版，体积很大，容易导致部署非常慢。

## 8. 最近已修复的问题

- Level 63 Q10：干扰图由“拿书出书包”改成“把水瓶放进书包”。
- Level 76 Q9：干扰图由“拿水瓶出书包”改成“把勺子放进碗里”。
- 修复多个中文提示的生硬翻译：
  - `The girl is making the bed.` -> `女孩正在整理床铺。`
  - `The girl is jumping on the bed.` -> `女孩正在床上跳。`
  - `The boy is putting on a shirt.` -> `男孩正在穿衬衫。`
  - `The child is packing a schoolbag.` -> `孩子正在整理书包。`
- 修复线上缓存未更新问题，当前版本提升到 `stage3-assets-v6 / zh-hints-v5`。
- 新增插图重复审计脚本和报告。
- 新增 WebP 压缩脚本和测试。
- 修复“学习”按钮进入后仍显示复习题的问题，学习模式现在始终读取所选关卡题序。
- 修复复习模式语音和图片不匹配的问题，播放语音会绑定当前展示的复习题。
- 修复部分手机浏览器点击图片变成放大/预览的问题，图片点击现在由答题卡片接管。
- 替换第 13 关数量题运行时图片，并将缓存版本提升到 `stage3-assets-v6`。

## 9. 审计报告

插图重复审计输出：

```text
docs/textbook-image-duplicate-audit.md
docs/textbook-image-duplicate-audit.json
```

最近一次审计检查了 4500 组题目图片，没有发现缺图；可疑项 79。第 13 关数量题已替换，不再出现在高风险可疑项中。仍有一些 `semantic_review` 可疑项，很多属于“穿/脱、放入/拿出、相似动作”的视觉歧义，需要后续人工逐项确认或重新生图。

## 10. 当前风险与待办

- 1-100 关仍需继续抽查图片、英文、中文是否完全一致，特别是数量、位置、动作方向；低复杂度候选里 Level 9、12、14、15 仍值得优先复核。
- 101-300 关虽然已经生成，但必须坚持教育启蒙严谨标准，任何语法不自然、中文生硬、图片歧义都要修。
- 图片生成规则必须保持前 100 关同等品质：
  - 儿童绘本风
  - 温暖明亮
  - 主体突出
  - 简洁背景
  - 无文字
  - 无水印
  - 正方形或固定比例，移动端显示完整
- 本地 PNG 母版约 2.4GB，开源或部署时要谨慎处理，避免仓库过大。
- GitHub 推送和 README 重写曾被提出，但最后用户切换到“写交接文件”，所以还没有继续完成这一项。
- 当前工作区有大量未提交改动，提交前一定要先检查 `git status` 和具体 diff，不要回退任何已有改动。
- 如果继续开源，需要明确许可策略：用户不希望别人直接商用这套内容。

## 11. 给下一个对话的接手提示

可以直接复制下面这段给新的 Codex 对话：

```text
请继续维护这个项目。先阅读 HANDOFF.md、README.md、README.zh-CN.md、package.json、src/app.mjs、src/game.mjs、src/hints.mjs。不要回退未提交改动。当前线上版本是 stage3-assets-v6 / zh-hints-v5，线上地址是 https://linc.wang/listen-pick/。项目是儿童英语听力选图学习系统，核心要求是英文语法、中文语义、插图逻辑必须严格正确，不能伤害儿童认知。优先处理图片/中文/英文不一致问题，然后再考虑 GitHub 推送、README 重写和小程序迁移。
```
