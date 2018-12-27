const gulp = require('gulp'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    path = require('path'),
    assign = require('lodash.assign');

const browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    eslint = require('gulp-eslint');

const js = {
    dir: '.',
    srcDir: 'src',
    bundleDir: 'public',
    projects: {
        main: {
            srcFile: 'main.js',
            bundleFile: 'bundle.js',
            resultFile: 'jquery.inputarrow.js',
            files: [
                'public/bundle.js'
            ]
        }
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


function buildES6(mode, project, callback=pass) {
    let opts = {
        entries: [ path.join(js.dir, js.srcDir, js.projects[project].srcFile) ],
        paths: [ path.join(js.dir, js.srcDir) ],
        transform: [ babelify.configure(js.babelifyOptions) ],
        debug: true
    };
    let bundler = browserify(opts);

    function rebundle() {
        console.log('buildES6', mode, project);

        let stream = bundler.bundle();
        return stream.on('error', console.error)
            .pipe(source(js.projects[project].bundleFile))
            .pipe(buffer())
            .pipe(gulp.dest(path.join(js.dir, js.bundleDir)))
            .on('end', callback);
    }
    bundler.on('update', function() {
        rebundle();
    });
    bundler.on('log', console.log);
    return rebundle();
}
function buildJS(mode, project, callback=pass) {
    console.log('buildJS', mode, project);

    return gulp.src(js.projects[project].files, { cwd: js.dir })
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(concat(js.projects[project].resultFile))
        .pipe(uglify(js.modes[mode].uglifyOptions))
        .pipe(sourcemaps.write(js.modes[mode].mapDir, js.modes[mode].mapOptions))
        .pipe(gulp.dest(path.join(js.dir, js.modes[mode].resultDir)))
        .on('end', callback);
}
function lintES6() {
    console.log('lintES6');

    let files = [
        path.join(js.dir, js.srcDir, '**', '*.js')
    ];

    return gulp.src(files)
        .pipe(eslint(js.lintOptions))
        .pipe(eslint.format());
}


gulp.task('public', function() {
    for (let project in js.projects) {
        buildES6('development', project, () => {
            buildJS('development', project);
        });
    }
});
gulp.task('dist', function() {
    for (let project in js.projects) {
        buildES6('production', project, () => {
            buildJS('production', project);
        });
    }
});
gulp.task('lint', function() {
    lintES6();
});
