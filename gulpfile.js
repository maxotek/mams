"use strict";

var gulp = require("gulp"),
    eslint = require("gulp-eslint"),
    replace = require("gulp-regex-replace"),
    fs = require("fs");

gulp.task("package", () => {
    var packageFile = "./package.json";

    if (!fs.existsSync(packageFile)) {
        console.error("package.json missing");
        process.exit(-1);
    }

    var pkg = JSON.parse(fs.readFileSync(packageFile));

    return gulp.src("src/seeder.js")
        .pipe(replace({ regex: "pkg\\.version", replace: pkg.version }))
        .pipe(replace({ regex: "pkg\\.seederRepo", replace: pkg.seederRepo }))
        .pipe(gulp.dest("src"));
});

gulp.task("lint", () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(["**/*.js", "!dist/**", "!bower_components/**", "!node_modules/**"])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

gulp.task("default", ["lint"]);