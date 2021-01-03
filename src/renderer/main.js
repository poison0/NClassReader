import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import { Button,Layout,DatePicker,Select,Spin,Modal,Table,Avatar,LocaleProvider,Tag} from 'ant-design-vue';
import 'ant-design-vue/lib/button/style/css';
import 'ant-design-vue/lib/layout/style/css';
import 'ant-design-vue/lib/table/style/css';
import 'ant-design-vue/lib/avatar/style/css';
import 'ant-design-vue/lib/locale-provider/style/css';
import 'ant-design-vue/lib/select/style/css';
import 'ant-design-vue/lib/spin/style/css';
import 'ant-design-vue/lib/modal/style/css';
import 'ant-design-vue/lib/date-picker/style/css';
import 'ant-design-vue/lib/tag/style/css';
import './assets/styles/font.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

//添加antd
Vue.use(Button);
Vue.use(Avatar);
Vue.use(LocaleProvider);
Vue.use(Layout);
Vue.use(Spin);
Vue.use(Table);
Vue.use(Modal);
Vue.use(Tag);
Vue.use(Select);
Vue.use(DatePicker);

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
