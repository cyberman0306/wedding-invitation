"""1월의 약속: D장조, 3/4박자 오리지널 웨딩 왈츠 악보 생성."""
import json
import math
from pathlib import Path
import random
import struct
import sys

rng = random.Random(1162027)
out = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/wedding-composition")
out.mkdir(parents=True, exist_ok=True)

# 베이스와 가까운 성부 진행을 따르는 피아노/현악 보이싱입니다.
chords = {
    "D": (38, [57, 62, 66, 69]),
    "D9": (38, [57, 62, 64, 66]),
    "Ac": (37, [57, 61, 64, 69]),
    "Bm": (35, [57, 62, 66, 71]),
    "Fs": (42, [57, 61, 64, 69]),
    "G": (43, [55, 59, 62, 66]),
    "Df": (42, [57, 62, 66, 69]),
    "Em": (40, [55, 59, 62, 67]),
    "A": (33, [55, 61, 64, 69]),
    "E": (44, [56, 59, 62, 64]),
    "As": (33, [55, 59, 62, 64]),
    "Ds": (38, [57, 62, 67, 69]),
}
progression = (
    ["D9", "G", "Em", "As"]
    + ["D", "Ac", "Bm", "Fs", "G", "Df", "Em", "A",
       "D", "Ac", "Bm", "E", "G", "Df", "As", "D9"]
    + ["G", "A", "Fs", "Bm", "Em", "A", "Ds", "D"]
    + ["D", "Ac", "Bm", "Fs", "G", "Df", "As", "D9"]
    + ["G", "Em", "A", "D9"]
)

# 각 튜플은 MIDI 음높이와 박 길이. 쉼표는 음높이 0입니다.
theme = [
    [(78, .75), (76, .25), (74, 1), (69, 1)],
    [(76, 1.5), (78, .5), (73, 1)],
    [(74, 1), (78, .5), (81, .5), (78, 1)],
    [(76, .5), (73, .5), (69, 1.5), (0, .5)],
    [(71, .75), (74, .25), (78, 1), (79, 1)],
    [(78, 1.5), (76, .5), (74, 1)],
    [(76, 1), (74, .5), (71, .5), (67, 1)],
    [(73, 1.5), (71, .5), (69, .75), (0, .25)],
    [(74, .5), (78, .5), (81, 1.5), (78, .5)],
    [(80, .5), (81, .5), (76, 1), (73, 1)],
    [(78, .75), (81, .25), (83, 1), (81, 1)],
    [(80, 1.5), (78, .5), (76, 1)],
    [(79, .75), (78, .25), (74, 1), (71, 1)],
    [(78, 1), (76, .5), (74, .5), (69, 1)],
    [(71, .75), (73, .25), (76, 1), (73, 1)],
    [(74, 2.5), (0, .5)],
]
bridge = [
    [(79, 1.5), (78, .5), (74, 1)],
    [(76, .75), (78, .25), (81, 1), (85, 1)],
    [(85, .5), (81, .5), (78, 1.5), (76, .5)],
    [(78, 1), (81, .5), (83, .5), (78, 1)],
    [(79, .75), (78, .25), (76, 1), (71, 1)],
    [(73, .75), (76, .25), (81, 1), (79, 1)],
    [(79, 1), (78, .5), (76, .5), (74, 1)],
    [(78, 1.5), (76, .5), (74, .75), (0, .25)],
]
reprise = theme[:7] + [[(73, .5), (76, .5), (74, 1.5), (0, .5)]]
intro = [[(0, 3)], [(0, 3)], [(71, 1.5), (74, 1), (0, .5)], [(73, 1), (69, 1.5), (0, .5)]]
outro = [
    [(74, 1), (71, 1), (66, 1)],
    [(67, 1), (71, 1), (74, 1)],
    [(76, 1), (73, 1), (69, 1)],
    [(74, 3)],
]
melodies = intro + theme + bridge + reprise + outro
assert len(progression) == len(melodies) == 40
assert all(abs(sum(d for _, d in m) - 3) < .001 for m in melodies)

# 프레이즈 끝에서 호흡하고, 마지막 네 마디를 점차 느리게 연주합니다.
tempos = [90.0] * 40
for b in range(40):
    tempos[b] += math.sin(b * .72) * 1.3
for b in [3, 11, 19, 27, 35]:
    tempos[b] = 86
