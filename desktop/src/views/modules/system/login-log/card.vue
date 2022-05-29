<template>
  <fd-detail-card v-bind="$attrs" :item="item" :placeholder-rows="3">
    <template #title>
      <fd-fmt-dict class="title-label" :dict="dicts.sysLoginLogType" :data="item.typeDict">
        <template #default="{ values }">
          <span>{{ values[0] }}</span>
        </template>
      </fd-fmt-dict>
      <fd-fmt-dict class="title-tag" :dict="dicts.sysAuthcType" :data="item.authcTypeDict" tag />
      <fd-fmt-dict
        class="title-tag"
        :dict="dicts.sysLoginLogStatus"
        :data="item.statusDict"
        tag
        :mapping="['成功,success', '失败,danger']"
      />
    </template>
    <fd-detail-card-item label="时间"><fd-fmt-datetime :data="item.operTime" /></fd-detail-card-item>
    <fd-detail-card-item label="用户名" :value="item.userName" />
    <fd-detail-card-item label="IP" :value="item.ip" />
    <fd-detail-card-item label="地址" :value="item.location" />
    <fd-detail-card-item label="消息" :value="item.message" />
  </fd-detail-card>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { LoginLog, loginLogDicts } from '@b/api/system/login-log'

defineOptions({
  name: 'SystemLoginLogCard',
  inheritAttrs: false
})

const props = defineProps({
  item: Object as PropType<LoginLog>,
  dicts: Object as PropType<typeof loginLogDicts>
})
</script>
