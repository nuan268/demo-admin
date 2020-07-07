<template>
    <div flex="cross:center" class="d2-theme-header-menu" flex-box="1">
        <div class="d2-theme-header-menu__content" flex="" flex-box="1">
            <div class="d2-theme-header-menu__scroll" flex-box="0" style="transform: translateX(0px);">
                <el-menu mode ='horizontal' :defaultActive="active" @select="headerMenuClick">
                    <el-menu-item v-for="item in header" :key="item.path" :index="item.path">{{item.title}}</el-menu-item>
                </el-menu>
                <!-- <ul role="menubar" class="el-menu--horizontal el-menu">
                    <li role="menuitem" aria-haspopup="true" class="el-submenu" tabindex="0">
                        <div class="el-submenu__title" style="border-bottom-color: transparent;">
                            <i class="fa fa-icon-settings"></i>
                            <span>系统管理</span>
                            <i class="el-submenu__icon-arrow el-icon-arrow-down"></i>
                        </div>
                    </li>
                    <li role="menuitem" aria-haspopup="true" class="el-submenu" tabindex="0">
                        <div class="el-submenu__title" style="border-bottom-color: transparent;">
                            <i class="fa fa-icon-screen-desktop"></i>
                            <span>我的工作</span>
                            <i class="el-submenu__icon-arrow el-icon-arrow-down"></i>
                        </div>
                    </li>
                </ul> -->
            </div>
        </div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import store from '@/store'
export default {
    name: 'd2-layout-header-aside-menu-header',
    computed: {
        ...mapState('d2admin/menu', [
        'header'
        ])
    },
    data(){
        return {
            active:'0'
        }
    },
    methods:{
        headerMenuClick(index){
            const subMenu = this.header.find(item=>item.path===index);
            if(subMenu && subMenu.children)
            store.commit('d2admin/menu/asideSet',subMenu.children,{root:true})
        }
    }
}
</script>