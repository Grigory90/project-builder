const fs = require('fs-extra');
const path = require('path');
const program = require('yargs');
const childProcess = require('child_process');

const log = require('./builder/helpers/log');

const cliRoot = path.resolve(__dirname, '../');

const pkg = JSON.parse(fs.readFileSync(`${cliRoot}/package.json`, 'utf8'));

let gulp = {
    cli: `${cliRoot}/node_modules/gulp/bin/gulp`,
    argv: [`--gulpfile`, `${cliRoot}/lib/builder/index.js`, `--cwd`, process.cwd()]
};

process.env.cliRoot = cliRoot;

program.locale('en');

program.version(() => pkg.version);

program.command('init', 'Create config', {
    sample: {
        alias: 's',
        default: false
    }
}, argv => {

    if (argv.sample) {
        if (fs.existsSync('./app')) {
            log('WARNING: App folder already exists.', 'yellow');
        } else {
            fs.copySync(path.resolve(cliRoot, './lib/data/app'), './app');
            log('App folder was created successfully.', 'green');
        }
    }

    if (fs.existsSync('./dixi.config.js')) {
        log('WARNING: Config file already exists.', 'yellow');
    } else {
        fs.copySync(path.resolve(cliRoot, './lib/data/dixi.config.js'), './dixi.config.js');
        log('Config file was created successfully.', 'green');
    }
});

program.command('run', 'Start local server and watchers', {}, () => childProcess.fork(gulp.cli, gulp.argv));

program.command('build', 'Build project', {}, () => {

    process.env.isProduction = true;
    childProcess.fork(gulp.cli, [...gulp.argv, 'build']);
});

program.help('h');

program.alias('h', 'help');
program.alias('v', 'version');

program.demandCommand(1);

program.parse(program.argv._);