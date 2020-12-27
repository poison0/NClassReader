<template>
    <div id="wrapper">
        <a-button type="primary" @click="upload()" style="margin-right: 20px">
            上传
        </a-button>
        <div class="row-line">
            <div v-for="(hex,index) in hexArray" style="min-width: 25px" >
                <div >{{hex.toUpperCase()}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import SystemInformation from './LandingPage/SystemInformation'
    import {getBinaryInfo} from "./util/operFile";
    const {dialog} = require('electron').remote;


    export default {
        name: 'landing-page',
        components: {SystemInformation},
        data() {
            return {
                //16进制数组
              hexArray:[]
            }
        },
        methods: {
            open(link) {
                this.$electron.shell.openExternal(link)
            },
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

<style>
    @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'Source Sans Pro', sans-serif;
    }


    main {
        display: flex;
        justify-content: space-between;
    }

    main > div {
        flex-basis: 50%;
    }

    .left-side {
        display: flex;
        flex-direction: column;
    }

    .welcome {
        color: #555;
        font-size: 23px;
        margin-bottom: 10px;
    }

    .title {
        color: #2c3e50;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 6px;
    }

    .row-line{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        cursor: text;
        max-width: 400px;
    }

    .doc p {
        color: black;
        margin-bottom: 10px;
    }

    .doc button {
        font-size: .8em;
        cursor: pointer;
        outline: none;
        padding: 0.75em 2em;
        border-radius: 2em;
        display: inline-block;
        color: #fff;
        background-color: #4fc08d;
        transition: all 0.15s ease;
        box-sizing: border-box;
        border: 1px solid #4fc08d;
    }

    .doc button.alt {
        color: #42b983;
        background-color: transparent;
    }
</style>
