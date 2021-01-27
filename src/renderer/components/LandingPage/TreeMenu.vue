<template>
    <div>
        <div v-if="isLoad" v-for="(val,key,i) in classFile">
            <div v-if="Object.prototype.toString.call(val) !== '[object Array]' && key !== 'type' && key !== 'link_value'"
                 class="stepDiv" @click="chooseItem(val,i,1)">
                <span :class="[{yellow: chooseIndex === i },'tag']" :title="val.typeName">|-❖ {{key}}</span>
            </div>
            <div  v-if="Object.prototype.toString.call(val) === '[object Array]'" class="classItem" @click="chooseItem(val,i,2)">

<!--                常量池中不包含0-->
                <span v-if="key === 'constant_pool'" class="tag" @click="open(key)">
                    <span v-show="!isMenuLoad[key]" class="add">►</span>
                    <span v-show="isMenuLoad[key]" class="add">▼</span>
                    {{key}}[{{val.length+1}}]
                </span>
                <span v-else class="tag" @click="open(key)">
                    <span v-show="!isMenuLoad[key]" class="add">►</span>
                    <span v-show="isMenuLoad[key]" class="add">▼</span>
                    {{key}}[{{val.length}}]
                </span>
                <div class="stepDiv" v-for="(val1,key1,i1) in val">
                    <div  v-show="isMenuLoad[key]" v-if="!val1.isObject">
                        <span class="tag" @click="open(key+key1)">
                            <span v-show="!isMenuLoad[key+key1]" class="add">►</span>
                            <span v-show="isMenuLoad[key+key1]" class="add">▼</span>
                            {{key1+1}}:{{val1.type}}
                        </span>
                        <!--递归获取-->
                        <tree-menu :class-file="val1" :isLoad="isMenuLoad[key+key1]"></tree-menu>
                    </div>
                    <div  v-show="isMenuLoad[key]" v-else>
                        <span class="tag">|-❖ {{key1+1}}</span>
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
            chooseItem(val, i,type) {
                if (type === 1) {
                    this.chooseStart = val.startIndex;
                    this.chooseEnd = val.endIndex;
                    this.chooseIndex = i;
                    this.isCurrent = true;
                    PubSub.publish("chooseItem", val)
                }else{

                }
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
        .yellow {
            color: #FFA110;
        }
    }

    .tag {
        &:hover {
            color: #FFA110;
        }
    }

    .classItem {
        margin-left: 15px;
        line-height: 25px;
        /*height: 25px;*/
    }
</style>
