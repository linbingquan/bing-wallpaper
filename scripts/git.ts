import { git } from "@spawn/git";

async function status() {
  const result = await git("status");
  if (result.success) {
    const text = result.text();
    const modifiedRegex = /modified:\s+(.*)/g;
    const modified = text.match(modifiedRegex);
    if (modified !== null) {
      const files = modified.map((item) => item.replace(modifiedRegex, "$1"));
      console.log("Modified files: ", files);
      return Promise.resolve(files);
    }
    return Promise.resolve([]);
  }
  console.log(result.errorText());
  return Promise.reject([]);
}

async function add() {
  const result = await git("add .");
  if (result.success) {
    console.log(result.text());
    return Promise.resolve(true);
  }
  console.log(result.errorText());
  return Promise.reject(false);
}

async function commit() {
  const cmd = `commit -m "feat(deploy): workflow action for deploy"`;
  const result = await git(cmd);
  if (result.success) {
    console.log(result.text());
    return Promise.resolve(true);
  }
  console.log(result.errorText());
  return Promise.reject(false);
}

if (import.meta.main) {
  const files = await status();
  if (files.length > 0) {
    await add();
    await commit();
  }
}
