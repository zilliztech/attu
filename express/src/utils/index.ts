import glob from "glob";
import fs from "fs";

// Utils: read files under specified directories
export const getDirectories = (
  src: string,
  callback: (err: Error, res: [string]) => void
) => {
  glob(src + "/**/*", callback);
};

export const generateCfgs = (
  cfgs: [any],
  dirRes: [string],
  isSrcPlugin: boolean = true
) => {
  dirRes.forEach((item: string) => {
    if (item.endsWith("/config.json")) {
      const fileData = fs.readFileSync(item);
      const jsonData = JSON.parse(fileData.toString());
      const apiPath = jsonData?.server?.api;
      const dirName = item.split("/config.json").shift().split("/").pop();
      const dir = item.split("/config.json").shift();
      const cfg = {
        path: item,
        dir,
        dirName,
        api: apiPath,
        data: jsonData,
        componentPath: isSrcPlugin
          ? `./plugins/${dirName}/app`
          : `../${dir}/app`,
      };
      cfgs.push(cfg);
    }
  });
};
