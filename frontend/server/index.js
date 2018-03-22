import express from 'express';
import compression from 'compression';
import chalk from 'chalk';
import {resolve} from 'path';
import proxy from 'http-proxy-middleware';
import morgan from 'morgan';

const app = express();

const outputPath = resolve(process.cwd(), 'dist');
const port = process.env.PORT || '3000';
const divider = chalk.gray('\n-----------------------------------');

app.use(compression());
app.use(morgan('tiny'));
app.use('/api', proxy({
    target: 'http://localhost:4000',
    secure: false,
    pathRewrite: {"^/api": ""}
}));
app.use('/', express.static(outputPath));
console.log(resolve(outputPath, 'index.html'));
app.get('*', (req, res) => res.sendFile(resolve(outputPath, 'index.html')));

// Start your app.
app.listen(port, (err) => {
    if (err) {
        return console.error(chalk.red(err.message));
    }
    console.log(`Server started ! ${chalk.green('✓')}`);
    console.log(`
${chalk.bold('Access URL:')}${divider}
${chalk.magenta(`http://localhost:${port}`)}${divider}
${chalk.blue(`Press ${chalk.italic('CTRL-C')} to stop`)}
`);
});