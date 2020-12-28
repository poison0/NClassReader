<template>
<!--    <div id="wrapper">-->
<!--        <a-button type="primary" @click="upload()" style="margin-right: 20px">-->
<!--            上传-->
<!--        </a-button>-->
<!--        <div style="min-width: 100px"></div>-->
<!--      -->
<!--    </div>-->
    <div class="page">
        <div class="header">
            <div class="title">ClassReader</div>
        </div>
        <div class="content">
            <div class="-left-content">
                <div class="bottomNav">
                    <div class="bottomDiv">
                        <a-button type="primary" icon="file-search" block @click="upload()">
                            上传
                        </a-button>
                    </div>
                </div>
                <div class="bookArea">
                </div>
            </div>
            <div class="-right-content">
                <div class="-right-bar">
<!--                    <div class="-right-bar-label">class二进制</div>-->
                </div>
                <div class="-right-content-book" :style="'height:'+(pageHeight-90)+'px'">
                    <div class="row-line">
                        <div v-for="(hex,index) in hexArray" style="min-width: 25px" >
                            <div >{{hex.toUpperCase()}}</div>
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
    const {dialog} = require('electron').remote;
    const remote = require('electron').remote;

    export default {
        name: 'landing-page',
        components: {SystemInformation},
        data() {
            return {
                //16进制数组
                hexArray:[],
                pageHeight:window.innerHeight,
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
                dialog.showOpenDialog(
                    {
                        title: "class文件", filters: [{name: 'class', extensions: ['class', 'CLASS']}]
                    },(filePath) => {
                        if (filePath) {
                            getBinaryInfo(filePath[0],(buf)=>{
                                var offset = 0;
                                while (offset < buf.length) {
                                    var s = buf[offset].toString(16);
                                    if (s.length === 1) {
                                        s = "0" + s;
                                    }
                                    this.hexArray.push(s);
                                    offset++;
                                }
                            })
                        }
                    })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;
        background-color: #EFEFEF;
        position: relative;
        overflow: hidden;
        .header {
            top:0;
            position:absolute;
            display: flex;
            flex-direction: row;
            justify-items: center;
            width: 100%;
            height: 48px;
            background-color: #ffffff;
            /*background-color: #FFA400;*/
            box-shadow: 0 0 4px #999999;
            z-index: 111;

            .title {
                color: #0F4DA8;
                /*color: #437DD4;*/
                /*color: #6A94D4;*/
                /*color: #FFA110;*/
                font-family: Calibri, "Times New Roman", serif;
                font-size: 20px;
                font-weight: bolder;
                margin-left: 20px;
                width: 100px;
                height: 48px;
                line-height: 48px;
            }
        }

        .content {
            /*position:absolute;*/
            font-family: '华文细黑', 'Courier New', Courier, monospace;
            /*display: flex;*/
            /*flex-direction: row;*/
            /*height: 660px;*/
            height: 100%;
            position: relative;
            margin-top:48px;
            .-left-content {
                float: left;
                /*width: 20%;*/
                width: 200px;
                height: 100%;
                border-right: 1px solid #E4E4E4;
                /*box-shadow: 0 0 4px #999999;*/
                z-index: 101;
                .bookArea {
                    .titleBar {
                        color: #999999;
                        font-size: 13px;
                        height: 40px;
                        line-height: 40px;
                        padding-left: 20px;
                        border-bottom: 1px solid #E4E4E4;
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
                    border-bottom: 1px solid #E4E4E4;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;

                    .bottomDiv {
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
                background-color: #E4E4E4;
                /*position: relative;*/
                .row-line{
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    cursor: text;
                    max-width: 400px;
                }
                .-right-bar {
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    height: 40px;
                    background-color: #EFEFEF;
                    /*background-color: #FFA400;*/
                    border-bottom: 1px solid #E4E4E4;
                    box-shadow: 0 0 2px #999999;
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
                    .empty-img{
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
                        margin-top:20px;
                        margin-left:30px;
                        min-height: 260px;
                        width: 180px;

                        .-book-title {
                            text-align: center;
                            line-height: 20px;
                            margin-top:20px;
                            margin-bottom:20px;
                            color: #000000;
                            font-family: '苹方';
                            /*font-weight: bold;*/
                            font-size: 14px;
                            min-height: 25px;
                            width: 140px;

                        }
                        .-book-pic{
                            position: relative;
                            cursor:pointer;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            width: 186px;
                            border:3px solid #ffffff;
                            box-shadow: 0 0 2px #999999;
                            transition:all 0.5s linear 0s;
                            .info{
                                position: absolute;
                                bottom: 40px;
                                left: 0;
                                /*float: left;*/
                                height: 70px;
                                width:20px;
                                background-color: #ffffff;
                                opacity: 0.8;
                                border-radius: 0 2px 2px 0;
                                transition:width 0.3s;
                                -webkit-transition:width 0.3s;
                                &:hover{
                                    width:180px;
                                }
                            }

                            &:hover{
                                border:3px solid #2F89DF;
                            }

                        }
                    }
                }
            }
        }
        .ant-input:focus{
            background-color: #0F4DA8;
        }
        .ant-card-grid{
            padding: 0;
        }
        .anticon {
            line-height: 45px;
        }
        .ant-btn-primary{
            background-color: #0F4DA8;
            border-color:#0F4DA8;
        }
    }

</style>
