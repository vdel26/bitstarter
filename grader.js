#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.
*/

var program = require('commander'),
    cheerio = require('cheerio'),
    fs = require('fs');

var HTML_FILE_DEFAULT = 'index.html',
    CHECKS_FILE_DEFAULT = 'checks.json';

var assertFileExists = function (infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exists. Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function (htmlFile) {
    return cheerio.load(fs.readFileSync(htmlFile));
};

var loadChecks = function (checksFile) {
    return JSON.parse(fs.readFileSync(checksFile));
};

var checkHtmlFile = function (htmlFile, checksFile) {
    $ = cheerioHtmlFile(htmlFile);
    var checks = loadChecks(checksFile).sort(),
        out = {},
        present;
    for (var ii in checks) {
        present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

// detect if it is called from command line
if (require.main == module) {
    program
        .version('0.0.1')
        .usage('[options] <file ...>')
        .option('-c, --checks <check_file>', 'Path to checks.json', assertFileExists, CHECKS_FILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', assertFileExists, HTML_FILE_DEFAULT)
        .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}