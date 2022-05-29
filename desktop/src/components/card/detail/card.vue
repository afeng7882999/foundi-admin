<template>
  <template v-if="item">
    <div class="fd-detail-card" :class="objClass" @click="onCardClick">
      <div class="fd-detail-card__title">
        <el-checkbox v-if="selectMode" :model-value="selected" @click.stop="" @change="(checked) => emitSelect(item, checked)" />
        <slot name="title" />
        <div class="fd-detail-card__act">
          <el-tooltip v-if="delVisible" :show-after="500" content="删除" placement="top">
            <fd-button class="act-btn" type="icon" color="danger" icon="delete" @click.stop="emitDel(item)" />
          </el-tooltip>
          <el-divider v-if="delDividerVisibleCo" direction="vertical" />
          <el-tooltip v-if="editVisible" :show-after="500" content="编辑" placement="top">
            <fd-button class="act-btn" type="icon" color="success" icon="write" @click.stop="emitEdit(item)" />
          </el-tooltip>
          <slot name="act" />
        </div>
      </div>
      <slot />
    </div>
  </template>
  <template v-else>
    <div class="fd-detail-card is-loading" :class="objClass" :style="placeholderStyleCo">
      <el-skeleton :rows="placeholderRows" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import usePage from '@/crud/hooks/use-page'
import { isBoolean } from 'lodash-es'
import { DETAIL_CARD_PROPS } from '@/components/card/type'
import { ApiObj } from '@b/api'

defineOptions({
  name: 'FdDetailCard'
})

const props = defineProps({
  ...DETAIL_CARD_PROPS
})

const selectedIds = computed(() => {
  return props.selectedItems.map((item) => item.id)
})

const selected = computed(() => {
  return props.item !== undefined && selectedIds.value.includes(props.item.id)
})

const onCardClick = () => {
  if (props.selectMode) {
    emitSelect(props.item as ApiObj, !selected.value)
  } else if (detailVisible.value) {
    emitDetail()
  }
}

const delDividerVisibleCo = computed(() => {
  return editVisible.value && useSlots().act
})

const placeholderStyleCo = computed(() => {
  return {
    height: `${props.placeholderHeight}px`
  }
})

const emit = defineEmits(['detail', 'del', 'edit', 'select', 'offsetChanged'])
const emitDetail = () => {
  emit('detail', { index: props.index, item: props.item })
}
const emitDel = (item: ApiObj) => {
  emit('del', item)
}
const emitEdit = (item: ApiObj) => {
  emit('edit', item)
}
const emitSelect = (item: ApiObj, checked: boolean) => {
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

const isMobileCo = computed(() => {
  return props.mobileCompact && props.isMobile
})
const objClass = computed(() => {
  const clazz = []
  if (selected.value) {
    clazz.push('is-selected')
  }
  if (props.focusedIndex !== undefined && props.focusedIndex === props.index) {
    clazz.push('is-focused')
  }
  if (isMobileCo.value) {
    clazz.push('is-mobile')
  }
  return clazz.join(' ')
})
</script>
