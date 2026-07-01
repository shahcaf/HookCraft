import { NextResponse } from 'next/server';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import unzipper from 'unzipper';
import { pipeline } from 'stream/promises';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { githubUrl, botToken } = await req.json();

    if (!githubUrl || !botToken) {
      return NextResponse.json({ error: 'Missing githubUrl or botToken' }, { status: 400 });
    }

    // Generate unique ID for this deployment
    const deployId = Math.random().toString(36).substring(7);
    const hostDir = path.join(os.tmpdir(), 'hookcraft_bots', deployId);
    
    // Ensure parent dir exists
    fs.mkdirSync(path.join(os.tmpdir(), 'hookcraft_bots'), { recursive: true });

    // Step 1: Download or copy repository
    try {
      if (githubUrl.toLowerCase().startsWith('c:\\') || githubUrl.toLowerCase().startsWith('d:\\')) {
        // Copy local folder for local hosting
        await execAsync(`xcopy "${githubUrl}" "${hostDir}\\" /E /I /H /Y`);
      } else {
        // Normal GitHub URL -> Download ZIP to avoid needing 'git' installed
        let repoUrl = githubUrl;
        if (repoUrl.endsWith('.git')) repoUrl = repoUrl.slice(0, -4);
        
        const zipUrl = `${repoUrl}/archive/HEAD.zip`;
        const res = await fetch(zipUrl);
        if (!res.ok) throw new Error(`Failed to download repository: ${res.statusText}`);

        // Extract ZIP
        const tempZipPath = path.join(os.tmpdir(), `${deployId}.zip`);
        await pipeline(res.body as any, fs.createWriteStream(tempZipPath));
        
        await fs.createReadStream(tempZipPath)
          .pipe(unzipper.Extract({ path: hostDir }))
          .promise();
          
        fs.unlinkSync(tempZipPath);

        // GitHub zips put everything inside a subfolder (repo-main)
        const extractedFolders = fs.readdirSync(hostDir);
        if (extractedFolders.length === 1 && fs.statSync(path.join(hostDir, extractedFolders[0])).isDirectory()) {
          const innerFolder = path.join(hostDir, extractedFolders[0]);
          const filesToMove = fs.readdirSync(innerFolder);
          for (const file of filesToMove) {
            fs.renameSync(path.join(innerFolder, file), path.join(hostDir, file));
          }
          fs.rmdirSync(innerFolder);
        }
      }
    } catch (err: any) {
      return NextResponse.json({ error: 'Failed to download or extract repository', details: err.message }, { status: 500 });
    }

    // Step 2: Detect environment & Install dependencies
    const isPython = fs.existsSync(path.join(hostDir, 'requirements.txt'));
    const isNode = fs.existsSync(path.join(hostDir, 'package.json'));

    if (isNode) {
      try {
        await execAsync(`cd ${hostDir} && npm install`);
      } catch (err: any) {
        return NextResponse.json({ error: 'Failed to install Node dependencies', details: err.message }, { status: 500 });
      }
    } else if (isPython) {
      try {
        await execAsync(`cd ${hostDir} && pip install -r requirements.txt`);
      } catch (err: any) {
        return NextResponse.json({ error: 'Failed to install Python dependencies', details: err.message }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Could not detect requirements.txt or package.json in repository.' }, { status: 400 });
    }

    // Prepare Environment Variables (.env)
    const envContent = `DISCORD_TOKEN=${botToken}\nDISCORD_BOT_TOKEN=${botToken}\nTOKEN=${botToken}\n`;
    fs.writeFileSync(path.join(hostDir, '.env'), envContent);

    // Step 3: Run the Bot in Detached Mode
    let command = '';
    let args: string[] = [];

    if (isNode) {
      const pkg = JSON.parse(fs.readFileSync(path.join(hostDir, 'package.json'), 'utf-8'));
      command = 'npm';
      args = ['start'];
    } else if (isPython) {
      // Look for a python file to run (main.py, bot.py, etc)
      const files = fs.readdirSync(hostDir);
      const pyFile = files.find(f => f === 'main.py' || f === 'bot.py' || f === 'app.py' || f.endsWith('.py'));
      if (!pyFile) {
        return NextResponse.json({ error: 'No Python entry file found (.py)' }, { status: 400 });
      }
      command = 'python';
      args = [pyFile];
    }

    // Spawn detached process so Next.js doesn't kill it when request ends
    const botProcess = spawn(command, args, {
      cwd: hostDir,
      detached: true,
      stdio: 'ignore', // ignore output to keep detached
      env: { ...process.env, DISCORD_TOKEN: botToken, DISCORD_BOT_TOKEN: botToken, TOKEN: botToken }
    });

    botProcess.unref(); // Allow Node to exit independently of this process

    return NextResponse.json({ 
      success: true, 
      deployId, 
      message: `Bot deployed successfully from ${githubUrl}` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
