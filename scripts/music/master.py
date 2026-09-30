"""부드러운 시작/종료와 재생 음량을 적용하고 PCM WAV로 저장합니다."""
from pathlib import Path
import struct
import sys
import wave
import numpy as np

source, target = map(Path, sys.argv[1:3])
data = source.read_bytes()
position = 12
while position + 8 <= len(data):
    chunk, size = struct.unpack_from("<4sI", data, position)
    payload = position + 8
    if chunk == b"fmt ":
        encoding, channels, rate = struct.unpack_from("<HHI", data, payload)
        assert encoding == 3, "32-bit float WAV가 필요합니다."
    if chunk == b"data":
        samples = np.frombuffer(data[payload:payload + size], dtype="<f4").copy().reshape(-1, channels)
        break
    position = payload + size + (size % 2)

peak = float(np.max(np.abs(samples)))
rms = float(np.sqrt(np.mean(samples ** 2)))
assert np.isfinite(samples).all() and peak > .001, "유효한 음원이 아닙니다."
gain = min(.84 / peak, .10 / max(rms, 1e-8))
samples *= gain
fade_in = int(rate * .025)
fade_out = int(rate * 2)
samples[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
samples[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]
with wave.open(str(target), "wb") as output:
    output.setnchannels(channels)
    output.setsampwidth(2)
    output.setframerate(rate)
    output.writeframes((np.clip(samples, -1, 1) * 32767).astype("<i2").tobytes())
print(f"{len(samples)/rate:.2f}s; raw peak={peak:.4f}; gain={gain:.3f}; final peak={np.max(np.abs(samples)):.4f}; nonzero={np.count_nonzero(samples)}")
