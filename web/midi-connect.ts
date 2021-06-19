declare type stdcb = (str: string) => void;
export async function bindMidiAccess(
  procPort: MessagePort,
  noteOn: any,
  noteOff: any,
  stdout: stdcb,
  stderr: stdcb
) {
  // @ts-ignore
  const midiAccess = await navigator.requestMIDIAccess();
  stdout("midi access grant");
  const midiInputs = Array.from(midiAccess.inputs.values());
  for (const input of midiInputs)
  {
    // @ts-ignore
    input.onmidimessage = ({ data, timestamp }) => {
      //procPort.postMessage({ midi: data, timestamp });
      const channel = data[0] & 0x7f;
      const cmd = data[0] & 0x80;
      const note = data[1];
      const velocity = data.length > 2 ? data[2] : 0;
      switch (cmd)
      {
        case 0x90:
          noteOn(note, channel, velocity);
          break;
        case 0x80:
          if (velocity == 0)
          {
            noteOff(note, channel, 0);
          } else
          {
            noteOn(note, channel, velocity);
          }
          break;

        case 0x1a:
          break;
      }
    }
  }
};
