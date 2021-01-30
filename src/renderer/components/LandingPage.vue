<template>
    <div class="page">
        <div class="header">
            <div class="title">ClassReader💯❗</div>
            <div class="titleBuC" @click="closeWindow()">❌️️</div>
            <div v-show="!isMaxWindow" class="titleBu" @click="maxWindow()">⚪</div>
            <div v-show="isMaxWindow" class="titleBu" @click="maxWindow()">❐</div>
            <div class="titleBu" @click="minWindow()">➖</div>
        </div>
        <wired-divider elevation="1" :style="'width:'+(pageWidth)+'px'" ></wired-divider>
        <div class="content">
            <div class="-left-content">
                <div class="bottomNav">
                    <div class="bottomDiv" v-if="hexArray.length === 0">
                        <wired-button class="wired-button" elevation="3" v-on:click="upload()">📫 file</wired-button>
                    </div>
                    <div class="bottomDiv" v-else>
                        <wired-button class="wired-button" elevation="3" v-on:click="upload()">📭 file</wired-button>
                    </div>
                </div>
                <div class="classFile" v-if="hexArray.length !== 0 && !isNotClass">
                    <span v-show="!isLoad" class="add" @click="open()">📎classFile  <span>🙈</span></span>
                    <span v-show="isLoad" class="add" @click="open()">🧷classFile  <span>🙉</span></span>
                    <tree-menu :classFile="classFile" :isLoad="isLoad"></tree-menu>
                </div>
                <div class="bookArea">
                </div>
            </div>
            <div class="-right-content">
                <div class="-right-bar" v-if="hexArray.length !== 0">
                    <wired-item selected>Class file</wired-item>
                    <wired-item >Report</wired-item>
<!--                    🍇🍈🍉🍊🍋🍌🍍🥭🍎🍏🍐🍑🍒🍓🥑🍆🥔🥕🌽🌶️🥒🥬🥦🧄🧅🍄🥜-->
                </div>
                <div class="-right-content-book" :style="'height:'+(pageHeight-90)+'px'">
                    <wired-card v-if="ascArray.length !== 0" elevation="2" style="margin-right: 10px">
                        <div class="left-line">
                            <div v-for="count in indexArray" class="single">
                                {{count}}H
                            </div>
                        </div>
                    </wired-card>
                    <wired-card v-if="hexArray.length !== 0" elevation="2" style="margin-right: 10px">
                        <div class="row-line">
                            <div v-for="(hex,index) in hexArray" class="single">
                                <div :class="{red:(index< chooseEnd && index>=chooseStart)}">{{hex.toUpperCase()}}</div>
                            </div>
                        </div>
                    </wired-card>
                    <wired-card v-if="ascArray.length !== 0" elevation="2">
                        <div class="right-line">
                            <div v-for="(hex,index) in ascArray" class="single">
                                <div :class="{red:(index<chooseEnd && index>=chooseStart)}">{{hex}}</div>
                            </div>
                        </div>
                    </wired-card>
                </div>
            </div>
        </div>
        <wired-dialog :open="isDialog">
            <div class="dialogDiv"><span class="dialogTitleBuC" v-on:click="closeDialog()">❌️</span><br/><br/>
            <span class="dialogText">{{dialogText}}</span></div>
        </wired-dialog>
    </div>
</template>

