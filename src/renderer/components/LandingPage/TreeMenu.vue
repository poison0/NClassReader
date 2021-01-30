<template>
    <div>
        <div v-if="isLoad" v-for="(val,key,i) in classFile">
            <div v-if="Object.prototype.toString.call(val) !== '[object Array]' && key !== 'type' && key !== 'link_value' && key !== 'attr' && key !== 'attrStr'"
                 class="stepDiv" @click="chooseItem(val,i)">
                |-📑 <span :class="[{yellow: chooseIndex === i },'tag']" :title="val.typeName">{{key}}{{val.attrStr}}</span>
            </div>
            <div  v-if="Object.prototype.toString.call(val) === '[object Array]'" class="classItem" >
                <!--常量池中不包含0-->
                <span v-if="key === 'constant_pool'" >
                    <span @click="open(key)" v-show="!isMenuLoad[key]" class="add">📎</span>
                    <span @click="open(key)" v-show="isMenuLoad[key]" class="add">🧷</span>
                    <span :class="[{yellow: chooseIndex === i },'tag']" @click="chooseItem(val.attr,i)">{{key}}[{{val.length+1}}]</span>
                </span>
                <span v-else   >
                    <span @click="open(key)" v-show="!isMenuLoad[key]" class="add">📎</span>
                    <span @click="open(key)" v-show="isMenuLoad[key]" class="add">🧷</span>
                    <span :class="[{yellow: chooseIndex === i },'tag']" @click="chooseItem(val.attr,i)">{{key}}[{{val.length}}]</span>
                </span>
                <div class="stepDiv" v-for="(val1,key1,i1) in val">
                    <div  v-show="isMenuLoad[key]" v-if="!val1.isObject">
                        <span >
                            <span @click="open(key+key1,val1,(key+key1+'insert'))" v-show="!isMenuLoad[key+key1]" class="add" >📎</span>
                            <span @click="open(key+key1,val1,(key+key1+'insert'))" v-show="isMenuLoad[key+key1]" class="add">🧷</span>
                            <span v-if="val1.type !== 'empty'" :class="[{yellow: chooseIndex === (key+key1+'insert') },'tag']" @click="chooseItem(val1.attr,(key+key1+'insert'))">{{key1+1}}{{val1.attrStr}}</span>
                            <span v-else :class="[{yellow: chooseIndex === (key+key1+'insert') },'tag']" >{{key1+1}}:[Empyt Item]</span>
                        </span>
                        <!--递归获取-->
                        <tree-menu :class-file="val1" :isLoad="isMenuLoad[key+key1]"></tree-menu>
                    </div>
                    <div  v-show="isMenuLoad[key]" v-else>
                        |-📑 <span @click="chooseItem(val1,(key+key1+'insert'))" :class="[{yellow: chooseIndex === (key+key1+'insert') },'tag']">{{key1+1}}{{val1.attrStr}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import PubSub from 'pubsub-js';

    export default {
        name: 'treeMenu',
        props: {
            classFile: {},
            isLoad: false
        },
        data() {
            return {
                chooseEnd: 0,//鼠标选中的结束
                chooseIndex: -1,//选中属性的index
                isMaxWindow: false,
                isMenuLoad: {},
                isCurrent:false,
            }
        },
        created() {
            // console.log("111")
            for (let key in this.classFile) {
                if (Object.prototype.toString.call(this.classFile[key]) === '[object Array]') {
                    this.isMenuLoad[key] = false;
                    for (let i = 0; i < this.classFile[key].length; i++) {
                        this.isMenuLoad[key + i] = false;
                    }
                }
            }
            console.log(this.isMenuLoad)
        },
        mounted() {
            PubSub.subscribe("chooseItem",(event,val)=>{
                if (!this.isCurrent) {
                    this.chooseIndex = -1;
                }
                this.isCurrent = false;
            })
        },
        methods: {
            //选中一个元素
            chooseItem(val, i) {
                this.chooseIndex = i;
                this.isCurrent = true;
                PubSub.publish("chooseItem", val)
            },
            getFirstAttribute(data){
                for (var key in data)
                    return data[key];
            },
            open(key) {
                this.isMenuLoad[key] = !this.isMenuLoad[key];
                this.$forceUpdate()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .stepDiv {
        margin-left: 15px;

    }
    .yellow {
        color: red;

    }
    .tag {
        &:hover {
            /*color: red;*/
            background-color: #E4E4E4;
        }
    }

    .classItem {
        margin-left: 15px;
        line-height: 25px;
        /*height: 25px;*/
    }
</style>
