const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const del = require('del');
const eslint = require('gulp-eslint');

// Clean dist
gulp.task('cleanDist', () => {
    return del('dist');
});

// Configure the nodemon task
gulp.task('nodemon', cb => {
    let started = false;
    return nodemon({
        exec: './node_modules/.bin/babel-node --debug-brk=4001',
        script: 'src/index.js',

        watch: [
            'src/'
        ],
        verbose: true
    }).on('start', () => {
        if (!started) {
            cb();
            started = true;
        }
    })
});

// Linting
gulp.task('lint', () => {
    return gulp.src(['src/**/*.js', '!node_modules/**'])
        .pipe(eslint('.eslintrc.json'))
        .pipe(eslint.format());
});

// Watch lint
gulp.task('watch:lint', done => {
    gulp.watch('src/**/*.js', gulp.series('lint'));
    done();
});


gulp.task('dev', gulp.series('cleanDist', 'nodemon', 'lint','watch:lint'));

// =======================================