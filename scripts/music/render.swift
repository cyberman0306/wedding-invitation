import AVFoundation
import Foundation

// macOS 기본 악기 뱅크로 오리지널 악보를 오프라인 렌더링합니다.
struct Note: Decodable {
    let time: Double
    let duration: Double
    let track: Int
    let pitch: UInt8
    let velocity: UInt8
}
struct Score: Decodable {
    let duration: Double
    let notes: [Note]
}
struct Event {
    let sample: Int64
    let note: Note
    let on: Bool
}

let score = try JSONDecoder().decode(Score.self, from: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1])))
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
let engine = AVAudioEngine()
let format = AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 2)!
let bank = URL(fileURLWithPath: "/System/Library/Components/CoreAudio.component/Contents/Resources/gs_instruments.dls")
let programs: [UInt8] = [0, 48, 46, 42]
let volumes: [Float] = [0.68, 0.30, 0.28, 0.24]
let pans: [Float] = [-0.12, 0.14, -0.30, 0.05]
var samplers: [AVAudioUnitSampler] = []
let reverb = AVAudioUnitReverb()
engine.attach(reverb)
reverb.loadFactoryPreset(.mediumHall)
reverb.wetDryMix = 19
engine.connect(reverb, to: engine.mainMixerNode, format: format)
let bus = AVAudioMixerNode()
engine.attach(bus)
engine.connect(bus, to: reverb, format: format)
for i in programs.indices {
    let sampler = AVAudioUnitSampler()
    engine.attach(sampler)
    try sampler.loadSoundBankInstrument(at: bank, program: programs[i], bankMSB: UInt8(kAUSampler_DefaultMelodicBankMSB), bankLSB: 0)
    let mixer = AVAudioMixerNode()
    engine.attach(mixer)
    mixer.outputVolume = volumes[i]
    mixer.pan = pans[i]
    engine.connect(sampler, to: mixer, format: format)
    engine.connect(mixer, to: bus, fromBus: 0, toBus: AVAudioNodeBus(i), format: format)
    samplers.append(sampler)
}
try engine.enableManualRenderingMode(.offline, format: format, maximumFrameCount: 1024)
try engine.start()
let output = try AVAudioFile(forWriting: outputURL, settings: format.settings)
let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: 1024)!
let events = score.notes.flatMap { note in
    [Event(sample: Int64(note.time * 44100), note: note, on: true),
     Event(sample: Int64((note.time + note.duration) * 44100), note: note, on: false)]
}.sorted { $0.sample == $1.sample ? (!$0.on && $1.on) : $0.sample < $1.sample }
let end = Int64(score.duration * 44100)
var index = 0
var failures = 0
while engine.manualRenderingSampleTime < end {
    let position = engine.manualRenderingSampleTime
    while index < events.count && events[index].sample <= position {
        let event = events[index]
        if event.on { samplers[event.note.track].startNote(event.note.pitch, withVelocity: event.note.velocity, onChannel: 0) }
        else { samplers[event.note.track].stopNote(event.note.pitch, onChannel: 0) }
        index += 1
    }
    let next = index < events.count ? events[index].sample : end
    let count = AVAudioFrameCount(min(1024, max(1, min(next, end) - position)))
    let status = try engine.renderOffline(count, to: buffer)
    if status == .success {
        try output.write(from: buffer)
        failures = 0
    } else {
        failures += 1
        if failures > 100 { fatalError("오디오 렌더링이 진행되지 않습니다: \(status)") }
    }
}
engine.stop()
print("Rendered \(score.notes.count) notes, \(score.duration) seconds → \(outputURL.path)")
