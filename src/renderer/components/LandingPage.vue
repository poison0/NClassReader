<template>
    <div class="page">
        <div class="header">
            <div class="title">ClassReader</div>
        </div>
        <wired-divider elevation="2" ></wired-divider>
        <div class="content">
            <div class="-left-content">
                <div class="bottomNav">
                    <div class="bottomDiv">
                        <wired-button class="wired-button" elevation="3" v-on:click="upload()">upload</wired-button>
                    </div>
                </div>
                <div class="bookArea">
                </div>
            </div>
            <div class="-right-content">
                <div class="-right-bar">
                </div>
                <div class="-right-content-book" :style="'height:'+(pageHeight-90)+'px'">
                    <div class="row-line">
                        <div v-for="(hex,index) in hexArray" class="single">
                            <div>{{hex.toUpperCase()}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import SystemInformation from './LandingPage/SystemInformation'
    import {getBinaryInfo} from "./util/operFile";
    import "wired-button";
    import "wired-divider";
    const {dialog} = require('electron').remote;
    const remote = require('electron').remote;

    export default {
        name: 'landing-page',
        components: {SystemInformation},
        data() {
            return {
                //16进制数组
                hexArray: [],
                pageHeight: window.innerHeight,
                classFile: {
                    magic: {},//魔数
                    minor_version: {},//次版本号
                    major_version: {},//主版本号
                    constant_pool_count: {},//常量池个数
                    constant_pool: [],//常量池
                    access_flags: {},//类访问标志
                    this_class: {},//类索引
                    super_class: {},//父类索引
                    interfaces_count: {},//接口计数器
                    interfaces:[],//接口表
                    fields_count:{},//字段计数器
                    fields:[],//字段表
                },
                readIndex: 0,//解析时读取的指针

            }
        },
        mounted() {
            let self = this
            //监视页面大小变化
            remote.getCurrentWindow().on('resize', (a) => {
                self.pageHeight = window.innerHeight;
            })

        },
        methods: {
            //获取文件
            upload() {
                let self = this;
                dialog.showOpenDialog(
                    {
                        title: "class文件", filters: [{name: 'class', extensions: ['class', 'CLASS']}]
                    }, (filePath) => {
                        if (filePath) {
                            getBinaryInfo(filePath[0], (buf) => {
                                var offset = 0;
                                while (offset < buf.length) {
                                    let s = buf[offset].toString(16);
                                    if (s.length === 1) {
                                        s = "0" + s;
                                    }
                                    this.hexArray.push(s);
                                    offset++;
                                }
                                self.buildTree()
                            })
                        }
                    })
            },
            //创建树结构
            buildTree() {
                this.getMagic();
                this.getMinorVersion();
                this.getMajorVersion();
                this.getConstantPoolCount();
                this.getConstantPool();
                this.getAccessFlags();
                this.getThisClass();
                this.getSuperClass();
                this.getInterfacesCount();
                this.getInterfaces();
                this.getFieldsCount();
                console.log(this.classFile)
            },
            //读取魔数
            getMagic() {
                this.classFile.magic = this.getUFields(4, "魔数")
            },
            //读取次版本号
            getMinorVersion() {
                this.classFile.minor_version = this.getUFields(2, "副版本号")
            },
            //读取主版本号
            getMajorVersion() {
                this.classFile.major_version = this.getUFields(2, "主版本号")
            },
            //读取常量池个数
            getConstantPoolCount() {
                this.classFile.constant_pool_count = this.getUFields(2, "常量池计数器")
            },
            //读取常量池
            getConstantPool() {
                this.classFile.constant_pool = this.getConstantPoolAttr(this.classFile.constant_pool_count.value)
            },
            //读取类访问标志
            getAccessFlags() {
                this.classFile.access_flags = this.getUFields(2,"类访问标志")
                let flags = [0x0001, 0x0010, 0x0020, 0x0200, 0x0400, 0x1000, 0x2000, 0x4000];
                //添加标志类型
                this.classFile.access_flags["sign"] = []
                for (const key in flags) {
                    let arg = flags[key]
                    //标志的值如果与class文件中值的与运算还等于本身的话，说明包含此标志，一个类可以有多个标志
                    if ((arg & parseInt(this.classFile.access_flags.hexArray.join(""), 16)) === arg) {
                        switch (arg){
                            case 0x0001:
                                this.classFile.access_flags["sign"].push("ACC_PUBLIC");
                                break;
                            case 0x0010:
                                this.classFile.access_flags["sign"].push("ACC_FINAL");
                                break;
                            case 0x0020:
                                this.classFile.access_flags["sign"].push("ACC_SUPER");
                                break;
                            case 0x0200:
                                this.classFile.access_flags["sign"].push("ACC_INTERFACE");
                                break;
                            case 0x0400:
                                this.classFile.access_flags["sign"].push("ACC_ABSTRACT");
                                break;
                            case 0x1000:
                                this.classFile.access_flags["sign"].push("ACC_SYNTHETIC");
                                break;
                            case 0x2000:
                                this.classFile.access_flags["sign"].push("ACC_ANNOTATION");
                                break;
                            case 0x4000:
                                this.classFile.access_flags["sign"].push("ACC_ENUM");
                                break;
                        }
                    }
                }
            },
            //读取类索引
            getThisClass() {
                this.classFile.this_class = this.getUFields(2, "类索引")
                this.classFile.this_class["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(this.classFile.this_class.value));
            },
            //读取父类索引
            getSuperClass() {
                this.classFile.super_class = this.getUFields(2, "父类索引")
                if(this.classFile.super_class.value !== 0){
                    this.classFile.super_class["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(this.classFile.super_class.value));
                }
            },
            //读取接口计数器
            getInterfacesCount() {
                this.classFile.interfaces_count = this.getUFields(2, "接口计数器")
            },
            //读取接口表
            getInterfaces() {
                if (this.classFile.interfaces_count.value > 0) {
                    this.classFile.interfaces = this.getInterfacesAttr(this.classFile.interfaces_count.value);
                }
            },
            //读取字段计数器
            getFieldsCount() {
                this.classFile.fields_count = this.getUFields(2, "字段计数器")
            },
            //读取字段表
            getFields() {
                this.classFile.fields = this.getUFields(2, "字段表")
            },
            //读取字段表的属性
            //num : 字段表个数
            getFieldsAttr(num){
                let interfaceAttr = [];
                for (let i = 0; i < num; i++) {
                    let addr = this.getUFields(2, "接口表");
                    addr["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(addr.value));
                    interfaceAttr.push(addr)
                }
                return interfaceAttr;
            },

            //读取接口表的属性
            //num : 接口表个数
            getInterfacesAttr(num){
                let interfaceAttr = [];
                for (let i = 0; i < num; i++) {
                    let addr = this.getUFields(2, "接口表");
                    addr["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(addr.value));
                    interfaceAttr.push(addr)
                }
                return interfaceAttr;
            },
            //获取常量池的属性
            //num : 常量池个数
            getConstantPoolAttr(num){
                let constantPool = [];
                for (let i = 1; i <= num-1; i++) {
                    let attr = {};
                    //获取tag值
                    let tag = this.getUFields(1,"值")
                    attr["tag"] = tag;
                    switch (tag.value) {
                        case 1:
                            attr["type"] = "CONSTANT_utf8"
                            let length = this.getUFields(2,"长度")
                            attr["length"] = length;
                            //获取内容
                            attr["bytes"] = this.getStr(length.value,"字符串")
                            break;
                        case 3:
                            attr["type"] = "CONSTANT_Integer"
                            attr["bytes"] = this.getUFields(4,"整型")
                            break;
                        case 4:
                            attr["type"] = "CONSTANT_Float"
                            attr["bytes"] = this.getUFields(4,"浮点型")
                            break;
                        case 5:
                            attr["type"] = "CONSTANT_Long"
                            attr["high_bytes"] = this.getUFields(4,"长整型")
                            attr["low_bytes"] = this.getUFields(4,"长整型")
                            break;
                        case 6:
                            attr["type"] = "CONSTANT_Double"
                            attr["high_bytes"] = this.getUFields(4,"双精度浮点型")
                            attr["low_bytes"] = this.getUFields(4,"双精度浮点型")
                            break;
                        case 7:
                            attr["type"] = "CONSTANT_Class"
                            //对常量池的一个有效索引
                            attr["name_index"] = this.getUFields(2,"类或接口的符号引用")
                            break;
                        case 8:
                            attr["type"] = "CONSTANT_String"
                            attr["string_index"] = this.getUFields(2,"字符串类型字面量")
                            break;
                        case 9:
                            attr["type"] = "CONSTANT_Fieldref"
                            attr["class_index"] = this.getUFields(2,"字段的符号引用")
                            attr["name_and_type_index"] = this.getUFields(2,"字段的名称和描述符")
                            break;
                        case 10:
                            attr["type"] = "CONSTANT_Methodref"
                            attr["class_index"] = this.getUFields(2,"类中方法的符号引用")
                            attr["name_and_type_index"] = this.getUFields(2,"类中方法的名称和描述符")
                            break;
                        case 11:
                            attr["type"] = "CONSTANT_InterfaceMethodref"
                            attr["class_index"] = this.getUFields(2,"接口中方法的符号引用")
                            attr["name_and_type_index"] = this.getUFields(2,"接口中方法的名称和描述符")
                            break;
                        case 12:
                            attr["type"] = "CONSTANT_NameAndType"
                            attr["name_index"] = this.getUFields(2,"方法或字段的部分符号引用")
                            attr["descriptor_index"] = this.getUFields(2,"有效的字段描述符或者方法描述符")
                            break;
                        case 15:
                            attr["type"] = "CONSTANT_MethodHandle"
                            attr["reference_kind"] = this.getUFields(1,"句柄类型")
                            attr["reference_index"] = this.getUFields(2,"句柄名称")
                            break;
                        case 16:
                            attr["type"] = "CONSTANT_MethodType"
                            attr["descriptor_index"] = this.getUFields(1,"方法的描述符")
                            break;
                        case 18:
                            attr["type"] = "CONSTANT_InvokeDynamic"
                            attr["bootstrap_method_attr_index"] = this.getUFields(2,"引导方法表的索引")
                            attr["name_and_type_index"] = this.getUFields(2,"方法名和方法描述符")
                            break;
                    }
                    constantPool.push(attr);
                    //因为jvm开发时是处于32位机为主流的时代，所以为了向下兼容，double和long类型的常量占两个空间
                    if (tag.value === 5 || tag.value === 6) {
                        constantPool.push({
                            type:"empty",
                        });
                        i++;
                    }
                }
                return constantPool;
            },
            //获取常量池中对应的类名
            //index : 索引
            getConstantClassStr(index){
                return this.classFile.constant_pool[this.classFile.constant_pool[index - 1].name_index.value - 1].bytes.hexArray.join("")
            },
            //获取字符串
            getStr(num,typeName){
                let start = this.readIndex;
                let u = {
                    startIndex: start,
                    endIndex: 1,
                    hexArray: [],
                    typeName: typeName,
                    type: "str",
                    length: num
                };
                u.hexArray = this.hexArray.slice(start, start + num)
                u.endIndex = start + num;
                this.readIndex += num;
                return u;
            },
            //获取u1，u2，u4，u8字段
            getUFields(type, typeName, value) {
                let start = this.readIndex;
                let array = this.hexArray;
                let u = {
                    startIndex: start,
                    endIndex: 1,
                    hexArray: [],
                    typeName: typeName,
                    type: "u1",
                    length: 1
                };
                switch (type) {
                    case 1:
                        u.hexArray = array.slice(start, start + 1)
                        u.endIndex = start + 1;
                        u.type = "u1";
                        this.readIndex += 1;
                        break
                    case 2:
                        u.hexArray = array.slice(start, start + 2)
                        u.endIndex = start + 2;
                        u.type = "u2";
                        this.readIndex += 2;
                        break
                    case 4:
                        u.hexArray = array.slice(start, start + 4)
                        u.endIndex = start + 4;
                        u.type = "u4";
                        this.readIndex += 4;
                        break
                    case 8:
                        u.hexArray = array.slice(start, start + 8)
                        u.endIndex = start + 8;
                        u.type = "u8";
                        this.readIndex += 8;
                        break
                }
                if (!value) {
                    //转成10进制值
                    u["value"] = Number(eval("0x" + u.hexArray.join("")).toString(10));
                }
                return u;
            },
            //ASCII码转16进制
            strToHexCharCode(str) {
                if (str === "") {
                    return "";
                } else {
                    let hexCharCode = [];
                    hexCharCode.push("0x");
                    for (var i = 0; i < str.length; i++) {
                        hexCharCode.push((str.charCodeAt(i)).toString(16));
                    }
                    return hexCharCode.join("");
                }
            },

            //十六进制转ASCII码
            hexCharCodeToStr(hexCharCodeStr) {
                let trimedStr = hexCharCodeStr.trim();
                let rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
                let len = rawStr.length;
                if (len % 2 !== 0
                ) {
                    alert("存在非法字符!");
                    return "";
                }
                let curCharCode;
                let resultStr = [];
                for (var i = 0; i < len; i = i + 2) {
                    curCharCode = parseInt(rawStr.substr(i, 2), 16);
                    resultStr.push(String.fromCharCode(curCharCode));
                }
                return resultStr.join("");
            }
        }
    }
</script>

<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;
        /*background-color: #EFEFEF;*/
        position: relative;
        overflow: hidden;
        .header {
            top: 0;
            /*position: absolute;*/
            display: flex;
            flex-direction: row;
            justify-items: center;
            width: 100%;
            height: 40px;
            background-color: #ffffff;
            margin-top: 10px;
            /*background-color: #FFA400;*/
            /*box-shadow: 0 0 4px #999999;*/
            /*z-index: 111;*/

            .title {
                color: #0F4DA8;
                /*color: #437DD4;*/
                /*color: #6A94D4;*/
                /*color: #FFA110;*/
                /*font-family: Calibri, "Times New Roman", serif;*/
                font-family: "Gloria Hallelujah", sans-serif;
                font-size: 20px;
                font-weight: bolder;
                margin-left: 20px;
                width: 100px;
                height: 40px;
                line-height: 48px;
            }
        }

        .content {
            /*position:absolute;*/
            /*font-family: '华文细黑', 'Courier New', Courier, monospace;*/
            /*display: flex;*/
            /*flex-direction: row;*/
            /*height: 660px;*/
            height: 100%;
            position: relative;
            /*margin-top: 48px;*/

            .-left-content {
                float: left;
                /*width: 20%;*/
                width: 200px;
                height: 100%;
                /*border-right: 1px solid #E4E4E4;*/
                /*box-shadow: 0 0 4px #999999;*/
                z-index: 101;

                .bookArea {
                    .titleBar {
                        /*color: #999999;*/
                        font-size: 13px;
                        height: 40px;
                        line-height: 40px;
                        padding-left: 20px;
                        /*border-bottom: 1px solid #E4E4E4;*/
                    }

                    .bookItem {
                        cursor: pointer;
                        display: flex;
                        flex-direction: row;
                        line-height: 40px;
                        height: 40px;
                        /*border-bottom: 1px solid #E4E4E4;*/

                        .bookLabel {
                            display: flex;
                            flex-direction: row;
                            padding-left: 20px;
                            width: 98%;

                            .labelWord {
                                width: 100px;
                                margin-left: 6px;
                            }
                        }

                        .strip {
                            width: 5px;
                        }

                        .stripChecked {
                            flex-shrink: 0;
                            /*background-color: #0088FE;*/
                            background-color: #2F89DF;
                        }

                        &:hover {
                            background-color: #F5F5F5;
                        }
                    }

                    .bookItemChecked {
                        background-color: #E4E4E4;
                    }
                }

                .bottomNav {
                    width: 100%;
                    height: 50px;
                    display: flex;
                    /*border-bottom: 1px solid #E4E4E4;*/
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;

                    .bottomDiv {
                        font-family: "Comic Sans MS";
                        color: #0F4DA8;
                        height: 30px;
                        font-size: 16px;
                        font-weight: bolder;
                        width: 90%;
                    }

                }
            }

            .-right-content {
                /*float: right;*/
                /*min-width: 80%;*/
                margin-left: 200px;
                height: 100%;
                display: flex;
                overflow: auto;
                flex-direction: column;
                /*background-color: #E4E4E4;*/
                /*position: relative;*/
                .row-line {
                    /*font-family: Humanist;*/
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    cursor: text;
                    max-width: 640px;

                    *::selection {
                        background: none repeat scroll 0 0 #FFA110;
                        color: #fff;
                        text-shadow: none;
                    }

                    line-height: 25px;
                    height: 25px;

                    .single {
                        font-size: 16px;
                        text-align: center;
                        min-width: 40px;
                        border-radius: 3px;
                        background: #ffffff;
                        box-shadow: inset 2px 2px 3px #cccccc,
                        inset -2px -2px 3px #fafafa;

                        :hover {
                            border-radius: 3px;
                            background: linear-gradient(145deg, #cccccc, #fafafa);
                            box-shadow: 2px 2px 3px #cccccc,
                            -2px -2px 3px #fafafa;
                        }
                    }

                }

                .-right-bar {
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    height: 40px;
                    /*background-color: #EFEFEF;*/
                    /*background-color: #FFA400;*/
                    /*border-bottom: 1px solid #E4E4E4;*/
                    /*box-shadow: 0 0 2px #999999;*/
                    position: relative;
                    z-index: 99;

                    .-right-bar-label {
                        width: 100px;
                        height: 40px;
                        line-height: 40px;
                        margin-left: 20px;
                    }

                    .-right-bar-search {
                        width: 200px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        margin-right: 30px;
                    }
                }

                .-right-content-book {
                    /*max-height: 500px;*/
                    overflow-y: scroll;
                    display: flex;
                    flex-direction: row;
                    align-content: flex-start;
                    flex-wrap: wrap;
                    /*margin-left: 10px;*/
                    /*margin-top: 10px;*/
                    /*margin-bottom: 10px;*/
                    background-color: #ffffff;
                    /*box-shadow: 0 0 4px #FFA400;*/
                    .empty-img {
                        /*height: 100%;*/
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 100px;
                    }

                    .-book-item {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 20px;
                        margin-left: 30px;
                        min-height: 260px;
                        width: 180px;

                        .-book-title {
                            text-align: center;
                            line-height: 20px;
                            margin-top: 20px;
                            margin-bottom: 20px;
                            color: #000000;
                            /*font-family: '苹方';*/
                            /*font-weight: bold;*/
                            font-size: 14px;
                            min-height: 25px;
                            width: 140px;

                        }

                        .-book-pic {
                            position: relative;
                            cursor: pointer;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            width: 186px;
                            border: 3px solid #ffffff;
                            box-shadow: 0 0 2px #999999;
                            transition: all 0.5s linear 0s;

                            .info {
                                position: absolute;
                                bottom: 40px;
                                left: 0;
                                /*float: left;*/
                                height: 70px;
                                width: 20px;
                                background-color: #ffffff;
                                opacity: 0.8;
                                border-radius: 0 2px 2px 0;
                                transition: width 0.3s;
                                -webkit-transition: width 0.3s;

                                &:hover {
                                    width: 180px;
                                }
                            }

                            &:hover {
                                border: 3px solid #2F89DF;
                            }

                        }
                    }
                }
            }
        }

        .ant-input:focus {
            background-color: #0F4DA8;
        }

        .ant-card-grid {
            padding: 0;
        }

        .anticon {
            line-height: 45px;
        }

        .ant-btn-primary {
            background-color: #0F4DA8;
            border-color: #0F4DA8;
        }

        /*拟态*/
        .container {
            width: 700px;
            height: 600px;
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            align-items: center;
        }

        .container .box {
            display: flex;
            justify-content: space-around;
            flex-direction: column;
            align-items: center;
            align-content: center;
            width: 180px;
            height: 40px;
            margin: 20px;
        }

        .container .box .img {
            color: #0F4DA8;
            width: 180px;
            height: 40px;
            box-shadow: 18px 18px 30px rgba(0, 0, 0, 0.1),
            -18px -18px 30px rgba(255, 255, 255, 1);
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #efeeee;
            transition: box-shadow .2s ease-out;
            position: relative;
        }

        .container .box .img img {
            width: 60px;
            transition: width 0.2s ease-out;
        }

        .container .box p {
            color: slategrey;
        }

        .container .box .img:active {
            box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.2),
            0px 0px 0px rgba(255, 255, 255, 0.8),
            inset 18px 18px 30px rgba(0, 0, 0, 0.1),
            inset -18px -18px 30px rgba(255, 255, 255, 1);
            transition: box-shadow .2s ease-out;
        }

        .container .box .img:active img {
            width: 58px;
            transition: width 0.2s ease-out;
        }
    }

</style>
