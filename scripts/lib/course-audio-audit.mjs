import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const voices = ["default", "male", "female"];

export async function auditCourseAudio(levels, { rootDir, probe }) {
  const findings = [];
  const mediaRecords = [];

  for (const level of levels) {
    for (const [questionIndex, question] of level.questions.entries()) {
      for (const voice of voices) {
        const relativePath = toVoicePath(question.audioFile, voice);
        const absolutePath = resolve(rootDir, relativePath);
        const context = {
          level: level.level,
          question: questionIndex + 1,
          id: question.id,
          sentence: question.sentence,
          voice,
          file: relativePath
        };

        let info;
        try {
          info = await stat(absolutePath);
        } catch (error) {
          if (error?.code === "ENOENT") {
            findings.push({ ...context, rule: "missing-audio", severity: "error" });
            continue;
          }
          throw error;
        }

        if (info.size === 0) {
          findings.push({ ...context, rule: "empty-audio", severity: "error" });
          continue;
        }

        const bytes = await readFile(absolutePath);
        const hash = createHash("sha256").update(bytes).digest("hex");
        mediaRecords.push({ ...context, absolutePath, hash, size: info.size });
      }
    }
  }

  const byHash = new Map();
  for (const record of mediaRecords) {
    const group = byHash.get(record.hash) ?? [];
    group.push(record);
    byHash.set(record.hash, group);
  }

  for (const [hash, records] of byHash) {
    const sentences = new Set(records.map((record) => normalizeSentence(record.sentence)));
    if (sentences.size > 1) {
      findings.push({
        rule: "cross-sentence-audio-duplicate",
        severity: "error",
        hash,
        files: records.map((record) => record.file),
        sentences: [...sentences]
      });
    }

    if (typeof probe === "function") {
      try {
        const media = await probe(records[0].absolutePath);
        if (!Number.isFinite(media?.duration) || media.duration < 0.25 || media.duration > 20) {
          findings.push({
            rule: "audio-duration-outlier",
            severity: "error",
            hash,
            duration: media?.duration,
            files: records.map((record) => record.file)
          });
        }
      } catch (error) {
        findings.push({
          rule: "undecodable-audio",
          severity: "error",
          hash,
          files: records.map((record) => record.file),
          details: String(error?.message ?? error)
        });
      }
    }
  }

  return {
    summary: {
      questions: levels.reduce((total, level) => total + level.questions.length, 0),
      expectedFiles: levels.reduce((total, level) => total + level.questions.length, 0) * voices.length,
      readableFiles: mediaRecords.length,
      uniqueMedia: byHash.size
    },
    findings
  };
}

function toVoicePath(audioFile, voice) {
  if (voice === "default") return audioFile;
  return audioFile.replace("assets/textbook/audio/", `assets/textbook/audio-${voice}/`);
}

function normalizeSentence(sentence) {
  return String(sentence).trim().toLowerCase().replace(/[.?!]+$/, "");
}
