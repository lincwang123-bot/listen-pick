import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const styles = readFileSync("styles.css", "utf8");
const index = readFileSync("index.html", "utf8");

function ruleBody(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = styles.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `${selector} rule exists`);
  return match[1];
}

test("choice illustrations use one fixed frame ratio across viewports", () => {
  const baseChoiceArt = ruleBody(".choice-art");
  assert.match(baseChoiceArt, /aspect-ratio:\s*4\s*\/\s*3;/);
  assert.doesNotMatch(baseChoiceArt, /height:\s*260px;/);

  const mobileChoiceArtMatch = styles.match(/@media\s*\(max-width:\s*720px\)\s*\{[\s\S]*?\.choice-art\s*\{([^}]*)\}/);
  assert.ok(mobileChoiceArtMatch, "mobile .choice-art rule exists");
  assert.doesNotMatch(mobileChoiceArtMatch[1], /aspect-ratio:\s*14\s*\/\s*9;/);
});

test("level picker number buttons stay inside day cards in landscape", () => {
  const dayLevels = ruleBody(".day-levels");
  assert.match(dayLevels, /repeat\(auto-fit,\s*minmax\(40px,\s*1fr\)\)/);
  assert.doesNotMatch(dayLevels, /repeat\(5,\s*minmax\(0,\s*1fr\)\)/);

  const dayLevelButton = ruleBody(".day-level-button");
  assert.match(dayLevelButton, /aspect-ratio:\s*1\s*\/\s*1;/);
  assert.match(dayLevelButton, /width:\s*min\(100%,\s*44px\);/);
});

test("optional follow-read controls have responsive layout hooks", () => {
  assert.doesNotMatch(index, /id="followReadToggleBtn"/);
  assert.match(index, /id="followReadPanel"/);

  const followReadPanel = ruleBody(".follow-read-panel");
  assert.match(followReadPanel, /display:\s*grid;/);

  const mediumTopbarMatch = styles.match(/@media\s*\(max-width:\s*800px\)\s*\{[\s\S]*?\.topbar-controls\s*\{([^}]*)\}/);
  assert.ok(mediumTopbarMatch, "medium .topbar-controls rule exists");
  assert.match(mediumTopbarMatch[1], /repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
});

test("question counter stays on one line inside the progress pill", () => {
  assert.match(index, /styles\.css\?v=perf-audio-webp-v3/);

  const topProgress = ruleBody(".top-progress");
  assert.match(topProgress, /grid-row:\s*2;/);
  assert.match(topProgress, /grid-column:\s*1\s*\/\s*-1;/);
  assert.match(topProgress, /min-width:\s*0;/);
  assert.match(topProgress, /height:\s*40px;/);

  const questionCounter = ruleBody(".question-counter");
  assert.match(questionCounter, /white-space:\s*nowrap;/);
  assert.match(questionCounter, /line-height:\s*1;/);
});

test("profile screen collects a child name in the same visual system", () => {
  assert.match(index, /id="profileScreen"/);
  assert.match(index, /id="childNameInput"/);
  assert.match(index, /id="saveChildNameBtn"/);
  assert.match(index, /id="skipChildNameBtn"/);

  assert.match(styles, /\.profile-card\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*0\.9fr\)\s*minmax\(340px,\s*1\.1fr\);/);
  assert.match(styles, /\.profile-panel\s*\{[\s\S]*?justify-content:\s*center;/);

  const profileInput = ruleBody(".profile-input");
  assert.match(profileInput, /min-height:\s*64px;/);
  assert.match(profileInput, /border:\s*2px solid #cfe4f6;/);
});

test("login screen has a two-column card and clear action buttons", () => {
  assert.match(index, /id="loginScreen"/);
  assert.match(index, /class="login-card"/);
  assert.match(index, /class="[^"]*login-main-button[^"]*"/);
  assert.match(index, /class="[^"]*login-secondary-button[^"]*"/);

  assert.match(styles, /\.login-card,\s*\.profile-card\s*\{[\s\S]*?display:\s*grid;/);
  assert.match(styles, /\.login-card,\s*\.profile-card\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.08fr\)\s*minmax\(320px,\s*0\.82fr\);/);

  assert.match(styles, /\.login-panel,\s*\.profile-panel\s*\{[\s\S]*?justify-content:\s*center;/);
});

test("start screen uses a left hero and right level picker layout", () => {
  assert.match(index, /class="start-layout"/);
  assert.match(index, /class="start-hero-panel"/);
  assert.match(index, /class="level-dock"/);

  const startLayout = ruleBody(".start-layout");
  assert.match(startLayout, /display:\s*grid;/);
  assert.match(startLayout, /grid-template-columns:\s*minmax\(300px,\s*0\.88fr\)\s*minmax\(560px,\s*1\.42fr\);/);

  assert.match(styles, /\.level-dock\s*\{[\s\S]*?grid-template-rows:\s*auto 1fr;/);

  const desktopDayGroups = ruleBody(".day-groups");
  assert.match(desktopDayGroups, /repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
});

test("start screen primary button is centered in the hero panel", () => {
  const startPrimaryButton = ruleBody(".start-hero-panel .primary-button");
  assert.match(startPrimaryButton, /width:\s*min\(100%,\s*260px\);/);
  assert.match(startPrimaryButton, /align-self:\s*center;/);
  assert.match(startPrimaryButton, /justify-self:\s*center;/);
});

test("topbar controls have relaxed spacing without a follow-read chip", () => {
  const topbarControls = ruleBody(".topbar-controls");
  assert.match(topbarControls, /gap:\s*10px;/);
  assert.match(topbarControls, /min-width:\s*0;/);
  assert.doesNotMatch(topbarControls, /max-content/);
});

test("topbar separates progress from the score pill to avoid overlap", () => {
  const gameTopbar = ruleBody(".game-topbar");
  assert.match(gameTopbar, /grid-template-columns:\s*auto auto minmax\(0,\s*1fr\) auto;/);

  const starScore = ruleBody(".star-score");
  assert.match(starScore, /grid-column:\s*4;/);
  assert.match(starScore, /grid-row:\s*1;/);

  const mediumTopbarMatch = styles.match(/@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.topbar-controls\s*\{([^}]*)\}/);
  assert.ok(mediumTopbarMatch, "900px .topbar-controls rule exists");
  assert.match(mediumTopbarMatch[1], /grid-row:\s*3;/);
});
