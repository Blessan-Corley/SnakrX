const { spawn } = require('child_process');
const { execSync } = require('child_process');
const net = require('net');

const PORT = 4173;
const SERVER_URL = `http://127.0.0.1:${PORT}`;

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function waitForServer(timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await checkPort(PORT)) return true;
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function run() {
  console.log('🏗️  Building Project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (e) {
    console.error('❌ Build failed');
    process.exit(1);
  }

  console.log(`🚀 Starting Preview Server on port ${PORT}...`);
  // Use 'npm.cmd' on Windows
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const server = spawn(npm, ['run', 'preview', '--', '--port', String(PORT), '--host', '127.0.0.1'], { 
    stdio: 'inherit',
    shell: true,
    detached: false 
  });

  try {
    console.log('⏳ Waiting for server to be ready...');
    const ready = await waitForServer();
    if (!ready) {
      throw new Error('Server failed to start (port not accessible)');
    }
    console.log('✅ Server is up! Running Tests (Headless)...');

    // Run Playwright (headless is default, list reporter for clean output)
    execSync('npx playwright test --reporter=list', { stdio: 'inherit', env: { ...process.env, BASE_URL: SERVER_URL } });
    console.log('✅ Tests Completed Successfully');
  } catch (error) {
    console.error('❌ Test Execution Failed');
    // Exit with error code to signal failure
    process.exit(1);
  } finally {
    console.log('🛑 Stopping Server...');
    if (process.platform === 'win32') {
        try {
            // Kill only the specific server process tree
            execSync(`taskkill /pid ${server.pid} /T /F`);
        } catch (e) {
            // Ignore if already dead
        }
    } else {
        server.kill();
    }
  }
}

run();
