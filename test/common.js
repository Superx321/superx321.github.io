var fs = require("fs");

var aesContent = fs.readFileSync("../lib/cryptojs-aes.min.js", "utf8");
var binContent = fs.readFileSync("../build/enc-bin.js", "utf8");
var commonContent = fs.readFileSync("../build/common.js", "utf8");

var stats = { passed: 0, failed: 0 };

(function(){
    eval(aesContent);
    eval(binContent);
    eval(commonContent);
    
    var key = '1234567890123456';
    var keyBytes = CryptoJS.enc.Utf8.parse(key);
    var ivBytes = keyBytes.clone();
    
    function spaces(s){
        if (s || s.length) {
            return s.slice(0,4) + " " + spaces(s.slice(4));
        }
        return "";
    }
    
    function test(message, expected){
        if (typeof message !== "string") {
            message = CryptoJS.enc.Hex.stringify(message);
        }
        var passed = message === expected;
        if (passed) {
            console.log("PASS msg: '" + message + "' len: " + message.length);
            stats.passed++;
        } else {
            console.log("FAIL\n msg: '" + message + "' len: " + message.length + "\n expected: '" + expected + "'");
            stats.failed++;
        }
    }
    
    console.log("\nSelf made test vectors for binary encoding");
    var binHexStr = [
        ["1010001101000101", "a345"],
        ["10100011010001101000110100010101", "a3468d15"],
        ["1010001101000110100011010001010111111111", "a3468d15ff"],
    ]
    binHexStr.forEach(function(entry){
        var binArray = CryptoJS.enc.Bin.parse(entry[0]);
        test(binArray.toString(), entry[1]);
        test(CryptoJS.enc.Bin.stringify(binArray), entry[0]);
    });
    
    console.log("\nSelf made test vectors for bitshift");
    
    var binShiftBinStr = [
        ["1010001101000101", 1, "0100011010001010"],
        ["1110001101000101", 2, "1000110100010100"],
        ["10100011010001101000110100010101", 2, "10001101000110100011010001010100"],
        ["1010001101000110100011010001010110100011010001101000110100010101", 8, "0100011010001101000101011010001101000110100011010001010100000000"],
        ["1010001101000110100011010001010110100011010001101000110100010101", 31, "1101000110100011010001101000101010000000000000000000000000000000"],
        ["1010001101000110100011010001010110100011010001101000110100010101", 32, "1010001101000110100011010001010100000000000000000000000000000000"],
        ["1010001101000110100011010001010110100011010001101000110100010101", 35, "0001101000110100011010001010100000000000000000000000000000000000"],
        ["1010001101000101", -1, "0101000110100010"],
        ["1010001101000101", -2, "0010100011010001"],
        ["10100011010001101000110100010101", -2, "00101000110100011010001101000101"],
        ["1010001101000110100011010001010110100011010001101000110100010101", -8, "0000000010100011010001101000110100010101101000110100011010001101"],
        ["1010001101000110100011010001010110100011010001101000110100010101", -31, "0000000000000000000000000000000101000110100011010001101000101011"],
        ["1010001101000110100011010001010110100011010001101000110100010101", -32, "0000000000000000000000000000000010100011010001101000110100010101"],
        ["1010001101000110100011010001010110100011010001101000110100010101", -35, "0000000000000000000000000000000000010100011010001101000110100010"],
    ];
    binShiftBinStr.forEach(function(entry){
        var binArray = CryptoJS.enc.Bin.parse(entry[0]);
        CryptoJS.ext.bitshift(binArray, entry[1]);
        test(CryptoJS.enc.Bin.stringify(binArray), entry[2]);
    });
    
    var binShiftHexStr = [
        ["21a547bc206973207465787420746f7420656e63727970740808080808080808", 28, "c206973207465787420746f7420656e637279707408080808080808080000000"],
        ["21a547bc206973207465787420746f7420656e63727970740808080808080808", 32, "206973207465787420746f7420656e6372797074080808080808080800000000"],
        ["21a547bc206973207465787420746f7420656e63727970740808080808080808", 36, "06973207465787420746f7420656e63727970740808080808080808000000000"],
    ];
    binShiftHexStr.forEach(function(entry){
        var binArray = CryptoJS.enc.Hex.parse(entry[0]);
        CryptoJS.ext.bitshift(binArray, entry[1]);
        test(CryptoJS.enc.Hex.stringify(binArray), entry[2]);
    });
})();

console.log("Common test - passed: " + stats.passed + ", failed: " + stats.failed + ", total: " + (stats.passed+stats.failed) + "\n");

if (stats.failed > 0) {
    process.exit(1);
}