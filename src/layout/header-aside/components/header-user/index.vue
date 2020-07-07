<template>
  <el-dropdown size="default" class="d2-mr">
    <div>
    <img :src="avatar " class="user-image">
    <span class="btn-text">{{name ? `${name}` : '用户中心'}}</span>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item @click.native="logOff">
        <d2-icon name="power-off" class="d2-mr-5"/>
        注销
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  computed: {
    ...mapGetters('d2admin/user', [
      'name',
      'avatarUrl'
    ]),
    avatar(){
      return process.env.VUE_APP_SERVER+this.avatarUrl
    }
  },
  methods: {
    ...mapActions('d2admin/user', [
      'logout'
    ]),
    /**
     * @description 登出
     */
    logOff () {
      this.logout()
    }
  }
}
</script>
