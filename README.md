# NclassView
java类文件结构查看器

写这个的原因主要是因为要熟悉class文件结构。    
>⚔️遵循java8jvm规范解析，java8以后的暂时没有添加，以后可能会加上。    
>⚔️博客内容只包含如何解析class结构，不包含electron和相关依赖的使用方式，只包含逻辑代码。   
>⚔️本文参考了《Java虚拟机规范（Java SE 8版）》《深入理解Java虚拟机（第3版）》。   
>⚔️选择前端来实现，是因为前端写页面比较简单，效果也要比java页面要好看。 


![图片](https://raw.githubusercontent.com/poison0/NClassReader/main/showPic/2021-01-31%20131048.jpg)

### 技术栈
*   [electron](https://github.com/electron/electron)
*   [Vue](https://github.com/vuejs/vue)
*   [electron-vue](https://github.com/SimulatedGREG/electron-vue)

### Dev Build Setup

``` bash
# clone
git clone https://github.com/poison0/NClassReader.git
# install dependencies
npm install
# run
npm run dev
```
