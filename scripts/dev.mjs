// `npm run dev` — rebuild the ui package on change and run the docs site.
import { spawn } from 'node:child_process';

const run = (cmd) => spawn(cmd, { stdio: 'inherit', shell: true });
run('npm run dev -w ui-kit');
run('npm run dev -w docs');
