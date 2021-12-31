<template>
  <el-dialog v-drag-dialog v-model:visible="visible" :close-on-click-modal="false" title="消息内容" width="60%">
    <el-form ref="dataForm" label-position="left" label-width="80px">
      <el-form-item label="信息类型" prop="typeDict">
        <el-input :value="typeFormatter(message.typeDict)" placeholder="类型"></el-input>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input :value="message.title" placeholder="标题"></el-input>
      </el-form-item>
      <el-form-item label="信息内容" prop="content">
        <el-input :autosize="{ minRows: 12 }" :value="message.content" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="fd-dialog-footer">
        <el-button type="primary" @click="visible = false">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from 'vue'
import { dictValue } from '@/utils/dict'
import request from '@/app/request'
import { AnyObject } from '@/utils'
import { IDictItem } from '@/api/system/dict-item'

export default defineComponent({
  name: 'SystemMessageContentDialog',
  emits: ['refresh-data-list'],
  setup(props, { emit }) {
    const state = reactive({
      statUrl: '/system/message/current/',
      message: {} as AnyObject,
      messageTypes: [] as IDictItem[],
      visible: false
    })

    watch(
      () => state.visible,
      async (val) => {
        if (!val && unread(state.message)) {
          await setReadHandle(state.message.id)
          emit('refresh-data-list')
        }
      }
    )

    const open = (message: AnyObject, messageTypes: IDictItem[]) => {
      state.message = message
      state.messageTypes = messageTypes
      state.visible = true
    }

    const setReadHandle = async (id: string) => {
      try {
        await request({
          url: `${state.statUrl}${id}`,
          method: 'put'
        })
      } catch (e) {
        console.log(e)
      }
    }

    const unread = (message: AnyObject) => {
      return message.stat == null || message.stat === '0'
    }

    const typeFormatter = (value: string) => {
      return dictValue(state.messageTypes, value)
    }

    return {
      ...toRefs(state),
      open,
      typeFormatter
    }
  }
})
</script>
