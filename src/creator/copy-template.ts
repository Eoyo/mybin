/* eslint-disable no-console */
import path from "path"
import ignore from "ignore"
import chalk from "chalk"
import fs from "fs-extra"
import { config } from "../config/config"
import { copyFile } from "../file/copy-file"
import { readIgnore } from "../file/read-creator-ignore"
import { cutHead } from "../str/cutHead"

export function copyTemplate(fromDir: string, aimDir: string) {
  const alwaysIgnore = ignore().add(config.alwaysIgnore)

  const fromPath = path.join(config.templateDir, ".")
  const ignorePath = path.join(fromDir, config.ignoreFile)

  console.log(chalk.blueBright("start to create..."))

  if (!fs.existsSync(fromDir)) {
    console.log(chalk.red("Can't find the Dir: ") + chalk.green(fromDir))
    return
  }

  // 尝试读取 .creatignore; 没有读取到, fileIgnore 为undefined;
  const fileIgnore = readIgnore(ignorePath)

  // 配置ignorer;
  let ignorer = alwaysIgnore
  if (fileIgnore) {
    ignorer = alwaysIgnore.add(fileIgnore)
  } else {
    console.log(
      chalk.grey(`No ignore file (${config.ignoreFile}) at: `),
      chalk.green(ignorePath)
    )
  }

  if (ignorer) {
    ignorer.add([config.ignoreFile])
    copyFile(fromDir, "", aimDir, (str) => {
      // 读出相对 from path 的文件路径;
      const sortStr = cutHead(fromPath, str)
      if (sortStr) {
        return ignorer.ignores(sortStr)
      }
      return false
    })
  } else {
    copyFile(fromDir, "", aimDir)
  }
}
