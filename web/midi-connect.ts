declare type stdcb = (str: string) => void;
export function bindMidiAccess(
  procPort: MessagePort,
  noteOn: any,
  noteOff: any,
  stdout: stdcb,
  stderr: stdcb
) {
  // @ts-ignore
  return navigator.requestMIDIAccess().then(
    (midiAccess: any) => {
      stdout("midi access grant");
      const midiInputs = Array.from(midiAccess.inputs.values());
      for (const input of midiInputs) {
        // @ts-ignore
        input.onmidimessage = ({ data, timestamp }) => {
          const channel = data[0] & 0x0f;
          const cmd = data[0] & 0xf0;
          const note = data[1];
          const velocity = data.length > 2 ? data[2] : 0;
          switch (cmd) {
            case 0x90:
              if (velocity === 0) noteOff(note, channel, 0);
              else noteOn(note, channel, velocity);
              break;
            case 0x80:
              noteOff(note, channel, velocity);
              break;
            default:
              break;
          }
        };
      }
      midiAccess.onChange = () => stderr("midi access evoked");
      return midiInputs;
    },
    () => {
      stderr("access not granted");
    }
  );
}
