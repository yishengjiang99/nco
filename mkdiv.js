export function mkdiv(type, attr = {}, children = "") {
  const div = document.createElement(type);
  for (const key in attr) {
    if (key.match(/on(.*)/)) {
      div.addEventListener(key.match(/on(.*)/)[1], attr[key]);
    } else {
      div.setAttribute(key, attr[key]);
    }
  }
  const charray = !Array.isArray(children) ? [children] : children;
  charray.forEach((c) => {
    typeof c == "string" ? (div.innerHTML += c) : c && div.append(c);
  });
  return div;
}

export function wrapDiv(type, inner) {
  return mkdiv(type, {}, inner);
}

export function logdiv({ container } = {}) {
  const infoPanel = mkdiv("pre", {
    style:
      "max-height:220px;overflow:auto;font-size:12px;text-align:left;width:min(100%,420px);white-space:pre-wrap;",
  });
  const errPanel = mkdiv("pre", {
    style:
      "max-height:220px;overflow:auto;font-size:12px;color:#b00;text-align:left;width:min(100%,420px);white-space:pre-wrap;",
  });
  const stdout = (msg) => {
    infoPanel.append(String(msg) + "\n");
  };
  const stderr = (msg) => {
    errPanel.append(String(msg) + "\n");
  };
  if (container) container.append(infoPanel, errPanel);
  return { stdout, stderr, infoPanel, errPanel };
}
