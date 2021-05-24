declare type stdcb = (str: string) => void;
export function bindMidiAccess(
  procPort: MessagePort,
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
          procPort.postMessage({ midi: data, timestamp });
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
