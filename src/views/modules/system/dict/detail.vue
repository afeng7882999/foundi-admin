<template>
  <div class="fd-page__form">
    <el-descriptions :column="2" :title="`系统字典 - ${data[idx].name}`" border direction="vertical" size="medium">
      <el-descriptions-item label="名称">
        <span>{{ data[idx].name }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="中文名">
        <span>{{ data[idx].nameCn }}</span>
      </el-descriptions-item>
      <el-descriptions-item :span="2" label="备注">
        <span>{{ data[idx].remarks }}</span>
      </el-descriptions-item>
      <el-descriptions-item :span="2">
        <template #label>字典项（{{ dictItemCount }}项）</template>
        <div class="fd-detail-list">
          <ul class="fd-detail-list__lst">
            <li v-for="(item, index) in data[idx].items" :key="item.id" :class="{ 'fd-detail-list__odd': index % 2 !== 0 }">
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
import { defineComponent, onBeforeMount, toRefs } from 'vue'
import useDetail from '@/components/crud/use-detail'
import { dictFields, IDict } from '@/api/system/dict'
import { getDictListByName, IDictItem } from '@/api/system/dict-item'
import { AnyObject } from '@/utils'
import { IDictList } from '@/components/crud/use-dict'

export default defineComponent({
  name: 'SystemDictDetail',
  setup(props, { emit }) {
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

    const { mixState, mixComputed, mixMethods } = useDetail(stateOption, emit)

    onBeforeMount(async () => {
      mixMethods.resetForm()
    })

    mixMethods.onBeforeOpen(async (data: AnyObject[], idx: number) => {
      const dict = data[idx] as IDict
      if (!dict.items) {
        const { [dict.name]: items } = (await getDictListByName([dict.name])) as IDictList
        dict.items = items
      }
      mixState.dictItemCount = dict.items.length
    })

    return {
      ...toRefs(mixState),
      ...mixComputed,
      ...mixMethods
    }
  }
})
</script>