<script>
    import TreeMenu from './LandingPage/TreeMenu'
    import {getBinaryInfo} from "./util/operFile";
    import "wired-button";
    import "wired-divider";
    import "wired-card";
    import "wired-item";
    import "wired-dialog";
    import PubSub from 'pubsub-js';

    const {dialog} = require('electron').remote;
    const remote = require('electron').remote;
    export default {
        name: 'landing-page',
        components: {TreeMenu},
        data() {
            return {
                //16进制数组
                hexArray: [],
                //asc数组
                ascArray: [],
                //索引数组
                indexArray: [],
                isDialog:false,
                pageHeight: window.innerHeight,
                pageWidth: window.innerWidth,
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
                    interfaces: [],//接口表
                    fields_count: {},//字段计数器
                    fields: [],//字段表
                    methods_count: {},//方法计数器
                    methods: [],//方法表
                    attribute_count: {},//属性表计数器
                    attributes: []//属性表
                },
                readIndex: 0,//解析时读取的指针
                chooseStart: 0,//鼠标选中的开始索引
                chooseEnd: 0,//鼠标选中的结束
                chooseIndex: -1,//选中属性的index
                isMaxWindow: false,
                isLoad: false,
                dialogText:"",
                isNotClass:false,
            }
        },
        mounted() {
            let self = this
            //监视页面大小变化
            remote.getCurrentWindow().on('resize', (a) => {
                self.pageHeight = window.innerHeight;
                self.pageWidth = window.innerWidth;
            })
            //监视页面最大化
            remote.getCurrentWindow().on('maximize', function () {
                self.isMaxWindow = true;
            })
            //监视页面最大化
            remote.getCurrentWindow().on('unmaximize', function () {
                self.isMaxWindow = false;
            })
            PubSub.subscribe("chooseItem", (event, val) => {
                this.chooseItem(val)
            })
        },
        methods: {
            open() {
                this.isLoad = !this.isLoad
            },
            closeDialog() {
                this.isDialog = !this.isDialog
            },
            // 窗口最小化
            minWindow() {
                remote.getCurrentWindow().minimize();
            },
            // 窗口最大化
            maxWindow() {
                const mainWindow = remote.getCurrentWindow();
                if (mainWindow.isMaximized()) {
                    mainWindow.restore();
                } else {
                    mainWindow.maximize();
                }
            },
            // 关闭窗口
            closeWindow() {
                const browserWindow = remote.getCurrentWindow();
                browserWindow.close();
            },
            //获取文件
            upload() {
                let self = this;
                dialog.showOpenDialog(
                    {
                        title: "class文件", filters: [{name: 'class', extensions: ['class', 'CLASS']}]
                    }, (filePath) => {
                        if (filePath) {
                            self.blanking()
                            getBinaryInfo(filePath[0], (buf) => {
                                var offset = 0;
                                while (offset < buf.length) {
                                    let s = buf[offset].toString(16);
                                    if (s.length === 1) {
                                        s = "0" + s;
                                    }
                                    self.hexArray.push(s);
                                    if (buf[offset] <= 126 && buf[offset] > 32) {
                                        self.ascArray.push(String.fromCharCode(buf[offset]));
                                    } else {
                                        self.ascArray.push(".");
                                    }
                                    if (offset % 16 === 0) {
                                        self.indexArray.push(self.padding(offset));
                                    }
                                    offset++;
                                }
                                console.log(self.hexArray)
                                if (self.hexArray[0] !== 'ca' || self.hexArray[1] !== 'fe' || self.hexArray[2] !== 'ba' || self.hexArray[3] !== 'be') {
                                    self.dialogText = "不是class文件";
                                    self.isDialog = true;
                                    self.isNotClass = true;
                                }
                                self.buildTree();
                                console.log(self.indexArray)
                            })
                        }
                    })
            },

            padding(num) {
                let length = 8;
                let num16 = num.toString(16);
                for(let len = num16.length; len < length; len = num16.length) {
                    num16 = "0" + num16;
                }
                return num16;
            },
            //置空数据
            blanking() {
                //16进制数组
                this.hexArray = []
                //asc数组
                this.ascArray = []
                this.pageHeight = window.innerHeight
                this.indexArray= [],
                this.classFile = {
                    magic: {},//魔数
                    minor_version: {},//次版本号
                    major_version: {},//主版本号
                    constant_pool_count: {},//常量池个数
                    constant_pool: [],//常量池
                    access_flags: {},//类访问标志
                    this_class: {},//类索引
                    super_class: {},//父类索引
                    interfaces_count: {},//接口计数器
                    interfaces: [],//接口表
                    fields_count: {},//字段计数器
                    fields: [],//字段表
                    methods_count: {},//方法计数器
                    methods: [],//方法表
                    attribute_count: {},//属性表计数器
                    attributes: []//属性表
                }
                this.readIndex = 0//解析时读取的指针
                this.chooseStart = 0//鼠标选中的开始索引
                this.chooseEnd = 0//鼠标选中的结束
                this.chooseIndex = -1//选中属性的index
                this.isMaxWindow = false
                this.isLoad = false
                this.isNotClass = false;
            },
            //选中一个元素
            chooseItem(val) {
                this.chooseStart = val.startIndex;
                this.chooseEnd = val.endIndex;
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
                this.getFields();
                this.getMethodsCount();
                this.getMethodInfo();
                this.getAttributeCount();
                this.getAttributes();
                this.isLoad = true;
            },
            //读取魔数
            getMagic() {
                this.classFile.magic = this.getUFields(4, "魔数")
            },
            //读取次版本号
            getMinorVersion() {
                this.classFile.minor_version = this.getUFields(2, "副版本号")
                this.classFile.minor_version.attrStr = ": " + this.classFile.minor_version.value
            },
            //读取主版本号
            getMajorVersion() {
                this.classFile.major_version = this.getUFields(2, "主版本号")
                this.classFile.major_version.attrStr = ": " + this.classFile.major_version.value
            },
            //读取常量池个数
            getConstantPoolCount() {
                this.classFile.constant_pool_count = this.getUFields(2, "常量池计数器")
                this.classFile.constant_pool_count.attrStr = ": " + this.classFile.constant_pool_count.value
            },
            //读取常量池
            getConstantPool() {
                this.classFile.constant_pool = this.getConstantPoolAttr(this.classFile.constant_pool_count.value)
            },
            //读取类访问标志
            getAccessFlags() {
                this.classFile.access_flags = this.getUFields(2, "类访问标志")
                let flags = [0x0001, 0x0010, 0x0020, 0x0200, 0x0400, 0x1000, 0x2000, 0x4000];
                //添加标志类型
                this.classFile.access_flags["sign"] = []
                this.classFile.access_flags.attrStr = ":"
                for (const key in flags) {
                    let arg = flags[key]
                    //标志的值如果与class文件中值的与运算还等于本身的话，说明包含此标志，一个类可以有多个标志
                    if ((arg & parseInt(this.classFile.access_flags.hexArray.join(""), 16)) === arg) {
                        switch (arg) {
                            case 0x0001:
                                this.classFile.access_flags["sign"].push("ACC_PUBLIC");
                                this.classFile.access_flags.attrStr += " " + "public"
                                break;
                            case 0x0010:
                                this.classFile.access_flags["sign"].push("ACC_FINAL");
                                this.classFile.access_flags.attrStr += " " + "final"
                                break;
                            case 0x0020:
                                this.classFile.access_flags["sign"].push("ACC_SUPER");
                                this.classFile.access_flags.attrStr += " " + "super"
                                break;
                            case 0x0200:
                                this.classFile.access_flags["sign"].push("ACC_INTERFACE");
                                this.classFile.access_flags.attrStr += " " + "interface"
                                break;
                            case 0x0400:
                                this.classFile.access_flags["sign"].push("ACC_ABSTRACT");
                                this.classFile.access_flags.attrStr += " " + "abstract"
                                break;
                            case 0x1000:
                                this.classFile.access_flags["sign"].push("ACC_SYNTHETIC");
                                this.classFile.access_flags.attrStr += " " + "synthetic"
                                break;
                            case 0x2000:
                                this.classFile.access_flags["sign"].push("ACC_ANNOTATION");
                                this.classFile.access_flags.attrStr += " " + "annotation"
                                break;
                            case 0x4000:
                                this.classFile.access_flags["sign"].push("ACC_ENUM");
                                this.classFile.access_flags.attrStr += " " + "enum"
                                break;
                        }
                    }
                }
            },
            //读取类索引
            getThisClass() {
                this.classFile.this_class = this.getUFields(2, "类索引")
                this.classFile.this_class["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(this.classFile.this_class.value));
                this.classFile.this_class["attrStr"] = ": " + this.classFile.this_class["link_value"];
            },
            //读取父类索引
            getSuperClass() {
                this.classFile.super_class = this.getUFields(2, "父类索引")
                if (this.classFile.super_class.value !== 0) {
                    this.classFile.super_class["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(this.classFile.super_class.value));
                    this.classFile.super_class["attrStr"] = ": " + this.classFile.super_class["link_value"];
                }
            },
            //读取接口计数器
            getInterfacesCount() {
                this.classFile.interfaces_count = this.getUFields(2, "接口计数器")
                this.classFile.interfaces_count["attrStr"] = ": " + this.classFile.interfaces_count.value;
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
                this.classFile.fields_count["attrStr"] = ": " + this.classFile.fields_count.value;
            },
            //读取字段表
            getFields() {
                let startIndex = this.readIndex;
                if (this.classFile.fields_count.value > 0) {
                    for (let i = 0; i < this.classFile.fields_count.value; i++) {
                        this.classFile.fields.push(this.getField());
                    }
                }
                let endIndex = this.readIndex;
                this.classFile.fields["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
            },
            //读取方法表计数器
            getMethodsCount() {
                this.classFile.methods_count = this.getUFields(2, "方法计数器")
                this.classFile.methods_count["attrStr"] = ": " + this.classFile.methods_count.value;
            },
            //读取方法表
            getMethodInfo() {
                let startIndex = this.readIndex;
                if (this.classFile.methods_count.value > 0) {
                    for (let i = 0; i < this.classFile.methods_count.value; i++) {
                        this.classFile.methods.push(this.getMethod());
                    }
                }
                let endIndex = this.readIndex;
                this.classFile.methods["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
            },
            //读取属性表计数器
            getAttributeCount() {
                this.classFile.attribute_count = this.getUFields(2, "属性表计数器")
                this.classFile.attribute_count["attrStr"] = ":" + this.classFile.attribute_count.value;
            },
            //读取属性表
            getAttributes() {
                let startIndex = this.readIndex;
                if (this.classFile.attribute_count.value > 0) {
                    for (let i = 0; i < this.classFile.attribute_count.value; i++) {
                        this.classFile.attributes.push(this.getAttribute());
                    }
                }
                let endIndex = this.readIndex;
                this.classFile.attributes["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
            },
            //读取一个方法
            getMethod() {
                let field = {
                    access_flags: {},
                    name_index: {},
                    descriptor_index: {},
                    attributes_count: {},
                    attribute_info: [],
                    attr: {
                        startIndex: this.readIndex
                    },
                    attrStr: "",
                }
                //TODO 方法访问标志
                field.access_flags = this.getUFields(2, "标志");
                field.name_index = this.getUFields(2, "字段名");
                field.descriptor_index = this.getUFields(2, "字段描述符");
                field.attributes_count = this.getUFields(2, "附加属性数量");
                let startIndex = this.readIndex;
                for (let i = 0; i < field.attributes_count.value; i++) {
                    field.attribute_info.push(this.getAttribute());
                }
                let endIndex = this.readIndex;
                field.attribute_info["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                field.attr["endIndex"] = this.readIndex;
                field.attrStr = ":" + this.classFile.constant_pool[field.name_index.value - 1].link_value
                return field;
            },
            //读取一个字段
            getField() {
                let field = {
                    access_flags: {},
                    name_index: {},
                    descriptor_index: {},
                    attributes_count: {},
                    attribute_info: [],
                    attr: {
                        startIndex: this.readIndex
                    }
                }
                //TODO 字段访问标志
                field.access_flags = this.getUFields(2, "标志");
                field.name_index = this.getUFields(2, "字段名");
                field.descriptor_index = this.getUFields(2, "字段描述符");
                field.attributes_count = this.getUFields(2, "附加属性数量");
                let startIndex = this.readIndex;
                for (let i = 0; i < field.attributes_count.value; i++) {
                    field.attribute_info.push(this.getAttribute());
                }
                let endIndex = this.readIndex;
                field.attribute_info["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                field.attr["endIndex"] = this.readIndex;
                return field;
            },
            //获取一个属性
            getAttribute() {
                let attr = {
                    attribute_name_index: {},
                    attribute_length: {},
                    attr: {
                        startIndex: this.readIndex
                    }
                };
                attr.attribute_name_index = this.getUFields(2, "属性名");
                attr["link_value"] = this.hexCharCodeToStr(this.classFile.constant_pool[attr.attribute_name_index.value - 1].bytes.hexArray.join(""));
                attr.attribute_length = this.getUFields(4, "当前属性长度");
                let lastAttr = {}
                //属性表
                switch (attr.link_value) {
                    case "ConstantValue":
                        lastAttr = this.getAttrConstantValue();
                        attr.attrStr = ":ConstantValue";
                        break;
                    case "Code":
                        lastAttr = this.getAttrCode();
                        attr.attrStr = ":Code";
                        break;
                    case "Exceptions":
                        lastAttr = this.getAttrExceptions();
                        attr.attrStr = ":Exceptions";
                        break;
                    case "LineNumberTable":
                        lastAttr = this.getAttrLineNumberTable();
                        attr.attrStr = ":LineNumberTable";
                        break;
                    case "InnerClasses":
                        lastAttr = this.getAttrInnerClasses();
                        attr.attrStr = ":InnerClasses";
                        break;
                    case "Deprecated"://只有有或者没有的区别
                        attr.attrStr = ":Deprecated";
                        break;
                    case "Synthetic"://只有有或者没有的区别
                        attr.attrStr = ":Synthetic";
                        break;
                    case "EnclosingMethod":
                        lastAttr = this.getAttrEnclosingMethod();
                        attr.attrStr = ":EnclosingMethod";
                        break;
                    case "Signature":
                        lastAttr = this.getAttrSignature();
                        attr.attrStr = ":Signature";
                        break;
                    case "SourceFile":
                        lastAttr = this.getAttrSourceFile();
                        attr.attrStr = ":SourceFile";
                        break;
                    case "LocalVariableTable":
                        lastAttr = this.getAttrLocalVariableTable();
                        attr.attrStr = ":LocalVariableTable";
                        break;
                    case "LocalVariableTypeTable":
                        lastAttr = this.getAttrLocalVariableTypeTable();
                        attr.attrStr = ":LocalVariableTypeTable";
                        break;
                    case "RuntimeVisibleAnnotations":
                        lastAttr = this.getAttrRuntimeVisibleAnnotations();
                        attr.attrStr = ":RuntimeVisibleAnnotations";
                        break;
                    case "RuntimeVisibleParameterAnnotations":
                        lastAttr = this.getAttrRuntimeVisibleParameterAnnotations();
                        attr.attrStr = ":RuntimeVisibleParameterAnnotations";
                        break;
                    default:
                        //遇到不认识的属性，直接跳过
                        this.readIndex += attr.attribute_length.value;
                }
                for (let i in lastAttr) {
                    attr[i] = lastAttr[i];
                }
                attr.attr["endIndex"] = this.readIndex
                return attr;
            },
            //获取Code属性
            getAttrCode() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    max_stack: this.getUFields(2, "方法执行的最大深度"),
                    max_locals: this.getUFields(2, "局部变量个数"),
                    code_length: this.getUFields(4, "code数组字节数"),
                    code: [],//指令
                    exception_table_length: {},
                    exception_table: [],
                    attributes_count: {},
                    attributes: [],
                };
                let startIndex = this.readIndex;
                for (let i = 0; i < attr.code_length.value; i++) {
                    //TODO 指令
                    attr.code.push(this.getUFields(1, "指令"))
                }
                let endIndex = this.readIndex;
                attr.code["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                attr.exception_table_length = this.getUFields(2, "exception_table个数");
                startIndex = this.readIndex;
                for (let i = 0; i < attr.exception_table_length.value; i++) {
                    let table = {
                        start_pc: this.getUFields(2, "有效范围"),
                        end_pc: this.getUFields(2, "有效范围"),
                        handle_pc: this.getUFields(2, "异常处理起点"),
                        //TODO class
                        catch_type: this.getUFields(2, "异常类")
                    }
                    attr.exception_table.push(table)
                }
                endIndex = this.readIndex;
                attr.exception_table["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };

                attr.attributes_count = this.getUFields(2, "attributes个数");
                startIndex = this.readIndex;
                for (let i = 0; i < attr.attributes_count.value; i++) {
                    attr.attributes.push(this.getAttribute())
                }
                endIndex = this.readIndex;
                attr.attributes["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                attr.attr["endIndex"] = this.readIndex;
                return attr;
            },
            //获取RuntimeVisibleParameterAnnotations属性
            getAttrRuntimeVisibleParameterAnnotations() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    num_parameters: this.getUFields(2, "形参注解数量"),
                    parameter_annotations: [],
                };
                let startIndex = this.readIndex;
                for (let i = 0; i < attr.num_parameters.value; i++) {
                    let parameter = {
                        num_annotations: this.getUFields(2, "可见注解数量"),
                        annotations: []
                    }
                    let startIndex = this.readIndex;
                    for (let i = 0; i < attr.num_parameters.value; i++) {
                        parameter.annotations.push(this.getAnnotation())
                    }
                    let endIndex = this.readIndex;
                    parameter.annotations["attr"] = {
                        startIndex: startIndex,
                        endIndex: endIndex,
                    };
                    attr.parameter_annotations.push(parameter);
                }
                let endIndex = this.readIndex;
                attr.parameter_annotations["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                attr.attr["endIndex"] = this.readIndex;
                return attr;
            },
            //获取RuntimeVisibleAnnotations属性
            getAttrRuntimeVisibleAnnotations() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    num_annotations: this.getUFields(2, "注解数量"),
                    annotations: [],

                };
                let startIndex = this.readIndex;
                for (let i = 0; i < attr.num_annotations.value; i++) {
                    attr.annotations.push(this.getAnnotation());
                }
                let endIndex = this.readIndex;
                attr.annotations["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                attr.attr["endIndex"] = this.readIndex;
                return attr;
            },
            //获取annotation对象
            getAnnotation() {
                let annotation = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    //TODO utf8索引
                    type_index: this.getUFields(2, "索引"),
                    num_element_value_pairs: this.getUFields(2, "注解键值对个数"),
                    element_value_pairs: [],

                }
                let startIndex = this.readIndex;
                for (let i = 0; i < annotation.num_element_value_pairs.value; i++) {
                    let element = {
                        attr: {
                            startIndex: this.readIndex
                        },
                        element_name_index: this.getUFields(2, "索引"),
                        element_value: this.getElementValue()
                    }
                    element.attr["endIndex"] = this.readIndex;
                    annotation.element_value_pairs.push(element)
                }
                let endIndex = this.readIndex;
                annotation.element_value_pairs["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                annotation.attr["endIndex"] = this.readIndex;
                return annotation;
            },
            //获取elementValue字段
            getElementValue() {
                let element_value = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    tag: this.getUFields(1, "值类型"),
                }
                switch (String.fromCharCode(element_value.tag.value)) {
                    case "B":
                        element_value["const_value_index"] = this.getUFields(2, "byte类型");
                        break;
                    case "C":
                        element_value["const_value_index"] = this.getUFields(2, "char类型");
                        break;
                    case "D":
                        element_value["const_value_index"] = this.getUFields(2, "double类型");
                        break;
                    case "F":
                        element_value["const_value_index"] = this.getUFields(2, "float类型");
                        break;
                    case "I":
                        element_value["const_value_index"] = this.getUFields(2, "int类型");
                        break;
                    case "J":
                        element_value["const_value_index"] = this.getUFields(2, "long类型");
                        break;
                    case "S":
                        element_value["const_value_index"] = this.getUFields(2, "short类型");
                        break;
                    case "Z":
                        element_value["const_value_index"] = this.getUFields(2, "boolean类型");
                        break;
                    case "s":
                        element_value["const_value_index"] = this.getUFields(2, "String类型");
                        break;
                    case "e":
                        element_value["enum_const_value"] = {
                            type_name_index: this.getUFields(2, "枚举常量类型的二进制名称的内部形式"),
                            const_name_index: this.getUFields(2, "简单名称"),
                        }
                        break;
                    case "c":
                        element_value["class_info_index"] = this.getUFields(2, "Class类型");
                        break;
                    case "@":
                        element_value["annotation_value"] = this.getAnnotation();
                        break;
                    case "[":
                        element_value["array_value"] = {
                            num_values: this.getUFields(2, "数组个数"),
                            values: []
                        }
                        let startIndex = this.readIndex;
                        for (let i = 0; i < element_value.array_value.num_values.value; i++) {
                            element_value.array_value.values.push(this.getElementValue())
                        }
                        let endIndex = this.readIndex;
                        element_value.array_value.values["attr"] = {
                            startIndex: startIndex,
                            endIndex: endIndex,
                        };
                        break;
                }
                element_value.attr["endIndex"] = this.readIndex;
                return element_value;
            },
            //获取LocalVariableTypeTable属性
            getAttrLocalVariableTypeTable() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    local_variable_type_table_length: this.getUFields(2, "成员数量"),
                    local_variable_type_table: [],

                };

                let startIndex = this.readIndex;
                for (let i = 0; i < attr.local_variable_type_table_length.value; i++) {
                    let table = {
                        attr: {
                            startIndex: this.readIndex
                        },
                        start_pc: this.getUFields(2, "索引"),
                        length: this.getUFields(2, "索引"),
                        //TODO utf8索引
                        name_index: this.getUFields(2, "局部变量"),
                        //TODO utf8索引
                        signature_index: this.getUFields(2, "局部变量字段描述符"),
                        index: this.getUFields(2, "局部变量表中的索引"),
                    }
                    table.attr["endIndex"] = this.readIndex;
                    attr.local_variable_type_table.push(table);
                }
                let endIndex = this.readIndex;
                attr.local_variable_type_table["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                attr.attr["endIndex"] = this.readIndex;
                return attr;
            },
            //获取LocalVariableTable属性
            getAttrLocalVariableTable() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    local_variable_table_length: this.getUFields(2, "成员数量"),
                    local_variable_table: []
                };

                let startIndex = this.readIndex;
                for (let i = 0; i < attr.local_variable_table_length.value; i++) {
                    let table = {
                        start_pc: this.getUFields(2, "索引"),
                        length: this.getUFields(2, "索引"),
                        //TODO utf8索引
                        name_index: this.getUFields(2, "局部变量"),
                        //TODO utf8索引
                        descriptor_index: this.getUFields(2, "局部变量字段描述符"),
                        index: this.getUFields(2, "局部变量表中的索引"),
                    }
                    attr.local_variable_table.push(table);
                }
                let endIndex = this.readIndex;
                attr.local_variable_table["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                return attr;
            },
            //获取SourceFile属性
            getAttrSourceFile() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    //TODO utf8索引
                    sourcefile_index: this.getUFields(2, "源文件名")
                };
                attr.attr["endIndex"] = this.readIndex;
                attr.sourcefile_index["link_value"] = this.hexCharCodeToStr(this.classFile.constant_pool[attr.sourcefile_index.value - 1].bytes.hexArray.join(""));
                return attr;
            },
            //获取Signature属性 泛型签名信息
            getAttrSignature() {
                return {
                    //TODO utf8索引
                    signature_index: this.getUFields(2, "签名"),
                };
            },
            //获取EnclosingMethod属性 局部类或匿名类才有
            getAttrEnclosingMethod() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    class_index: this.getUFields(2, "内层类"),
                    //TODO nameAndType结构
                    method_index: this.getUFields(2, "对应的方法名和方法类型")
                };
                attr.attr["endIndex"] = this.readIndex;
                attr.class_index["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(this.classFile.class_index.value))
                return attr;
            },
            //获取InnerClasses属性
            getAttrInnerClasses() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    number_of_classes: {},
                    classes: []
                };

                attr.number_of_classes = this.getUFields(2, "成员数量");

                let startIndex = this.readIndex;
                for (let i = 0; i < attr.number_of_classes.value; i++) {
                    let clazz = {
                        attr: {
                            startIndex: this.readIndex
                        },
                        inner_class_info_index: this.getUFields(2, "内部类符号引用"),
                        outer_class_info_index: this.getUFields(2, "宿主类符号引用"),
                        inner_name_index: this.getUFields(2, "内部类名称"),
                        //TODO 类访问标志
                        inner_class_access_flags: this.getUFields(2, "内部类访问标志"),
                    }
                    clazz.attr["endIndex"] = this.readIndex;
                    clazz.inner_class_info_index["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(clazz.inner_class_info_index.value));
                    clazz.outer_class_info_index["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(clazz.outer_class_info_index.value));
                    attr.classes.push(clazz);
                }
                let endIndex = this.readIndex;
                attr.classes["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                attr.attr["endIndex"] = this.readIndex;
                return attr;
            },
            //获取LineNumberTable属性
            getAttrLineNumberTable() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    line_number_table_length: {},
                    line_number_table: []
                };
                attr.line_number_table_length = this.getUFields(2, "成员数量");

                let startIndex = this.readIndex;
                for (let i = 0; i < attr.line_number_table_length.value; i++) {
                    let line_number_info = {
                        attr: {
                            startIndex: this.readIndex
                        },
                        start_pc: this.getUFields(2, "字节码行号"),
                        line_number: this.getUFields(2, "java源码行号")
                    }
                    line_number_info.attr["endIndex"] = this.readIndex;
                    attr.line_number_table.push(line_number_info)
                }
                let endIndex = this.readIndex;
                attr.line_number_table["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                attr.attr["endIndex"] = this.readIndex;
                return attr;
            },
            //获取Exceptions属性
            getAttrExceptions() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    number_of_exceptions: {},
                    exception_index_table: []
                };
                attr.number_of_exceptions = this.getUFields(2, "成员数量");

                let startIndex = this.readIndex;
                for (let i = 0; i < attr.number_of_exceptions.value; i++) {
                    let exception = this.getUFields(2, "异常类类型");
                    exception["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(exception.value));
                    attr.exception_index_table.push(exception)
                }
                let endIndex = this.readIndex;
                attr.exception_index_table["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                attr.attr["endIndex"] = this.readIndex;
                return attr;
            },
            //获取ConstantValue属性
            getAttrConstantValue() {
                let attr = {
                    attr: {
                        startIndex: this.readIndex
                    },
                    constantValue_index: {},
                };
                attr.constantValue_index = this.getUFields(2, "项类型");
                attr.attr["endIndex"] = this.readIndex;
                return attr;
            },
            //读取接口表的属性
            //num : 接口表个数
            getInterfacesAttr(num) {
                let interfaceAttr = [];
                let startIndex = this.readIndex;
                for (let i = 0; i < num; i++) {
                    let addr = this.getUFields(2, "接口表");
                    addr["link_value"] = this.hexCharCodeToStr(this.getConstantClassStr(addr.value));
                    addr["attrStr"] = ": " + addr.link_value;
                    interfaceAttr.push(addr)
                }
                let endIndex = this.readIndex;
                interfaceAttr["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                return interfaceAttr;
            },
            //获取常量池的属性
            //num : 常量池个数
            getConstantPoolAttr(num) {
                let constantPool = [];
                let startIndex = this.readIndex;
                for (let i = 1; i <= num - 1; i++) {
                    let attr = {
                        attr: {
                            startIndex: this.readIndex
                        }
                    };
                    //获取tag值
                    let tag = this.getUFields(1, "值")
                    tag.attrStr = ":"+tag.value
                    attr["tag"] = tag;
                    switch (tag.value) {
                        case 1:
                            attr["attrStr"] = ":CONSTANT_utf8"
                            let length = this.getUFields(2, "长度")
                            attr["length"] = length;
                            attr.length.attrStr = ":"+attr.length.value
                            //获取内容
                            attr["bytes"] = this.getStr(length.value, "字符串")
                            attr['link_value'] = this.hexCharCodeToStr(attr.bytes.hexArray.join(""))
                            attr.bytes.attrStr = ":"+attr.link_value
                            break;
                        case 3:
                            attr["attrStr"] = ":CONSTANT_Integer"
                            attr["bytes"] = this.getUFields(4, "整型")
                            attr.attrStr = ":"+attr.bytes.value
                            break;
                        case 4:
                            attr["attrStr"] = ":CONSTANT_Float"
                            attr["bytes"] = this.getUFields(4, "浮点型")
                            break;
                        case 5:
                            attr["attrStr"] = ":CONSTANT_Long"
                            attr["high_bytes"] = this.getUFields(4, "长整型")
                            attr.high_bytes.attrStr = ":"+attr.high_bytes.value
                            attr["low_bytes"] = this.getUFields(4, "长整型")
                            attr.low_bytes.attrStr = ":"+attr.low_bytes.value
                            break;
                        case 6:
                            attr["attrStr"] = ":CONSTANT_Double"
                            attr["high_bytes"] = this.getUFields(4, "双精度浮点型")
                            attr["low_bytes"] = this.getUFields(4, "双精度浮点型")
                            break;
                        case 7:
                            attr["attrStr"] = ":CONSTANT_Class"
                            //对常量池的一个有效索引
                            attr["name_index"] = this.getUFields(2, "类或接口的符号引用")
                            attr.name_index.attrStr = ":"+attr.name_index.value;
                            break;
                        case 8:
                            attr["attrStr"] = ":CONSTANT_String"
                            attr["string_index"] = this.getUFields(2, "字符串类型字面量")
                            attr.string_index.attrStr = ":"+attr.string_index.value;
                            break;
                        case 9:
                            attr["attrStr"] = ":CONSTANT_Fieldref"
                            attr["class_index"] = this.getUFields(2, "字段的符号引用")
                            attr.class_index.attrStr = ":"+attr.class_index.value;
                            attr["name_and_type_index"] = this.getUFields(2, "字段的名称和描述符")
                            attr.name_and_type_index.attrStr = ":"+attr.name_and_type_index.value;
                            break;
                        case 10:
                            attr["attrStr"] = ":CONSTANT_Methodref"
                            attr["class_index"] = this.getUFields(2, "类中方法的符号引用")
                            attr.class_index.attrStr = ":"+attr.class_index.value;
                            attr["name_and_type_index"] = this.getUFields(2, "类中方法的名称和描述符")
                            attr.name_and_type_index.attrStr = ":"+attr.name_and_type_index.value;
                            break;
                        case 11:
                            attr["attrStr"] = ":CONSTANT_InterfaceMethodref"
                            attr["class_index"] = this.getUFields(2, "接口中方法的符号引用")
                            attr.class_index.attrStr = ":"+attr.class_index.value;
                            attr["name_and_type_index"] = this.getUFields(2, "接口中方法的名称和描述符")
                            attr.name_and_type_index.attrStr = ":"+attr.name_and_type_index.value;
                            break;
                        case 12:
                            attr["attrStr"] = ":CONSTANT_NameAndType"
                            attr["name_index"] = this.getUFields(2, "方法或字段的部分符号引用")
                            attr.name_index.attrStr = ":"+attr.name_index.value;
                            attr["descriptor_index"] = this.getUFields(2, "有效的字段描述符或者方法描述符")
                            attr.descriptor_index.attrStr = ":"+attr.descriptor_index.value;
                            break;
                        case 15:
                            attr["attrStr"] = ":CONSTANT_MethodHandle"
                            attr["reference_kind"] = this.getUFields(1, "句柄类型")
                            attr["reference_index"] = this.getUFields(2, "句柄名称")
                            attr.reference_index.attrStr = ":"+attr.reference_index.value;
                            break;
                        case 16:
                            attr["attrStr"] = ":CONSTANT_MethodType"
                            attr["descriptor_index"] = this.getUFields(1, "方法的描述符")
                            attr.descriptor_index.attrStr = ":"+attr.descriptor_index.value;
                            break;
                        case 18:
                            attr["attrStr"] = ":CONSTANT_InvokeDynamic"
                            attr["bootstrap_method_attr_index"] = this.getUFields(2, "引导方法表的索引")
                             attr.bootstrap_method_attr_index.attrStr = ":"+attr.bootstrap_method_attr_index.value;
                            attr["name_and_type_index"] = this.getUFields(2, "方法名和方法描述符")
                             attr.name_and_type_index.attrStr = ":"+attr.name_and_type_index.value;
                            break;
                    }
                    attr.attr["endIndex"] = this.readIndex;
                    constantPool.push(attr);
                    //因为jvm开发时是处于32位机为主流的时代，所以为了向下兼容，double和long类型的常量占两个空间
                    if (tag.value === 5 || tag.value === 6) {
                        constantPool.push({
                            type: "empty",
                        });
                        i++;
                    }
                }
                let endIndex = this.readIndex;
                constantPool["attr"] = {
                    startIndex: startIndex,
                    endIndex: endIndex,
                };
                return constantPool;
            },
            //获取常量池中对应的类名
            //index : 索引
            getConstantClassStr(index) {
                //等于0说明是空的，常量池没有0项元素
                if (index === 1) {
                    return ""
                } else {
                    return this.classFile.constant_pool[this.classFile.constant_pool[index - 1].name_index.value - 1].bytes.hexArray.join("")
                }
            },
            //获取字符串
            getStr(num, typeName) {
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
                    isObject: true,
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
            },
            pad(num, n) {
                var len = num.toString().length;
                while (len < n) {
                    num = "0" + num;
                    len++;
                }
                return num;
            }
        }
    }
