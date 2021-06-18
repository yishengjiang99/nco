declare type stdcb = (str: string) => void;
export declare function bindMidiAccess(procPort: MessagePort, noteOn: any, noteOff: any, stdout: stdcb, stderr: stdcb): any;
export {};
