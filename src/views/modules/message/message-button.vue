<template>
  <div class="message-button">
    <el-popover :offset="-5" :show-after="500" :show-arrow="false" placement="bottom" trigger="hover" width="250">
      <template #reference>
        <el-badge :value="unreadCount" class="small-badge message-badge">
          <fd-button type="icon" class="right-menu-item" icon="mail" style="margin-right: 15px"></fd-button>
        </el-badge>
      </template>
      <div class="message-list">
        <div class="list-title">站内消息通知</div>
        <ul class="message">
          <li v-for="item in dataList" :key="item.id" class="message-item" @click="showMessageContent(item)">
            <fd-icon class="item-icon" icon="email"></fd-icon>
            <div class="item-content">
              <span class="message-title">{{ item.title }}</span>
              <span class="message-time">{{ item.createAt }}</span>
            </div>
          </li>
        </ul>
        <div class="list-act"><span @click="$router.push('/user/message')">查看更多...</span></div>
      </div>
    </el-popover>
    <SystemMessageContentDialog v-if="messageContentVisible" ref="messageContent" @refresh-data-list="getList"></SystemMessageContentDialog>
  </div>
</template>

<script lang="ts">
import request from '@/app/request'
import SystemMessageContentDialog from './message-content.vue'
import { defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRefs } from 'vue'
import { Message } from '@/api/system/message'
import { Indexable } from '@/common/types'

export default defineComponent({
  name: 'SystemMessageButton',
  components: {
    SystemMessageContentDialog
  },
  props: {
    // number of showed messages
    listCount: {
      type: Number,
      default: 100
    },
    // check unread messages by 10 seconds
    checkMessageInterval: {
      type: Number,
      default: 10000
    }
  },
  setup(props) {
    const messageContent = ref()

    const state = reactive({
      messageContentVisible: false,
      dataList: [] as Message[],
      unreadCount: '0'
    })

    const listUrl = '/system/message/current/list'
    let messageType = [] as any[]

    onMounted(async () => {
      // beginCheckMessage()
    })

    onBeforeUnmount(() => {
      clearClock()
    })

    const getList = async () => {
      try {
        const { data: data, messageType: msgType } = (await request({
          url: listUrl,
          method: 'get',
          params: {
            current: 1,
            limit: props.listCount
          }
        })) as Indexable
        state.dataList = data.filter((m: Indexable) => unread(m))
        messageType = msgType
        state.unreadCount = state.dataList.length > props.listCount - 1 ? props.listCount - 1 + '+' : state.dataList.length.toString()
      } catch (e) {
        console.log(e)
      }
    }

    const showMessageContent = (row: any) => {
      state.messageContentVisible = true
      nextTick(async () => {
        messageContent.value.init(row, messageType)
      })
    }

    let messageClock = 0
    const beginCheckMessage = () => {
      clearClock()
      getList()
      messageClock = window.setInterval(async () => {
        await getList()
      }, props.checkMessageInterval)
    }

    const clearClock = () => {
      if (messageClock) {
        window.clearInterval(messageClock)
      }
    }

    const unread = (message: any) => {
      return message.stat == null || message.stat === '0'
    }

    return {
      messageContent,
      ...toRefs(state),
      getList,
      showMessageContent,
      unread
    }
  }
})
</script>

<style lang="scss" scoped>
@use 'src/assets/style/variable' as *;

.message-button {
  display: inline-block;

  .el-badge {
    vertical-align: top;

    ::v-deep(sup) {
      transform: translateY(0);
      height: 12px;
      line-height: 12px;
      border: none;
      border-radius: 10px;
    }
  }
}

.message-list {
  margin: -13px -12px 0 -13px;
  width: 249px;

  .list-title {
    display: inline-block;
    width: 100%;
    height: 50px;
    padding: 0 10px;
    line-height: 50px;
    font-size: $font-size-base;
    background-color: var(--el-bg-color);
  }

  .message {
    width: 100%;
    margin: 0;
    padding: 0;
    list-style-type: none;

    .message-item {
      position: relative;
      padding: 5px 10px;
      cursor: pointer;
      border-bottom: 1px solid var(--el-border-color-base);

      .item-icon {
        position: absolute;
        top: 14px;
        font-size: $icon-size-middle;
      }

      .item-content {
        display: inline-block;
        width: 100%;
        padding-left: 30px;

        .message-title {
          display: block;
          width: 100%;
          height: 16px;
          font-size: $font-size-small;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        .message-time {
          display: block;
          width: 100%;
          height: 16px;
          margin-top: 2px;
          font-size: $font-size-tiny;
        }
      }

      &:hover {
        color: var(--el-color-primary);
        background-color: var(--el-bg-color);
      }
    }
  }

  .list-act {
    display: inline-block;
    width: 100%;
    padding: 12px 10px 0 10px;

    span {
      height: 20px;
      line-height: 20px;
      color: var(--el-color-primary);
      font-size: $font-size-small;

      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }
}
</style>
