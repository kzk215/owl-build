#!/usr/bin/env node

import { program } from 'commander';
import degit from 'degit';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// テンプレートリポジトリのパス（ユーザーの要望に合わせて適宜変更してください）
// ここでは、現在のプロジェクトの構成をベースにしていると仮定します。
const TEMPLATE_REPO = 'ka-z-u/owl-build'; // 仮のリポジトリ名

async function run() {
  const args = process.argv.slice(2);
  let themeName = null;
  let useLocal = false;

  // -wp または --wp の解析
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '-wp' || args[i] === '--wp') && args[i + 1]) {
      themeName = args[i + 1];
    }
    if (args[i] === '--local') {
      useLocal = true;
    }
  }

  if (!themeName) {
    console.log('Usage: owl-build -wp <theme-name> [--local]');
    process.exit(1);
  }

  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, 'src');
  const wpSourceDir = path.join(rootDir, 'wp');

  try {
    const configFiles = [
      'bin',
      '_scripts',
      '.gitignore',
      '.stylelintrc.cjs',
      'package.json',
      'vite.config.mjs',
      'README-BUILD.md',
      '.env-local'
    ];

    // rootDir に設定ファイルを配置する
    if (useLocal) {
      console.log('Using local configuration files...');
      const projectRoot = path.resolve(__dirname, '..');
      for (const file of configFiles) {
        const localPath = path.join(projectRoot, file);
        const destPath = path.join(rootDir, file);
        if (localPath !== destPath && await fs.exists(localPath)) {
          await fs.copy(localPath, destPath);
          console.log(`Copied local ${file} to root`);
        }
      }
    } else {
      // 1. degitで設定ファイルを呼び出す
      console.log(`Fetching configuration files from ${TEMPLATE_REPO}...`);
      
      try {
        const emitter = degit(TEMPLATE_REPO, {
          cache: false,
          force: true,
          verbose: true,
        });

        emitter.on('info', info => {
          console.log(info.message);
        });

        const tempDir = path.join(rootDir, '.owl-build-temp');
        await emitter.clone(tempDir);

        for (const file of configFiles) {
          const srcPath = path.join(tempDir, file);
          const destPath = path.join(rootDir, file);
          if (await fs.exists(srcPath)) {
            await fs.copy(srcPath, destPath);
            console.log(`Copied ${file} to root`);
          }
        }

        await fs.remove(tempDir);
      } catch (degitErr) {
        console.error('Error fetching from remote:', degitErr.message);
        console.log('Tip: Use --local flag to use local configuration files if you are in the owl-build directory.');
        process.exit(1);
      }
    }

    // 2. wp/ディレクトリ内のものをsrc/に入れ
    console.log('Setting up WordPress theme in src/...');
    if (await fs.exists(wpSourceDir)) {
      await fs.ensureDir(srcDir);
      await fs.copy(wpSourceDir, srcDir);
      console.log('Copied wp/ contents to src/');
    } else {
      console.warn('Warning: wp/ directory not found in current directory');
    }

    console.log('Setup completed successfully!');

  } catch (err) {
    console.error('Error during setup:', err.message);
    process.exit(1);
  }
}

run();
