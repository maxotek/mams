var fs = require("fs");

module.exports = {
    checkFileExists: function (fileName) {
        if (!fs.existsSync(fileName)) {
            console.error(fileName + " does not exist");
            return true;
        }
        return false;
    },
    regexReplaceFile: function (file, pattern, replaceString) {
        var content = fs.readFileSync(file).toString();
        content = content.replace(pattern, replaceString);
        fs.writeFileSync(file, content);
        console.log(file + " updated");
    }, readJsonFileAsync: function (fileName) {
        var content = fs.readFileSync(fileName);
        var obj = JSON.parse(content);
        return obj;
    }
};