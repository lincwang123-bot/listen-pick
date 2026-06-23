# Listen And Pick Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static browser demo for a 15-question listen-and-pick English learning level.

**Architecture:** Use a small static app split into HTML, CSS, and JavaScript. Keep all lesson data local in `app.js`, with no build step and no external assets.

**Tech Stack:** HTML, CSS, vanilla JavaScript, browser Web Speech API.

## Global Constraints

- One level contains exactly 15 questions.
- Each question has one short English sentence and two answer choices.
- The demo must run by opening `index.html` directly in a browser.
- No backend, login, ranking, payment, or WeChat packaging in this version.
- Visuals must be child-friendly and responsive on desktop and mobile widths.

---

### Task 1: Static App Shell

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`

**Interfaces:**
- Produces: DOM elements with ids `app`, `startBtn`, `replayBtn`, `choices`, `feedback`, `nextBtn`, and `retryBtn`.

- [ ] **Step 1: Create the app shell**

Create `index.html` with links to `styles.css` and `app.js`, a start screen, a quiz screen, and a result screen.

- [ ] **Step 2: Add base styles**

Create `styles.css` with responsive layout, large touch targets, readable type, and stable picture card dimensions.

- [ ] **Step 3: Add app startup script**

Create `app.js` with initial state and event listeners for starting the level.

- [ ] **Step 4: Verify app opens**

Run: `open index.html`

Expected: The browser shows the Level 1 start screen.

### Task 2: Lesson Data And Quiz Flow

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: DOM ids from Task 1.
- Produces: local `questions` array, `renderQuestion()`, `handleChoice(choiceIndex)`, `showResult()`, and `speakCurrentSentence()`.

- [ ] **Step 1: Add 15 questions**

Each question includes `sentence`, `correctIndex`, and two `choices` with `label`, `scene`, and `visual` properties.

- [ ] **Step 2: Implement rendering**

Render current progress, sentence text, and two choice cards.

- [ ] **Step 3: Implement answer handling**

Lock choices after selection, update score on correct answers, show feedback, and reveal a continue button.

- [ ] **Step 4: Implement result screen**

After question 15, show score, star count, and retry action.

- [ ] **Step 5: Verify complete flow**

Open `index.html`, answer all 15 questions, and confirm the result score matches the selected answers.

### Task 3: Speech And Polish

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `questions[currentIndex].sentence`.
- Produces: `speak(text)` helper using `window.speechSynthesis`.

- [ ] **Step 1: Add speech playback**

Use the Web Speech API to speak the current sentence at a child-friendly pace. The replay button repeats the sentence.

- [ ] **Step 2: Add unavailable speech fallback**

If speech synthesis is not available, keep the sentence visible and let the replay button show a short fallback message.

- [ ] **Step 3: Polish feedback states**

Style correct and incorrect selected cards, feedback text, progress, and result stars.

- [ ] **Step 4: Verify responsive layout**

Check the page at desktop and narrow mobile widths. The two answer cards should stay tappable and text should not overlap.