</script>

<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;
        /*background-color: #EFEFEF;*/
        /*position: relative;*/
        overflow: hidden;

        .header {
            /*top: 0;*/
            /*position: absolute;*/
            /*display: flex;*/
            /*flex-direction: row;*/
            /*justify-items: center;*/
            width: 100%;
            height: 40px;
            background-color: #ffffff;
            /*margin-top: 10px;*/
            /*background-color: #FFA400;*/
            /*box-shadow: 0 0 4px #999999;*/
            /*z-index: 111;*/
            -webkit-app-region: drag;

            .title {
                /*color: #437DD4;*/
                float: left;
                /*color: #437DD4;*/
                /*color: #6A94D4;*/
                color: #FFA110;
                /*font-family: Calibri, "Times New Roman", serif;*/
                font-family: "Gloria Hallelujah", sans-serif;
                font-size: 20px;
                font-weight: bolder;
                margin-left: 20px;
                width: 200px;
                height: 40px;
                line-height: 48px;
            }

            .titleBu {
                font-family: "Gloria Hallelujah", sans-serif;
                font-size: 20px;
                width: 40px;
                height: 40px;
                float: right;
                text-align: center;
                line-height: 40px;
                cursor: pointer;
                -webkit-app-region: no-drag;

                &:hover {
                    background-color: #999999;
                }
            }

            .titleBuC {
                font-family: "Gloria Hallelujah", sans-serif;
                font-size: 20px;
                width: 40px;
                height: 40px;
                float: right;
                text-align: center;
                line-height: 40px;
                cursor: pointer;
                -webkit-app-region: no-drag;

                &:hover {
                    background-color: red;
                }
            }
        }
        .dialogTitleBuC {
            font-size: 20px;
            width: 30px;
            height: 30px;
            float: right;
            text-align: center;
            line-height: 30px;
            cursor: pointer;
            &:hover {
                background-color: red;
            }
        }
        .dialogDiv{
            width: 200px;
            height: 100px;
            text-align:center
        }
        .dialogText{
            font-family: "Gloria Hallelujah", sans-serif;
            font-size: 20px;
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
                width: 350px;
                height: 90%;
                white-space: nowrap;
                overflow-x: auto;
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
                    flex-direction: column;
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

                .classFile {
                    display: flex;
                    flex-direction: column;
                    cursor: pointer;
                    font-family: "Comic Sans MS";
                    color: #0F4DA8;
                    margin-left: 20px;
                    margin-top: 20px;
                    font-size: 16px;
                    /*font-weight: bolder;*/
                    /*width: 90%;*/
                    .classItem {
                        line-height: 25px;
                        /*height: 25px;*/
                        &:hover {
                            color: #FFA110;
                        }

                        .yellow {
                            color: #FFA110;
                        }

                        .constant_pool {

                        }

                        .constant_item {
                            /*height: 25px;*/
                            margin-left: 10px;

                            .constant_item_tag {
                                height: 25px;
                                margin-left: 10px;
                            }
                        }
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
                    font-family: "Comic Sans MS";
                    /*font-family: Humanist;*/
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    cursor: text;
                    max-width: 640px;
                    color: #0F4DA8;

                    *::selection {
                        background: none repeat scroll 0 0 #FFA110;
                        color: #fff;
                        text-shadow: none;
                    }

                    line-height: 25px;
                    /*height: 25px;*/
                    .single {
                        font-size: 16px;
                        text-align: center;
                        min-width: 40px;
                        border-radius: 3px;
                        /*background: #ffffff;*/
                        /*<!--box-shadow: inset 2px 2px 3px #cccccc,-->*/
                        /*<!--inset -2px -2px 3px #fafafa;-->*/

                        :hover {
                            /*border-radius: 3px;*/
                            /*<!--background: linear-gradient(145deg, #cccccc, #fafafa);-->*/
                            /*<!--box-shadow: 2px 2px 3px #cccccc,-->*/
                            /*<!-- -2px -2px 3px #fafafa;-->*/
                        }
                    }

                }

                .right-line {
                    font-family: "Comic Sans MS";
                    /*font-family: Humanist;*/
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    cursor: text;
                    max-width: 200px;
                    /*color: lightyellow;*/
                    *::selection {
                        background: none repeat scroll 0 0 #FFA110;
                        color: #fff;
                        text-shadow: none;
                    }

                    line-height: 25px;

                    .single {
                        font-size: 16px;
                        text-align: center;
                        min-width: 12px;
                        border-radius: 3px;
                    }
                }

                .left-line {
                    font-family: "Comic Sans MS", Humanist, serif;
                    /*font-family: Humanist;*/
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    cursor: text;
                    max-width: 100px;
                    /*color: lightyellow;*/
                    *::selection {
                        background: none repeat scroll 0 0 #FFA110;
                        color: #fff;
                        text-shadow: none;
                    }

                    line-height: 25px;

                    .single {
                        font-size: 16px;
                        text-align: center;
                        min-width: 12px;
                        border-radius: 3px;
                    }
                }

                .-right-bar {
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: row;
                    /*justify-content: space-between;*/
                    height: 40px;
                    line-height: 40px;
                    margin-left: 130px;
                    font-family: "Comic Sans MS";
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
                    flex-direction: column;
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

                    .red {
                        color: red;
                        background-color: #E4E4E4;
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
