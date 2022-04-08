<template>
  <el-row class="mb-4">
    <fd-button label="Default" />
    <fd-button color="primary" label="Primary" />
    <fd-button color="success" label="Success" />
    <fd-button color="info" label="Info" />
    <fd-button color="warning" label="Warning" />
    <fd-button color="danger" label="Danger" />
    <fd-button label="中文" />
    <fd-button label="中文" disabled />
  </el-row>

  <el-row class="mb-4">
    <fd-button plain label="Plain" />
    <fd-button color="primary" plain label="Primary" />
    <fd-button color="success" plain label="Success" />
    <fd-button color="info" plain label="Info" />
    <fd-button color="warning" plain label="Warning" />
    <fd-button color="danger" plain label="Danger" />
    <fd-button color="danger" plain label="Danger" disabled />
  </el-row>

  <el-row class="mb-4">
    <fd-button round label="Round" />
    <fd-button color="primary" round label="Primary" />
    <fd-button color="success" round label="Success" />
    <fd-button color="info" round label="Info" />
    <fd-button color="warning" round label="Warning" />
    <fd-button color="danger" round label="Danger" />
    <fd-button color="danger" round label="Danger" disabled />
  </el-row>

  <el-row>
    <fd-button icon="search" circle />
    <fd-button color="primary" icon="write" circle />
    <fd-button color="success" icon="check" circle />
    <fd-button color="info" icon="message-one" circle />
    <fd-button color="warning" icon="star" circle />
    <fd-button color="danger" icon="delete" circle />
    <fd-button color="danger" icon="delete" circle disabled />
  </el-row>

  <el-row>
    <fd-button icon="search" label="default" />
    <fd-button color="primary" icon="write" label="Primary" />
    <fd-button color="success" icon="check" label="Success" />
    <fd-button color="info" icon="message-one" label="Info" />
    <fd-button color="warning" icon="star" label="Warning" />
    <fd-button color="danger" icon="delete" label="Danger" />
    <fd-button color="danger" icon="delete" label="Danger" disabled />
  </el-row>

  <el-row>
    <fd-button icon="search" label="default" icon-pos="right" />
    <fd-button color="primary" icon="write" label="Primary" icon-pos="right" />
    <fd-button color="success" icon="check" label="Success" icon-pos="right" />
    <fd-button color="info" icon="message-one" label="Info" icon-pos="right" />
    <fd-button color="warning" icon="star" label="Warning" icon-pos="right" />
    <fd-button color="danger" icon="delete" label="Danger" icon-pos="right" />
    <fd-button color="danger" icon="delete" label="Danger" icon-pos="right" disabled />
  </el-row>

  <el-row>
    <fd-button icon="search" type="icon" />
    <fd-button color="primary" icon="write" type="icon" />
    <fd-button color="success" icon="check" type="icon" />
    <fd-button color="info" icon="message-one" type="icon" />
    <fd-button color="warning" icon="star" type="icon" />
    <fd-button color="danger" icon="delete" type="icon" />
    <fd-button color="danger" icon="delete" type="icon" disabled />
  </el-row>

  <el-row>
    <fd-button icon="search" label="查找" type="toolbar" />
    <fd-button color="primary" icon="write" label="编辑" type="toolbar" />
    <fd-button color="success" icon="check" label="确认提交" type="toolbar" />
    <fd-button color="info" icon="message-one" label="新消息" type="toolbar" />
    <fd-button color="warning" icon="star" label="分数" type="toolbar" />
    <fd-button color="danger" icon="delete" label="删除" type="toolbar" />
    <fd-button color="danger" icon="delete" label="删除" type="toolbar" disabled />
  </el-row>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DemoMiscButton'
})
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 8px;
}
</style>