tempos[-4:] = [87, 84, 79, 70]
starts = [0.0]
for bpm in tempos:
    starts.append(starts[-1] + 180 / bpm)

def seconds(beat):
    bar = min(int(beat // 3), 39)
    return starts[bar] + (beat - bar * 3) * 60 / tempos[bar]

notes = []
def note(track, pitch, beat, length, velocity, human=True):
    delay = rng.uniform(-.008, .012) if human else 0
    start = max(0, seconds(beat) + delay)
    notes.append({
        "time": start, "duration": seconds(beat + length) - seconds(beat),
        "track": track, "pitch": pitch,
        "velocity": max(1, min(127, int(velocity + rng.uniform(-3, 3)))),
        "beat": beat, "length": length,
    })

for bar, (name, melody) in enumerate(zip(progression, melodies)):
    beat = bar * 3
    bass, voices = chords[name]
    arc = 1 if bar < 4 else 1.08 if bar < 20 else 1.16 if bar < 28 else 1.04
    if bar >= 36:
        arc = 1 - (bar - 36) * .085

    # 왈츠의 첫 박 베이스, 뒤 두 박의 가벼운 분산화음.
    note(0, bass + 12, beat, 1.6, 43 * arc)
    pattern = [(0.5, voices[1]), (1, voices[2]), (1.5, voices[3]),
               (2, voices[2]), (2.5, voices[1])]
    if bar == 39:
        pattern = [(.035 * i, p) for i, p in enumerate(voices)]
    for onset, pitch in pattern:
        note(0, pitch, beat + onset, 1.15 if bar < 39 else 4.5, 34 * arc)

    # 낮은 현악은 선율을 방해하지 않는 길이로 유지합니다.
    if bar >= 2:
        note(3, bass + 12, beat, 2.75 if bar < 39 else 4.4, 35 * arc)
    if bar >= 4:
        for pitch in voices[1:]:
            note(1, pitch, beat + .035, 2.85 if bar < 39 else 4.5, 32 * arc)

    position = 0
    for index, (pitch, length) in enumerate(melody):
        if pitch:
            dynamics = 58 * arc + (3 if index == 0 else 0)
            note(0, pitch, beat + position, length * .94, dynamics)
            if bar >= 8 and length >= .5:
                note(1, pitch, beat + position + .025, max(.2, length * .87), 36 * arc)
        position += length

    # 전환부에만 하프를 얹어 반복 반주의 기계적인 느낌을 줄입니다.
    if bar in [0, 4, 12, 20, 28, 36, 39]:
        for i, pitch in enumerate(voices):
            note(2, pitch + 12, beat + .075 * i, 2.0, 32 * arc)

duration = max(n["time"] + n["duration"] for n in notes) + 4
(out / "january-promise.json").write_text(json.dumps({"duration": duration, "notes": notes}), encoding="utf-8")

# 별도 편집이 가능하도록 실제 템포/3박자를 담은 MIDI도 함께 보관합니다.
def vlq(value):
    result = [value & 127]
    while (value := value >> 7):
        result.insert(0, (value & 127) | 128)
    return bytes(result)

def track_chunk(events):
    data = bytearray()
    previous = 0
    for tick, message in sorted(events, key=lambda event: event[0]):
        data += vlq(tick - previous) + message
        previous = tick
    data += b"\x00\xff\x2f\x00"
    return b"MTrk" + struct.pack(">I", len(data)) + data

tempo_events = [(0, b"\xff\x58\x04\x03\x02\x18\x08")]
for bar, bpm in enumerate(tempos):
    tempo_events.append((bar * 3 * 480, b"\xff\x51\x03" + int(60_000_000 / bpm).to_bytes(3, "big")))
midi = b"MThd" + struct.pack(">IHHH", 6, 1, 5, 480) + track_chunk(tempo_events)
for channel, program in enumerate([0, 48, 46, 42]):
    events = [(0, bytes([0xC0 | channel, program]))]
    for n in notes:
        if n["track"] == channel:
            events += [(round(n["beat"] * 480), bytes([0x90 | channel, n["pitch"], n["velocity"]])),
                       (round((n["beat"] + n["length"]) * 480), bytes([0x80 | channel, n["pitch"], 0]))]
    midi += track_chunk(events)
(out / "january-promise.mid").write_bytes(midi)
print(f"{len(notes)} notes, {duration:.1f}s, {out}")
