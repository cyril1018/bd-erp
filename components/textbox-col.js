Vue.component('textbox-col', {
    props: {
      scope: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        isEdit: false,
        addr: ''
      };
    },
    mounted() {
      this.addr = this.scope.row.addr;
    },
    watch: {
      isEdit(newValue) {
        if (!newValue) {
          this.addr = this.scope.row.addr;
        }
      }
    },
    template: `
      <div>
        <span v-if="!isEdit">{{ addr }}</span>
        <el-input v-else type="text" v-model="addr"></el-input>
      </div>
    `
  });
  