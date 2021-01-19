<template>
  <div>
    <div v-if="isLoad" v-for="(val,key,i) in classFile">
      <div v-if="Object.prototype.toString.call(val) !== '[object Array]'" class="classItem" @click="chooseItem(val,i)">
        <img src="../img/wd1.jpg" height="20px" width="20px"><img/>
        <span :class="{yellow: chooseIndex === i }">{{key}}</span>
      </div>
      <div v-else class="classItem" @click="chooseItem(val,i)">
        <span @click="open(key)" v-show="!isMenuLoad[key]" class="add">+</span>
        <span @click="open(key)" v-show="isMenuLoad[key]" class="add">-</span>
        <span :class="{yellow: chooseIndex === i }" @click="open(key)">{{key}}</span>
        <div class="stepDiv" v-for="(val1,key1,i1) in val">
          <tree-menu :class-file="val1" :isLoad="isMenuLoad[key]"></tree-menu>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default{
    name:'treeMenu',
    props:{
      classFile: {},
      isLoad:false
    },
    data () {
      return {
        chooseEnd:0,//鼠标选中的结束
        chooseIndex:-1,//选中属性的index
        isMaxWindow:false,
        isMenuLoad:{},
      }
    },
    created() {
      // console.log("111")
      for (let key in this.classFile) {
        if(Object.prototype.toString.call(this.classFile[key]) === '[object Array]'){
          this.isMenuLoad[key] = false;
        }
      }
      // console.log(this.isMenuLoad)
    },
    methods:{
      //选中一个元素
      chooseItem(val,i) {
        // console.log(val)
        this.chooseStart = val.startIndex;
        this.chooseEnd = val.endIndex;
        this.chooseIndex = i;
      },
      open(key) {
        console.log(key)
        console.log(this.isMenuLoad[key])
        this.isMenuLoad[key] = !this.isMenuLoad[key];
        this.$forceUpdate()
      }
    }
  }
</script>

<style lang="scss" scoped>
.stepDiv{
  margin-left: 10px;
}
.classItem{
  line-height: 25px;
  height: 25px;
  &:hover{
     color: #FFA110;
   }
  .yellow {
    color: #FFA110;
  }
}
</style>
