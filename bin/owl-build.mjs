#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = (() => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (e) {
    return process.cwd();
  }
})();

// テンプレートリポジトリのパス
const TEMPLATE_REPO_URL = 'https://github.com/kzk215/owl-build.git';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

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

    if (useLocal) {
      console.log('Using local configuration files...');
      const projectRoot = path.resolve(__dirname, '..');
      for (const file of configFiles) {
        const localPath = path.join(projectRoot, file);
        const destPath = path.join(rootDir, file);
        if (localPath !== destPath && fs.existsSync(localPath)) {
          copyRecursiveSync(localPath, destPath);
          console.log(`Copied local ${file} to root`);
        }
      }
    } else {
      console.log(`Fetching configuration files from ${TEMPLATE_REPO_URL} via git...`);
      
      const tempDir = path.join(rootDir, '.owl-build-temp');
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      try {
        // git clone を使用して取得（degit の代わり）
        execSync(`git clone --depth 1 ${TEMPLATE_REPO_URL} "${tempDir}"`, { stdio: 'inherit' });

        for (const file of configFiles) {
          const srcPath = path.join(tempDir, file);
          const destPath = path.join(rootDir, file);
          if (fs.existsSync(srcPath)) {
            copyRecursiveSync(srcPath, destPath);
            console.log(`Copied ${file} to root`);
          }
        }

        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (gitErr) {
        console.error('Error fetching from git:', gitErr.message);
        process.exit(1);
      }
    }

    // src ディレクトリの作成を確実にする
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
      console.log('Created src/ directory');
    }

    // テーマディレクトリの決定 (src/theme-name)
    const themeDir = path.join(srcDir, themeName);
    const wpSourceDir = path.join(rootDir, 'wp');

    console.log(`Setting up WordPress theme in src/${themeName}...`);
    if (fs.existsSync(wpSourceDir)) {
      if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir, { recursive: true });
      }
      copyRecursiveSync(wpSourceDir, themeDir);
      console.log(`Copied wp/ contents to src/${themeName}`);
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
