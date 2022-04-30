<template>
  <template v-if="item && dicts">
    <div class="demo-card">
      <div class="demo-card__title">
        <el-checkbox />
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
        <fd-button class="title-btn" type="icon" color="danger" icon="delete" />
      </div>
      <div class="demo-card__label">时间</div>
      <div class="demo-card__item">
        <fd-fmt-datetime :data="item.operTime" />
      </div>
      <div class="demo-card__label">用户名</div>
      <div class="demo-card__item">{{ item.userName }}</div>
      <div class="demo-card__label">IP</div>
      <div class="demo-card__item">{{ item.ip }}</div>
      <div class="demo-card__label">地址</div>
      <div class="demo-card__item">{{ item.location }}</div>
      <div class="demo-card__label">消息</div>
      <div class="demo-card__item">{{ item.message }}</div>
    </div>
  </template>
  <template v-else>
    <div class="demo-card is-loading">
      <el-skeleton :rows="3" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { LoginLog, loginLogDicts } from '@/api/system/login-log'

defineOptions({
  name: 'DemoGridCard'
})

const props = defineProps({
  index: Number,
  item: Object as PropType<LoginLog>,
  dicts: Object as PropType<typeof loginLogDicts>
})
</script>

<style lang="scss" scoped>
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/mixin' as *;

.demo-card {
  display: grid;
  grid-template: 32px 20px 20px 20px 20px 20px / 50px 1fr;
  grid-gap: 4px;
  align-items: center;
  width: 100%;
  padding: 16px;
  overflow: hidden;
  font-size: var(--el-font-size-small);
  color: var(--el-text-color-regular);
  background-color: var(--el-color-white);
  border-radius: $border-radius-base;

  &.is-loading {
    display: block;
  }

  &__title {
    grid-column: 1/3;
    display: flex;
    align-items: center;
    .title-label {
      font-size: var(--el-font-size-base);
      margin: 0 4px 0 8px;
    }
    ::v-deep(.title-tag) {
      margin-left: 8px;
    }
    .title-btn {
      margin-left: auto;
    }
  }

  &__label {
    grid-column: 1/2;
    color: var(--el-text-color-secondary);
  }

  &__item {
    grid-column: 2/3;
  }

  @include theme-s() {
    border-radius: 0;
  }
}
</style>
