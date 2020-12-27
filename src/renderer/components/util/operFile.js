var fs = require('fs');

export function getBinaryInfo(path,collback){
    fs.readFile(path,function(err, bytes) {
        if (err) {
            console.log("读取文件失败")
        } else {
            var buf = new Buffer(bytes); //将文件中读取的二进制数据，存入一个buffer对象
            collback(buf);
        }
    })
}
