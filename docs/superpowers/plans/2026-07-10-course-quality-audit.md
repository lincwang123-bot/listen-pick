# 全课程内容质量审计实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 对 300 关、4500 道题的英文、中文、家庭关系、图片和三套音频做可重复的全局质量审计，修复所有确认错误并部署上线。

**Architecture:** 审计分为静态课程文本、中文提示、图片语义和音频完整性四条证据链。自动脚本负责全量枚举、路径/哈希/时长/规则检查并输出结构化报告；人工只复核自动筛出的高风险图片组，确认后用 SHA-256 回归测试锁定素材。

**Tech Stack:** Node.js ESM、`node:test`、`pngjs`、`ffprobe`、现有课程模块与 `toChineseHint()`。

## Global Constraints

- 儿童英语启蒙内容优先级高于速度和视觉润色。
- 图片、音频、英文、中文和答案映射必须指向同一概念。
- 不修改或删除用户未提交的 `ListenPick_学习复习更新_小红书图文卡.zip`。
- 所有确认问题必须先有失败测试，再修复并运行 `npm test`。
- 部署前必须运行 `npm run validate:course`，部署后必须校验公网缓存版本和素材哈希。

---

### Task 1: 全量课程文本与语义审计

**Files:**
- Create: `scripts/audit-course-content.mjs`
- Create: `tests/course-content-audit.test.mjs`
- Create: `docs/course-content-audit.json`

**Interfaces:**
- Consumes: `availableTextbookLevels`、`toChineseHint(sentence)`
- Produces: `auditCourseContent(levels)` 和结构化 `findings` 数组

- [ ] **Step 1: 写失败测试**，要求审计器能识别主谓不一致、单复数错误、不自然动作、家庭称谓冲突、`twins/triplets` 错用和中英文提示重复。
- [ ] **Step 2: 运行 `node --test tests/course-content-audit.test.mjs`**，确认因审计器不存在而失败。
- [ ] **Step 3: 实现最小审计器**，逐题检查 `sentence`、`wrongSentence`、中文提示和正误选项差异，并输出关卡、题号、字段、规则和文本。
- [ ] **Step 4: 运行审计并人工复核结果**，把确认误报加入精确白名单，不用宽泛正则掩盖问题。
- [ ] **Step 5: 将零未处理高风险项写入测试门禁**。

### Task 2: 音频路径、内容来源与媒体完整性审计

**Files:**
- Create: `scripts/audit-course-audio.mjs`
- Create: `tests/course-audio-audit.test.mjs`
- Create: `docs/course-audio-audit.json`

**Interfaces:**
- Consumes: 每题 `audioFile` 与 `audio-male`、`audio-female` 派生路径
- Produces: 缺失、不可解码、空音频、时长异常、跨句重复哈希和三声线错位列表

- [ ] **Step 1: 写失败测试**，用临时媒体夹具验证缺文件、零字节、错误扩展名和不同句子共用同一音频会被发现。
- [ ] **Step 2: 运行测试并确认失败**。
- [ ] **Step 3: 使用 `ffprobe` 和 SHA-256 实现全量检查**；相同句子允许复用，不同句子出现相同媒体哈希必须报错。
- [ ] **Step 4: 检查三套共 13500 个音频文件**，确认都可解码、时长合理并绑定到同一题号。
- [ ] **Step 5: 将确认异常回到对应生成脚本重做，并添加回归夹具**。

### Task 3: 图片语义与家庭关系专项审计

**Files:**
- Create: `scripts/generate-semantic-audit-pages.mjs`
- Create: `tests/course-image-bindings-audit.test.mjs`
- Create: `docs/course-image-semantic-audit.json`

**Interfaces:**
- Consumes: 9000 个正误 PNG、句子中的人物/动物/数量/颜色/位置/动作词
- Produces: 去重图片记录、跨语义哈希冲突、人工复核页和已批准素材哈希

- [ ] **Step 1: 写失败测试**，覆盖同一图片绑定不同家庭性别、动物、数字或颜色的冲突。
- [ ] **Step 2: 运行测试并确认失败**。
- [ ] **Step 3: 实现图片哈希和语义标签提取**，优先输出家庭关系、数量、动物、颜色、位置和动作类别。
- [ ] **Step 4: 逐页人工复核所有高风险去重图片**，记录 `approved` 或具体错误，不以文件名代替画面判断。
- [ ] **Step 5: 对确认正确素材写入 SHA-256 回归测试，对错误素材先写失败测试再替换。**

### Task 4: 修复、回归与发布

**Files:**
- Modify: 对应课程生成脚本、生成课程模块、`src/hints.mjs`
- Modify: `index.html`、`src/app.mjs`、`src/game.mjs`、`HANDOFF.md`
- Test: `tests/*.test.mjs`

**Interfaces:**
- Consumes: Tasks 1-3 的确认问题清单
- Produces: 零未处理高风险项、通过的全量测试和已部署版本

- [ ] **Step 1: 每个确认问题先写失败回归测试**。
- [ ] **Step 2: 只修改对应句子、中文、图片或音频并更新生成源**。
- [ ] **Step 3: 运行专项测试和 `npm test`，预期 0 失败**。
- [ ] **Step 4: 运行 `npm run validate:course`，预期 `Course validation passed`**。
- [ ] **Step 5: 提升资源缓存版本，部署代码和变更素材**。
- [ ] **Step 6: 从公网重新下载代码和素材，逐项比对版本与 SHA-256**。
- [ ] **Step 7: 提交并推送 `main`，确认 `HEAD` 与 `origin/main` 一致**。
