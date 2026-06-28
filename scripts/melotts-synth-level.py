#!/usr/bin/env python3
import argparse
import json
import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MELOTTS_ROOT = ROOT / "tmp" / "MeloTTS"

if MELOTTS_ROOT.exists():
    sys.path.insert(0, str(MELOTTS_ROOT))

try:
    import unidic_lite

    os.environ.setdefault("MECABRC", str(Path(unidic_lite.DICDIR) / "mecabrc"))
except Exception:
    pass

from melo.api import TTS


def parse_args():
    parser = argparse.ArgumentParser(description="Generate English sentence audio with MeloTTS.")
    parser.add_argument("--manifest", required=True, help="JSON file with text/output wav pairs.")
    parser.add_argument("--speaker", default="EN-US", help="Default MeloTTS English speaker id.")
    parser.add_argument("--speed", type=float, default=0.82, help="Speech speed. Lower is slower.")
    parser.add_argument("--device", default="cpu", help="Torch device, usually cpu on local Mac.")
    return parser.parse_args()


def main():
    args = parse_args()
    with open(args.manifest, "r", encoding="utf-8") as manifest_file:
        items = json.load(manifest_file)

    if not items:
        print("No audio items to generate.")
        return

    model = TTS(language="EN", device=args.device)
    speaker_ids = model.hps.data.spk2id
    if args.speaker not in speaker_ids:
        available = ", ".join(speaker_ids.keys())
        raise SystemExit(f"Unknown speaker '{args.speaker}'. Available: {available}")

    for index, item in enumerate(items, start=1):
        speaker = item.get("speaker", args.speaker)
        if speaker not in speaker_ids:
            available = ", ".join(speaker_ids.keys())
            raise SystemExit(f"Unknown speaker '{speaker}'. Available: {available}")

        speaker_id = speaker_ids[speaker]
        output_path = Path(item["outputWav"])
        output_path.parent.mkdir(parents=True, exist_ok=True)
        print(f"[{index}/{len(items)}] {speaker} | {item['text']} -> {output_path}", flush=True)
        model.tts_to_file(item["text"], speaker_id, str(output_path), speed=args.speed, quiet=True)


if __name__ == "__main__":
    main()
