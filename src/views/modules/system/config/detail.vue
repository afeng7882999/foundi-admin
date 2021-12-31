<template>
  <div class="fd-page-form">
    <el-descriptions :column="2" :title="`系统配置详细 - ${data[idx].configKey}`" border direction="vertical" size="medium">
      <el-descriptions-item label="配置分类">
        {{ dictVal(dicts.sysConfigType, data[idx].configTypeDict) }}
      </el-descriptions-item>
      <el-descriptions-item label="是否启用">
        <el-tag v-if="data[idx].enabled" size="mini" type="success">启用</el-tag>
        <el-tag v-else size="mini" type="danger">禁用</el-tag>
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="键">{{ data[idx].configKey }}</el-descriptions-item>
      <el-descriptions-item :span="2" label="值">
        <fd-code-editor v-model:value="data[idx].configValue" language="application/json" readonly />
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="备注">{{ data[idx].remark }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, toRefs } from 'vue'
import useDetail from '@/components/crud/use-detail'
import { configFields } from '@/api/system/config'
import FdCodeEditor from '@/components/code-editor/index.vue'

export default defineComponent({
  name: 'SystemConfigDetail',
  components: { FdCodeEditor },
  setup(props, { emit }) {
    const stateOption = {
      idField: configFields.idField,
      resetFormData: {
        id: '',
        configTypeDict: '',
        configKey: '',
        configValue: '',
        enabled: '',
        remark: ''
      }
    }

    const { mixState, mixComputed, mixMethods } = useDetail(stateOption, emit)

    onBeforeMount(async () => {
      mixMethods.resetForm()
    })

    return {
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods
    }
  }
})
</script>

<style lang="scss" scoped>
.el-descriptions {
  ::v-deep(.el-descriptions__body) {
    table {
      table-layout: fixed;
    }
  }
}
</style>
