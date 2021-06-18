

const stderr = console.log;
let ctx;
let awn;
let statebuffer;
let midiStream;
let midiWriter;
const d1 = document.querySelector('div');

const main = document.querySelector('pre');
const canvas = document.querySelector('canvas');
const cctx = canvas.getContext('2d');
const WW = 555, HH = 300;
const logs = [];
const stdout = (log) => {
  logs.push((performance.now() / 1e3).toFixed(3) + ': ' + log);
  if (logs.length > 100) logs.shift();
  main.innerHTML = logs.join('\n');
  main.scrollTop = main.scrollHeight;
};
const NOTE_OFF = 0x80, NOTE_ON = 0x90, POLY_KEY_PRESSURE = 0xA0,
      CONTROL_CHANGE = 0xB0, PROGRAM_CHANGE = 0xC0, CHANNEL_PRESSURE = 0xD0,
      PITCH_BEND_CHANGE = 0xE0;

export async function init_audio_ctx() {
  let uichannel = 0;
  ctx = new AudioContext({sampleRate: 48000});
  await ctx.audioWorklet.addModule('./audio-thread.js');
  awn = new AudioWorkletNode(ctx, 'rendproc', {
    numberOfOutputs: 16,
    outputChannelCount: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  });
  awn.onprocessorerror = (e) => {
    console.trace(e);
    stderr('e');
  };

  awn.port.onmessageerror = (e) => stderr(e.toString());
  const midistream = new TransformStream();
  const midiWriter = midistream.writable.getWriter();
  const dlc_stream = new TransformStream();
  const dlc_writable = dlc_stream.writable;

  function load_preset(pid, bankId, cid) {
    fetch(`pages/${pid}_${bankId}.dat`)
        .then(res => res.arrayBuffer())
        .then(ab => {
          awn.port.postMessage({preset: ab, channel: cid}, [ab]);
        });
  }
  awn.port.postMessage(
      {midi_readable: midistream.readable}, [midistream.readable]);

  load_preset(0, 0, 0);
  load_preset(10, 0, 0);


  awn.port.onmessage = (e) => {
    if (e.data.statebuffer) {
      statebuffer = new Uint32Array(e.data.statebuffer);
    } else {
      stdout(JSON.stringify(e.data));
    }
  };

  awn.connect(ctx.destination);
  const w = 10, h = 10;
  const midiAccess = await navigator.requestMIDIAccess().catch(stderr);
  const midiInputs = Array.from(midiAccess.inputs.values());
  for (const input of midiInputs) {
    stdout(`MIDI Input: ${input.name}, state: ${input.state}\n ID:${input.id}`);
    // @ts-ignore
    input.onmidimessage = ({data, timestamp}) => {
      awn.port.postMessage({midi: data});
      const ch = data[0] & 0x0f;
      switch (data[0] & 0x80) {
        case PROGRAM_CHANGE:
          load_preset(data[1], ch == 9 ? 0 : 128, ch);  // data[0] & 0x0f,)
          break;
        case 0x90:
          awn.port.postMessage({noteOff: [ch, data[1], data[2]]});
          break;
        case 0x80:
          const velocity = data[1];
          if (velocity == 0) {
            awn.port.postMessage({noteOff: [ch, data[1], 0]});
          } else {
            awn.port.postMessage({noteOn: [ch, data[1], 0]});
          }
          break;
        default:
          break;
      }
    }
  }
  let keys = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j'];
  const k2m = (e) => keys.indexOf(e.key);
  let uivel = 0x7f;
  window.onkeydown = (e) => e.repeat === false && k2m(e) > -1 &&
      awn.port.postMessage({noteOn: [uichannel, k2m(e), uivel]});
  window.onkeyup = (e) =>
      k2m(e) > -1 && awn.port.postMessage({noteOn: [uichannel, k2m(e), uivel]});
  function loop() {
    if (statebuffer) {
      cctx.clearRect(0, 0, WW, HH);
      for (let i = 0; i < 16 * 9; i++) {
        cctx.fillStyle = statebuffer[i];
        cctx.fillRect(~~(i / 16) * w, i % 16 * h, w, h);
      }
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}



main.innerHTML = 'press any key to start audio ctx...';

window.addEventListener('keydown', init_audio_ctx, {once: true});
