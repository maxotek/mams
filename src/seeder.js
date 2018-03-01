"use strict";

var GitHub = require("github-api");
var fs = require("fs");
var program = require("commander");
var logger = require("mx-color-logger");
var git = require("nodegit");
var packageUpdater = require("./package-metadata-updater");

logger.init();

var packageFile = "./package.json";

if (!fs.existsSync(packageFile)) {
    console.error("package.json missing");
    process.exit(-1);
}

var pkg = JSON.parse(fs.readFileSync(packageFile));
var version = pkg.version;
var seederRepo = pkg.seederRepo;

if (!seederRepo) {
    console.error("Seeder repository URL was not found");
    process.exit(-2);
}

program
    .version(version)
    .option("-p, --project <value>", "The name of the project")
    .option("-d, --desc [value]", "The description of the project")
    .option("-o, --output-file [value]", "The otuput file")
    .option("-g, --create-github-repo", "Creates a GitHub repository")
    .option("-t, --access-token <value>", "The GitHub access token")
    .parse(process.argv);

console.info("Maxotek Angular Module Seeder v " + version);

var projectName = program.project;
var projectDesc = program.desc;
var createGithubRepo = program.createGithubRepo;
var outputFileName = projectName + ".js";

if (!projectName) {
    console.error("No project name was specified");
    program.outputHelp();
    process.exit(-3);
}

if (!projectDesc) {
    console.warn("No project description was specified");
}

var accessToken = program.accessToken;

if (createGithubRepo) {
    if (!accessToken) {
        console.error("GitHub access token was not provided");
        process.exit(-3);
    }

    console.info("Creating GitHub Repository");
    var gh = new GitHub({
        token: accessToken
    });

    console.info("Listing repositories");
    gh.getUser().listRepos(function (error, repos) {
        if (error) {
            console.error(error);
            process.exit(-4);
        }

        console.log("Found: " + repos.length + " repositories");
        if (repos.some(function (repo) {
            return repo.name == projectName;
        })) {
            console.error("The repository: " + projectName + " already exists");
            process.exit(-5);
        }

        cloneRepository(function () {
            gh.getUser().createRepo({
                name: projectName,
                description: projectDesc,
                private: false
            }, function (error, repo) {
                if (error) {
                    console.error("Unable to create repository: " + error);
                    process.exit(-6);
                }

                var htmlUrl = repo.html_url;
                console.info("Repository created at: " + htmlUrl);

                // Update Package
                packageUpdater(projectName, projectName, projectDesc, outputFileName, htmlUrl, repo.clone_url, repo.ssh_url);
            });

        });
    });
}

function cloneRepository(cloneCompleted) {
    if (fs.existsSync(projectName)) {
        if (fs.readdirSync(projectName).length) {
            console.error("Project directory: " + projectName + " already exists" + " and is not empty");
            process.exit(-2);
        } else {
            console.info("Project directory already exists but is empty");
        }
    }
    else {
        fs.mkdirSync(projectName);
        console.info("Created project directory: " + projectName);
    }

    // Clone Starter Project
    console.info("Seeder repository: " + seederRepo);

    git.Clone(seederRepo, projectName)
        .then(function () {
            console.log("Seeder repository cloned at: " + projectName);

            cloneCompleted();
        })
        .catch(function (err) {
            console.error(err);
        });
}