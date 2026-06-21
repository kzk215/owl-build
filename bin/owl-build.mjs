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

function copyRecursiveSync(src, dest, excludeFiles = []) {
  const exists = fs.existsSync(src);
  if (!exists) return;
  
  const fileName = path.basename(src);
  if (excludeFiles.includes(fileName)) return;

  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), excludeFiles);
    });
  } else {
    // ファイルをコピー。既存のファイルがある場合は上書き。
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

async function run() {
  const args = process.argv.slice(2);
  let themeName = null;
  let useLocal = false;

  console.log('--- owl-build Debug Log ---');
  console.log('Arguments:', args);
  console.log('Current working directory:', process.cwd());

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
      console.log('Mode: Local');
      const projectRoot = path.resolve(__dirname, '..');
      console.log('Project root (local):', projectRoot);
      for (const file of configFiles) {
        const localPath = path.join(projectRoot, file);
        const destPath = path.join(rootDir, file);
        if (localPath !== destPath && fs.existsSync(localPath)) {
          copyRecursiveSync(localPath, destPath);
          console.log(`[Local] Copied ${file} to root`);
        }
      }
      
      // wp/ 内の Docker 関連ファイルをルートにコピー
      const localWpDir = path.join(projectRoot, 'wp');
      const dockerFiles = ['docker-compose.yml', '.env-template'];
      for (const file of dockerFiles) {
        const srcPath = path.join(localWpDir, file);
        if (fs.existsSync(srcPath)) {
          const destName = (file === '.env-template') ? '.env' : file;
          const destPath = path.join(rootDir, destName);
          fs.copyFileSync(srcPath, destPath);
          console.log(`[Local] Copied ${file} to root as ${destName}`);
        }
      }
    } else {
      console.log('Mode: Remote');
      console.log(`Template URL: ${TEMPLATE_REPO_URL}`);
      
      const tempDir = path.join(rootDir, '.owl-build-temp');
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      try {
        console.log('Cloning template repository...');
        execSync(`git clone --depth 1 ${TEMPLATE_REPO_URL} "${tempDir}"`, { stdio: 'inherit' });

        for (const file of configFiles) {
          const srcPath = path.join(tempDir, file);
          const destPath = path.join(rootDir, file);
          if (fs.existsSync(srcPath)) {
            copyRecursiveSync(srcPath, destPath);
            console.log(`[Remote] Copied ${file} to root`);
          }
        }

        // wp/ 内の Docker 関連ファイルをルートにコピー
        const tempWpDir = path.join(tempDir, 'wp');
        const dockerFiles = ['docker-compose.yml', '.env-template'];
        for (const file of dockerFiles) {
          const srcPath = path.join(tempWpDir, file);
          if (fs.existsSync(srcPath)) {
            const destName = (file === '.env-template') ? '.env' : file;
            const destPath = path.join(rootDir, destName);
            fs.copyFileSync(srcPath, destPath);
            console.log(`[Remote] Copied ${file} to root as ${destName}`);
          }
        }

        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log('Cleaned up temporary directory.');
      } catch (gitErr) {
        console.error('Error fetching from git:', gitErr.message);
        process.exit(1);
      }
    }

    // テーマディレクトリの決定 (src/theme-name)
    const themeDir = path.join(srcDir, themeName);
    const wpSourceDir = path.join(rootDir, 'wp');

    console.log(`Creating src directory: ${srcDir}`);
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
      console.log('Created src/ directory');
    }

    console.log(`Checking wp source directory: ${wpSourceDir}`);
    if (fs.existsSync(wpSourceDir)) {
      console.log(`Target theme directory: ${themeDir}`);
      if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir, { recursive: true });
        console.log('Created theme directory');
      }
      // Docker 関連ファイルは src 内にはコピーせず、ルートのみに配置する
      copyRecursiveSync(wpSourceDir, themeDir, ['docker-compose.yml', '.env-template']);
      console.log(`Copied wp/ contents to ${themeDir} (excluding Docker config)`);
    } else {
      console.log(`wp/ directory not found. Creating minimal theme files in ${themeDir}...`);
      if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir, { recursive: true });
      }
      // 最小限の WordPress テーマファイルを生成
      fs.writeFileSync(path.join(themeDir, 'style.css'), `/*\nTheme Name: ${themeName}\nAuthor: owl-build\nVersion: 1.0.0\n*/`);
      fs.writeFileSync(path.join(themeDir, 'index.php'), `<?php\n// Generated by owl-build\n?>`);
      console.log('Created minimal style.css and index.php');
    }

    console.log('\n--- Setup completed successfully! ---');
    console.log(`\nNext steps:\n1. cd ${path.basename(rootDir)}\n2. npm install\n3. npm run dev\n`);
    console.log('--- End of Debug Log ---');

  } catch (err) {
    console.error('Error during setup:', err.message);
    process.exit(1);
  }
}

run();
