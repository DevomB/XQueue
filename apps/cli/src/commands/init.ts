import { randomBytes } from "node:crypto";
import pc from "picocolors";
import ora from "ora";
import {
  configExists,
  defaultConfig,
  ensureDataDir,
  getPostwaveDir,
  writeConfig,
} from "../config.js";
import { createStorage } from "../runtime.js";

export type InitOptions = {
  force?: boolean;
  xClientId?: string;
  xClientSecret?: string;
};

export async function runInit(options: InitOptions = {}): Promise<void> {
  const spinner = ora("Initializing PostWave").start();

  try {
    if (configExists() && !options.force) {
      spinner.fail("Config already exists. Use --force to overwrite.");
      throw new Error("Config already exists. Use --force to overwrite.");
    }

    const postwaveDir = getPostwaveDir();
    const config = defaultConfig({
      xClientId: options.xClientId,
      xClientSecret: options.xClientSecret,
    });

    if (!config.x.clientId || !config.x.clientSecret) {
      config.x.clientId = config.x.clientId || "YOUR_X_CLIENT_ID";
      config.x.clientSecret =
        config.x.clientSecret || randomBytes(16).toString("hex");
    }

    writeConfig(config);
    const dataDir = ensureDataDir(config);
    createStorage(dataDir);

    spinner.succeed("PostWave initialized");
    console.log(pc.dim(`  Config: ${postwaveDir}/config.json`));
    console.log(pc.dim(`  Data:   ${dataDir}`));
    console.log();
    console.log(
      pc.yellow(
        "Next: set X_CLIENT_ID and X_CLIENT_SECRET in config, then run `postwave login`"
      )
    );
  } catch (err) {
    spinner.fail("Initialization failed");
    throw err;
  }
}
