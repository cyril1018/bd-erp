Vue.component('custom-menu', {
    template: `
      <el-aside width="200px">
        <el-menu style="height: 100vh;">
          <el-menu-item index="1" @click="routeTo('sells.html')">
            <i class="el-icon-document"></i>
            <span slot="title">銷貨管理</span>
          </el-menu-item>
          <el-menu-item index="2" @click="routeTo('customers.html')">
            <i class="el-icon-user"></i>
            <span slot="title">客戶管理</span>
          </el-menu-item>
          
          <el-menu-item index="3" @click="routeTo('items.html')">
            <i class="el-icon-present"></i>
            <span slot="title">產品管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
    `,
    methods: {
      routeTo(url) {
        window.location.href = url;
      },
      working:function(){
        this.$message({
          type: 'info',
          message: '還沒做完~'
        });
      }
    },
  });