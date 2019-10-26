const gulp = require('gulp'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    eslint = require('gulp-eslint');

const path = require('path'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');


const js = {
    dir: '.',
    srcDir: 'src',
    project: {
        srcFile: 'main.js',
        resultFile: 'jquery.inputarrow.js'
    },
    modes: {
        development: {
            resultDir: 'public',
            mapDir: 'maps',
            mapOptions: {},
            uglifyOptions: {
                output: {
                    beautify: true
                },
                mangle: false,
                compress: false
            }
        },
        production: {
            resultDir: 'dist',
            mapDir: 'maps',
            mapOptions: {},
            uglifyOptions: {
                compress: {
                    pure_funcs: ['console.log']
                }
            }
        }
    },
    lintOptions: {

    },
    babelifyOptions: {
        presets: [['env']]
    }
};


const pass = function() {};


function buildJS(mode, callback=pass) {
    console.log('buildJS', mode);

    let opts = {
        entries: [ path.join(js.dir, js.srcDir, js.project.srcFile) ],
        paths: [ path.join(js.dir, js.srcDir) ],
        transform: [ babelify.configure(js.babelifyOptions) ],
        debug: true
    };
    let bundler = browserify(opts),
        stream = bundler.bundle();

    return stream.on('error', console.error).on('log', console.log)
        .pipe(source(js.project.resultFile))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify(js.modes[mode].uglifyOptions))
        .pipe(sourcemaps.write(js.modes[mode].mapDir, js.modes[mode].mapOptions))
        .pipe(gulp.dest(path.join(js.dir, js.modes[mode].resultDir)))
        .on('end', callback);
}
function lintJS(callback=pass) {
    console.log('lintJS');

    let files = [
        path.join(js.dir, js.srcDir, '**', '*.js')
    ];

    gulp.src(files)
        .pipe(eslint(js.lintOptions))
        .pipe(eslint.format());
    callback();
}


gulp.task('public', function(done) {
    buildJS('development', done);
});
gulp.task('dist', function(done) {
    buildJS('production', done);
});
gulp.task('build', gulp.parallel('public', 'dist'));
gulp.task('lint', function(done) {
    lintJS(done);
});
