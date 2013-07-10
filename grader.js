#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.
*/

var program = require('commander'),
    cheerio = require('cheerio'),
    rest = require('restler'),
    fs = require('fs');

var HTML_FILE_DEFAULT = 'index.html',
    CHECKS_FILE_DEFAULT = 'checks.json',
    URL_DEFAULT = 'default-url';

var assertFileExists = function (infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exists. Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

var urlToString = function (url) {
    var instr;
    rest.get(url).on('complete', function (result, response) {
        if (response.statusCode == 200) {
            instr = String(response.raw);
        }
    });
    return instr;
}

var cheerioHtmlFile = function (htmlFile) {
    return cheerio.load(fs.readFileSync(htmlFile));
};

var loadChecks = function (checksFile) {
    return JSON.parse(fs.readFileSync(checksFile));
};

var checkUrl = function (url, checksFile, callback) {
    var checks = loadChecks(checksFile).sort(),
                out = {},
                present,
                data,
                checkJson;

    rest.get(url).on('complete', function (result, response) {
        if (response.statusCode == 200) {
            data = String(response.raw);
            $ = cheerio.load(data);
            for (var ii in checks) {
                present = $(checks[ii]).length > 0;
                out[checks[ii]] = present;
            }
            callback(out);
        }
    });
};

var checkHtmlFile = function (htmlFile, checksFile, callback) {
    $ = cheerioHtmlFile(htmlFile);
    var checks = loadChecks(checksFile).sort(),
        out = {},
        present;

    for (var ii in checks) {
        present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    callback(out);
};

var showResults = function (out_json){
    console.log(JSON.stringify(out_json, null, 4));
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
        .option('-u, --url <url_input>', 'URL to parse')
        .parse(process.argv);
    if (program.url) {
        checkUrl(program.url, program.checks, showResults);
    }
    else if (program.file) {
        checkHtmlFile(program.file, program.checks, showResults);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}