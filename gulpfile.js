const gulp = require('gulp');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const inject = require('gulp-inject');
const browserSync = require('browser-sync').create();
const pump = require('pump');

gulp.task('default', () => {
  return gulp.src('src/index.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', () => {  
  return gulp.src('dist', { read: false })
    .pipe(clean());
});


gulp.task('develop:js', cb => {
  pump([
      gulp.src('src/**/*.js'),
      sourcemaps.init(),
      concat('bundle.js'),
      sourcemaps.write(),
      gulp.dest('dist'),
      browserSync.reload({
        stream: true,
      })
    ],
    cb
  );
});

gulp.task('develop:css', cb => {
  pump([
      gulp.src('src/styles/*.scss'),
      sourcemaps.init(),
      sass(),
      concat('styles.css'),
      sourcemaps.write(),
      gulp.dest('dist'),
      browserSync.reload({
        stream: true,
      })
    ],
    cb
  );
});

// needs some tweaking
gulp.task('develop:html', ['develop:js'], cb => {
  pump([
      gulp.src('src/index.html'),
      inject(gulp.src('dist/bundle.js', { read: false })),
      gulp.dest('dist')
    ],
    cb
  );
})

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: `${__dirname}/dist`
    },
  });
});

gulp.task('vendor', cb => {
  pump([
      gulp.src('node_modules/jquery/dist/jquery.js'),
      concat('vendor.js'),
      gulp.dest('dist'),
    ],
    cb
  );
});

gulp.task('watch', ['develop:js', 'develop:css', 'vendor'], () => {
  gulp.watch('src/**/*.js', ['develop:js']);
  gulp.watch('src/styles/*.scss', ['develop:css']);
});

gulp.task('deploy:js', cb => {
  pump([
      gulp.src('src/**/*.js'),
      concat('bundle.min.js'),
      babel({
        presets: [ 'es2015' ],
      }),
      uglify(),
      gulp.dest('dist')
    ],
  cb
  );
});

gulp.task('deploy:css', cb => {
  pump([
      gulp.src('src/styles/*.scss'),
      sass(),
      concat('styles.css'),
      gulp.dest('dist')
    ],
    cb
  )
})

gulp.task('deploy', ['vendor', 'deploy:css', 'deploy:js'], cb => {
  console.log('Build successful');
});