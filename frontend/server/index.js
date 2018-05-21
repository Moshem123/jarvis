const express = require('express');
const compression = require('compression');
const chalk = require('chalk');
const resolve = require('path').resolve;
const proxy = require('http-proxy-middleware');
const morgan = require('morgan');

const app = express();

const outputPath = resolve(__dirname, '..', 'dist');
const port = process.env.PORT || '3000';
const divider = chalk.gray('\n-----------------------------------');

app.use(compression());
app.use(morgan('tiny'));
app.use('/api', proxy({
  target: 'http://localhost:4000',
  secure: false,
  pathRewrite: { "^/api": "" }
}));
app.use('/', express.static(outputPath));
console.log(resolve(outputPath, 'index.html'));
app.get('*', function (req, res) {
  res.sendFile(resolve(outputPath, 'index.html'))
});

// Start your app.
app.listen(port, function (err) {
  if (err) {
    return console.error(chalk.red(err.message));
  }
  console.log('Server started ! ' + chalk.green('✓'));
  console.log('\n' + chalk.bold('Access URL:') + divider + '\n' + chalk.magenta('http://localhost:' + port) + divider + '\n' + chalk.blue('Press ' + chalk.italic('CTRL-C') + ' to stop') + '\n');
});