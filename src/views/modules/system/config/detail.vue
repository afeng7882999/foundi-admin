<template>
  <fd-drawer
    v-model="state.visible"
    :close-on-click-modal="false"
    :modal="false"
    :title="`系统配置详细 (${state.idx + 1} / ${state.data.length})`"
    size="600px"
  >
    <el-descriptions :column="2" border direction="vertical">
      <el-descriptions-item label="配置分类">
        <fd-fmt-dict :dict="state.dicts.sysConfigType" :data="state.data[state.idx].configTypeDict" />
      </el-descriptions-item>
      <el-descriptions-item label="是否启用">
        <fd-fmt-boolean :data="state.data[state.idx].enabled" labels="启用,禁用" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="键">{{ state.data[state.idx].configKey }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="值">
        <fd-fmt-json :data="state.data[state.idx].configValue" />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="备注">{{ state.data[state.idx].remark }}</el-descriptions-item>
      <template #extra>
        <el-button
          v-show="state.ifEditable && hasAuth('system:config:edit')"
          plain
          type="primary"
          style="margin-right: auto"
          @click="onEdit"
        >
          编辑
        </el-button>
        <el-button v-show="state.ifShowNavigation" :disabled="prevDisabled" @click="onPrev">
          <fd-icon class="is-in-btn" icon="left-small"></fd-icon>
          上一个
        </el-button>
        <el-button v-show="state.ifShowNavigation" :disabled="nextDisabled" @click="onNext">
          下一个
          <fd-icon class="is-in-btn is-right" icon="right-small"></fd-icon>
        </el-button>
      </template>
    </el-descriptions>
  </fd-drawer>
</template>

<script lang="ts">
export default {
  name: 'SystemConfigDetail'
}
</script>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import useDetail, { NAVIGATE_EVENT, OPEN_EDIT_EVENT } from '@/extend/crud/use-detail'
import { Config, configFields } from '@/api/system/config'
import usePage from '@/extend/page/use-page'

const stateOption = {
  ifEditable: true,
  idField: configFields.idField,
  resetFormData: {
    id: '',
    configTypeDict: '',
    configKey: '',
    configValue: '',
    enabled: undefined,
    remark: ''
  }
}

const emit = defineEmits([OPEN_EDIT_EVENT, NAVIGATE_EVENT])

const { mixState: state, mixComputed, mixMethods } = useDetail<Config>(stateOption, emit)
const { prevDisabled, nextDisabled } = mixComputed
const { open, resetForm, close, onEdit, onPrev, onNext } = mixMethods

const { hasAuth } = usePage()

onBeforeMount(async () => {
  resetForm()
})

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.el-descriptions {
  ::v-deep(.el-descriptions__body) {
    .el-descriptions__table {
      table-layout: fixed;
    }
  }
}
</style>
