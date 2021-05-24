export function mkdiv(
  type: string,
  attr: any = {},
  children: (string | HTMLElement)[] | HTMLElement | string = ""
): HTMLElement {
  const div = document.createElement(type);
  for (const key in attr) {
    if (key.match(/on(.*)/)) {
      div.addEventListener(key.match(/on(.*)/)![1], attr[key]);
    } else {
      div.setAttribute(key, attr[key]);
    }
  }
  const charray = !Array.isArray(children) ? [children] : children;
  charray.forEach((c) => {
    typeof c == "string" ? (div.innerHTML += c) : div.append(c);
  });
  return div;
}
//
declare type stdcb = (str: string) => void;
declare type logdivRet = {
  stdout: stdcb;
  stderr: stdcb;
  errPanel: HTMLElement;
  infoPanel: HTMLElement;
};
export function logdiv(): logdivRet {
  const logs: string[] = [];
  const errPanel = mkdiv("div");
  const infoPanel = mkdiv("pre", {
    style:
      "width:40em;min-height:299px;scroll-width:0;max-height:299px;overflow-y:scroll",
  });
  const stderr = (str: string) => (errPanel.innerHTML = str);
  const stdout = (log: string) => {
    logs.push((performance.now() / 1e6).toFixed(3) + ": " + log);
    if (logs.length > 100) logs.shift();
    infoPanel.innerHTML = logs.join("\n");
    infoPanel.scrollTop = infoPanel.scrollHeight;
  };
  return {
    stderr,
    stdout,
    infoPanel,
    errPanel,
  };
}

export function wrapDiv(div: string | HTMLElement, tag: string, attrs = {}) {
  return mkdiv(tag, attrs, [div]);
}
export function wrapList(divs: HTMLElement[]) {
  return mkdiv("div", {}, divs);
}
