<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'class-view'
  }
</script>

<style type="text/css" lang="scss">
  html, body{
    font-family: "Gloria Hallelujah", sans-serif;
    width: 100%;
    height: 100%;
  }
  #app{
    height: 100%;
  }
  ::-webkit-scrollbar {
    width: 7px; /*滚动条宽度*/
    height: 7px;  /*滚动条高度*/
  }

  /*定义滚动条轨道 内阴影+圆角*/
  ::-webkit-scrollbar-track {
    /*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);*/
    border-radius: 10px;  /*滚动条的背景区域的圆角*/
    background-color: #ffffff;/*滚动条的背景颜色*/
  }

  /*定义滑块 内阴影+圆角*/
  ::-webkit-scrollbar-thumb {
    border-radius: 99px; /*滚动条的圆角*/
    /*-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);*/
    background-color: #C3D6E5;  /*滚动条的背景颜色*/
  }
</style>
