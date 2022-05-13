<template>
  <template v-if="item && dicts">
    <div class="fd-card-default" :class="objClass" @click.stop="onCardClick">
      <div class="fd-card-default__title">
        {{ index }}
        <el-checkbox v-if="selectMode" :model-value="selected" @click.stop="" @change="(checked) => emitSelect(item, checked)" />
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
        <div class="fd-card-default__act">
          <el-tooltip v-if="delVisible" :show-after="500" content="删除" placement="top">
            <fd-button class="act-btn" type="icon" color="danger" icon="delete" @click.stop="emitDel(item)" />
          </el-tooltip>
          <el-divider v-if="delVisible && editVisible" direction="vertical" />
        </div>
      </div>
      <div class="fd-card-default__label">时间</div>
      <div class="fd-card-default__item">
        <fd-fmt-datetime :data="item.operTime" />
      </div>
      <div class="fd-card-default__label">用户名</div>
      <div class="fd-card-default__item">{{ item.userName }}</div>
      <div class="fd-card-default__label">IP</div>
      <div class="fd-card-default__item">{{ item.ip }}</div>
      <div class="fd-card-default__label">地址</div>
      <div class="fd-card-default__item">{{ item.location }}</div>
      <div class="fd-card-default__label">消息</div>
      <div class="fd-card-default__item">{{ item.message }}</div>
    </div>
  </template>
  <template v-else>
    <div class="fd-card-default is-loading" :class="objClass">
      <el-skeleton :rows="3" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { LoginLog, loginLogDicts } from '@/api/system/login-log'
import usePage from '@/crud/hooks/use-page'
import { isBoolean } from 'lodash-es'
import useLayoutSize from '@/hooks/use-layout-size'

defineOptions({
  name: 'DefaultGridCard'
})

const props = defineProps({
  index: Number,
  item: Object as PropType<LoginLog>,
  dicts: Object as PropType<typeof loginLogDicts>,
  focusedIndex: Number,
  selectMode: {
    type: Boolean,
    default: false
  },
  selectedItems: {
    type: Array as PropType<LoginLog[]>,
    default: () => []
  },
  detail: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  edit: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  del: {
    type: [String, Boolean] as PropType<string | boolean>,
    default: false
  },
  mobileCompact: {
    type: Boolean,
    default: true
  }
})

const selectedIds = computed(() => {
  return props.selectedItems.map((item) => item.id)
})

const selected = computed(() => {
  return props.item !== undefined && selectedIds.value.includes(props.item.id)
})

const onCardClick = () => {
  if (props.selectMode) {
    emitSelect(props.item as LoginLog, !selected.value)
  } else {
    emitDetail()
  }
}

const emit = defineEmits(['detail', 'del', 'select', 'offsetChanged'])
const emitDetail = () => {
  emit('detail', { index: props.index, item: props.item })
}
const emitDel = (item: LoginLog) => {
  emit('del', item)
}
const emitSelect = (item: LoginLog, checked: boolean) => {
  emit('select', { item, selected: checked })
}

const { auth } = usePage()
const booleanOrAuth = (val: boolean | string) => {
  if (isBoolean(val)) {
    return val
  }
  if (val) {
    return auth(val)
  }
  return true
}
const detailVisible = computed(() => {
  return booleanOrAuth(props.detail)
})
const editVisible = computed(() => {
  return booleanOrAuth(props.edit)
})
const delVisible = computed(() => {
  return booleanOrAuth(props.del)
})

const { isMobile } = useLayoutSize(props.mobileCompact)
const objClass = computed(() => {
  const clazz = []
  if (selected.value) {
    clazz.push('is-selected')
  }
  if (props.focusedIndex !== undefined && props.focusedIndex === props.index) {
    clazz.push('is-focused')
  }
  if (isMobile.value) {
    clazz.push('is-mobile')
  }
  return clazz.join(' ')
})
</script>

<style lang="scss" scoped>
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/mixin' as *;

.fd-card-default {
  display: grid;
  grid-template: 32px 20px 20px 20px 20px 20px / 50px 1fr;
  grid-gap: 4px;
  align-items: center;
  width: 100%;
  max-width: 400px;
  padding: 16px;
  overflow: hidden;
  font-size: var(--el-font-size-small);
  color: var(--el-text-color-regular);
  background-color: var(--el-color-white);
  border: 1px solid transparent;
  border-radius: var(--el-border-radius-base);
  cursor: pointer;

  &.is-loading {
    display: block;
  }

  &:hover {
    background-color: var(--el-bg-color);
  }

  &.is-focused,
  &.is-selected {
    background-color: var(--el-color-primary-light-9);
  }

  &.is-selected {
    border-color: var(--el-color-primary);
  }

  &__title {
    grid-column: 1/3;
    display: flex;
    align-items: center;
    .title-label {
      font-size: var(--el-font-size-base);
      margin: 0 4px 0 0;
    }
    ::v-deep(.title-tag) {
      margin-left: 8px;
    }
    ::v-deep(.el-checkbox) {
      width: 22px;
    }
  }

  &__act {
    margin-left: auto;
  }

  &__label {
    grid-column: 1/2;
    color: var(--el-text-color-secondary);
  }

  &__item {
    grid-column: 2/3;
  }

  &.is-mobile {
    max-width: 100%;
    border-radius: 0;
    border-bottom: 1px solid var(--el-border-color-base);
  }

  @include theme-s() {
    border-radius: 0;
  }
}
</style>
