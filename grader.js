#!/usr/bin/env node

var fs = require("fs");
var program = require("commander");
var cheerio = require("cheerio");
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var rest = require("restler");
var URL_DEFAULT ="http://rocky-scrubland-7263.herokuapp.com"; 

var assertFileExists = function(infile){
    var instr = infile.toString();
    if(!fs.existsSync(instr)){
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checkfile){
    return JSON.parse(fs.readFileSync(checkfile));
};

var checkHtmlFile = function(htmlfile, checkfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checkfile).sort();
    var out = {};
    for(var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var getInternetContent = function(url){
   var response = rest.get(url).on('complete',function(result){
   fs.writeFile('./index.html',result,function(err){
        if(err) throw err;
        console.log('has finished');})
    });}

var clone = function(fn){
   //Workaround for commander.js issue.
    return fn.bind({});
};

if(require.main == module){
    program
       .option('-c, --checks <check_file>','Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
       .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
       .option('-u, --url <url>',"Path to url", clone(getInternetContent), URL_DEFAULT)
       .parse(process.argv)
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else{
    exports.checkHtml = checkHtmlFile;
}
