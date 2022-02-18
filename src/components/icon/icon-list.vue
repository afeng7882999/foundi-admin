<template>
  <div class="fd-icon-list" :class="listClass">
    <el-input
      v-if="showFilter"
      class="fd-icon-list__search"
      v-model="filterText"
      placeholder="查找"
      prefix-icon="el-icon-search"

      clearable
      @input="onSearchInput"
    />
    <div
      class="fd-icon-list__cell"
      v-for="item in filteredList"
      :key="item"
      :class="cellClass(item)"
      @click="onCellClick(item)"
    >
      <fd-icon class="fd-icon-list__icon" :icon="item"></fd-icon>
      <div class="fd-icon-list__label">{{ item }}</div>
    </div>
    <div class="fd-icon-list__append" v-for="i in 30" :key="i" aria-hidden="true"></div>
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
        return getNameList().filter(
          (item) => item.toLowerCase().indexOf(state.filterText.toLowerCase()) !== -1
        )
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

<style lang="scss">
@use 'src/assets/style/variable.scss' as *;

.fd-icon-list {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  background-color: var(--el-color-white);

  &__search {
    width: 100%;
    margin-bottom: 10px;
  }

  &__append {
    width: 100px;
    height: 0;
  }

  &__cell {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
    text-align: center;
    box-sizing: border-box;
    border-radius: var(--el-border-radius-base);
    transition: 0.5s;

    &:hover {
      background-color: var(--el-color-primary-light-9);
      cursor: pointer;
      transition: 0.2s;
    }

    &.selected {
      background-color: var(--el-color-primary-light-9);

      .fd-icon-list__icon {
        color: var(--el-color-primary);
      }

      .fd-icon-list__label {
        color: var(--el-color-primary);
      }
    }
  }

  &__icon {
    margin: 0 20px;
    font-size: $icon-size-large;
    word-wrap: break-word;
    color: var(--el-color-primary);
  }

  &__label {
    padding: 5px;
    color: var(--el-text-color-regular);
    font-size: 11px;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100px;
  }

  &.is-no-label {
    .fd-icon-list__append {
      width: 64px;
      height: 0;
    }

    .fd-icon-list__label {
      display: none;
    }
  }
}
</style>
