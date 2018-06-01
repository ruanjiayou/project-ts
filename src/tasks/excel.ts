const fs = require('fs');
const XLSX = require('xlsx');

var buf = fs.readFileSync("测试.xlsx");
var wb = XLSX.read(buf, { type: 'buffer' });

