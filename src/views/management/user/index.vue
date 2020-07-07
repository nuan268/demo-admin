<template>  
      <SplitPane :min-percent='15' :default-percent='20' split="vertical">
        <template slot="paneL">
          <div class="box box-main">
            <div class="box-header">
              <div class="box-title">
                <i class="fa icon-grid"></i> 组织机构
              </div>
              <div class="box-tools pull-right">
                <button type="button" class="btn btn-box-tool addTabPage" data-href="/js/a/sys/office/list" title="机构管理"><i class="fa fa-edit"></i></button>
                <button type="button" class="btn btn-box-tool" id="btnExpand" title="展开" style="display:none;"><i class="fa fa-chevron-up"></i></button>
                <button type="button" class="btn btn-box-tool" id="btnCollapse" title="折叠"><i class="fa fa-chevron-down"></i></button>
                <button type="button" class="btn btn-box-tool" id="btnRefresh" title="刷新"><i class="fa fa-refresh"></i></button>
              </div>
            </div>
            <div class="ui-layout-content">
                <d2-tree source="DEPT_ALL" key-label="name"/>
            </div>            
          </div>
        </template>
        <template slot="paneR">
         用户管理
        </template>
      </SplitPane>    
</template>
<script>
import Vue from 'vue'
import SplitPane from 'vue-splitpane'
Vue.component('SplitPane', SplitPane)
export default {
  // components:d2Tree
}
</script>
<style scoped>
.box{
    position: relative;
    border-radius: 3px;
    background: #fff;
    border-top: 3px solid #caced6;
    margin-bottom: 20px;
    width: 100%;
    box-shadow: 0 1px 1px rgba(0,0,0,0.1);
}
.box-main{
    margin: 0;
    border: 0;
    padding-top: 2px;
    border-radius: 0;
    box-shadow: none;
}
.box-main .box-header{
    border-bottom: 1px solid #eee;
    padding: 13px 10px 1px 15px;
    color: #444;
    display: block;
    position: relative;
    overflow: hidden;
}
.box-header .box-title{
    font-size: 16px;
    margin-bottom: 13px;
    float: left;
}
.box-header .box-tools {
    position: relative;
    top: -6px;
    right: 0;
}
.box-main>.box-header .box-tools .btn-box-tool {
    padding: 4px 2px;
    padding: 5px;
    font-size: 12px;
    background: transparent;
    color: #97a0b3;
}
.box-main>.box-header .box-tools .btn {
    /* padding: 3px 10px 5px 10px; */
    font-size: 14px;
    margin-bottom: 2px;
    border-radius: 4px;
    -webkit-box-shadow: none;
    box-shadow: none;
    border: 1px solid transparent;
}
.btn {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
}
.pull-right {
    float: right!important;
}
.ui-layout-content{
    height: 100%;
    padding: 10px;
    position: relative;
    overflow: auto;
    width: 100%;
    border: 0;
}
</style>
