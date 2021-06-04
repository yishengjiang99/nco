import { execFile, spawn } from 'child_process';
import { SIGBUS, SIGCONT, SIGPOLL } from 'constants';
const proc=execFile("./read99");

console.log(proc.pid);
proc.on("message", console.log);
proc.stdout.on("data",d=>{
	console.log(d);
});
proc.stderr.setEncoding("utf-8");

proc.stderr.pipe(process.stderr);
proc.on("close",console.log);
proc.on("exit",console.log);
process.stdin.on("data",d=>{
	proc.stdin.write(d);
})