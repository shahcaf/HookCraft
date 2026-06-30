import { NextResponse } from 'next/server';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

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

    // Step 1: Clone the repository
    try {
      await execAsync(`git clone ${githubUrl} ${hostDir}`);
    } catch (err: any) {
      return NextResponse.json({ error: 'Failed to clone repository', details: err.message }, { status: 500 });
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
