#!/usr/bin/env node

// todo 写成通用的npm包可配置
/**
 * @fileoverview 用于切换项目、环境。
 * 使用方式：npm run [项目] [环境]
 * 示例：npm run admin (dev) 、npm run portal uat
 * 可用项目：obg-admin、obg-portal
 * 可用环境：dev、uat
 */

const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

// 网关映射

const ENV_MAP = {
  dev: "https://tofobg-dev-gateway.eads.tcl.com",
  uat: "https://tof-obg-uat-gateway.tcl.com",
};

const ENV = process.argv[2] || "dev";
const PROJECT = process.env.npm_lifecycle_event;

const COLOR_MAP = {
  error: "\x1b[31m",
  warn: "\x1b[33m",
  debug: "\x1b[36m",
};

(async () => {
  getCurrentInfo();
  try {
    const filePath = path.resolve(
      __dirname,
      `../packages/obg-${PROJECT}/src/config/base.env.config.js`
    );

    const data = await fs.readFile(filePath, "utf8");
    const updatedData = data.replace(
      /(const localBaseUrl\s*=\s*).*/,
      `$1${JSON.stringify(ENV_MAP[ENV])}`
    );

    await fs.writeFile(filePath, updatedData, "utf8");
    console.log(`${COLOR_MAP.debug}File updated successfully.`);

    const childProcess = spawn("pnpm", ["serve", "--open"], {
      cwd: path.resolve(__dirname, `../packages/obg-${PROJECT}`),
      shell: true,
    });

    childProcess.stdout.on("data", (data) => {
      if (data.includes("Local")) {
        console.log(
          `${COLOR_MAP.warn}${COLOR_MAP.debug}Command output: ${COLOR_MAP.warn}${data}`
        );
        getCurrentInfo();
      } else {
        console.log(`${COLOR_MAP.debug}Command output: ${data}`);
      }
    });

    childProcess.stderr.on("data", (data) => {
      console.error(`${COLOR_MAP.error}Command error: ${data}`);
    });

    childProcess.on("close", (code) => {
      console.log(`Command exited with code ${code}`);
    });
  } catch (err) {
    console.error(`Error: ${err}`);
  }
})();

function getCurrentInfo() {
  console.log(`${COLOR_MAP.error}当前项目：${PROJECT}`);
  console.log(`${COLOR_MAP.warn}当前环境：${ENV}`);
}
