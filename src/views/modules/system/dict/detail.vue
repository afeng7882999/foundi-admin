<template>
  <div class="fd-page__form">
    <el-descriptions
      :column="2"
      :title="`系统字典 - ${state.data[state.idx].name}`"
      border
      direction="vertical"

    >
      <el-descriptions-item label="名称">
        <span>{{ state.data[state.idx].name }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="中文名">
        <span>{{ state.data[state.idx].nameCn }}</span>
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="备注">
        <span>{{ state.data[state.idx].remarks }}</span>
      </el-descriptions-item>
      <el-descriptions-item :span="2">
        <template #label>字典项（{{ state.dictItemCount }}项）</template>
        <div class="fd-detail-list">
          <ul class="fd-detail-list__inner">
            <li
              v-for="(item, index) in state.data[state.idx].items"
              :key="item.id"
              :class="{ 'fd-detail-list__odd': index % 2 !== 0 }"
            >
              <span class="fd-detail-list__idx">{{ item.itemKey }}</span>
              <span>{{ item.itemValue }}</span>
            </li>
          </ul>
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemDictDetail'
}
</script>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import useDetail, { OPEN_EDIT_EVENT } from '@/components/crud/use-detail'
import { dictFields, IDict } from '@/api/system/dict'
import { getDictListByName, IDictItem } from '@/api/system/dict-item'
import { AnyObject } from '@/utils'
import { IDictList } from '@/components/crud/use-dict'

const stateOption = {
  idField: dictFields.idField,
  resetFormData: {
    id: '',
    name: '',
    nameCn: '',
    remarks: '',
    items: [] as IDictItem[]
  },
  dictItemCount: 0
}

const emit = defineEmits([OPEN_EDIT_EVENT])

const { mixState: state, mixMethods } = useDetail(stateOption, emit)
const { onBeforeOpen, open, resetForm, close } = mixMethods

onBeforeMount(async () => {
  resetForm()
})

onBeforeOpen(async (data: AnyObject[], idx: number) => {
  const dict = data[idx] as IDict
  if (!dict.items) {
    const { [dict.name]: items } = (await getDictListByName([dict.name])) as IDictList
    dict.items = items
  }
  state.dictItemCount = dict.items.length
})

defineExpose({
  open,
  close
})
</script>
