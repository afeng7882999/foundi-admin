<template>
  <div class="fd-icon-list" :class="listClass">
    <el-input
      v-if="showFilter"
      v-model="filterText"
      class="fd-icon-list__search"
      placeholder="查找"
      prefix-icon="el-icon-search"
      clearable
      @input="onSearchInput"
    />
    <div v-for="item in filteredList" :key="item" class="fd-icon-list__cell" :class="cellClass(item)" @click="onCellClick(item)">
      <fd-icon class="fd-icon-list__icon" :icon="item"></fd-icon>
      <div class="fd-icon-list__label">{{ item }}</div>
    </div>
    <div v-for="i in 30" :key="i" class="fd-icon-list__append" aria-hidden="true"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRefs } from 'vue'
import { getNameList } from './index'

export default defineComponent({
  name: 'FdIconList',
  props: {
    value: {
      type: String
    },
    showFilter: {
      type: Boolean,
      default: true
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },
  emits: ['select-changed'],
  setup(props, { emit }) {
    const state = reactive({
      filterText: ''
    })

    const filteredList = computed(() => {
      if (state.filterText) {
        return getNameList().filter((item: string) => item.toLowerCase().indexOf(state.filterText.toLowerCase()) !== -1)
      } else {
        return getNameList()
      }
    })

    const listClass = computed(() => {
      return { 'is-no-label': !props.showLabel }
    })

    const cellClass = (icon: string) => {
      return { selected: icon === props.value }
    }

    const onCellClick = (icon: string) => {
      emit('select-changed', icon)
    }

    const onSearchInput = (val: string) => {
      state.filterText = val
    }

    return {
      ...toRefs(state),
      filteredList,
      listClass,
      cellClass,
      onCellClick,
      onSearchInput
    }
  }
})
</script>
