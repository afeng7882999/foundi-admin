<template>
  <div v-if="hasAuth('test:table:list')" :style="docMinHeight" class="page-test-table fd-page">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <el-tabs>
      <el-tab-pane label="基础表格">
        <div class="fd-page__form">
          <el-form>
            <div class="fd-page__action">
              <div class="action-right">
                <el-button v-waves plain size="medium" @click.stop="onPrev">上一项</el-button>
                <el-button v-waves plain size="medium" @click.stop="onNext">下一项</el-button>
                <fd-table-setting :option="tableSettingOpt"></fd-table-setting>
              </div>
            </div>
          </el-form>
        </div>
        <div ref="operLogTbWrapper" class="fd-page__table is-bordered">
          <el-table ref="operLogTb" v-bind="operLogTblAttrs">
            <fd-column typ="selection"></fd-column>
            <fd-column typ="datetime" label="操作时间" prop="operTime" sortable></fd-column>
            <fd-column label="请求URL" prop="operUrl" sortable width="500"></fd-column>
            <fd-column label="请求方式" prop="requestMethod" width="80"></fd-column>
            <fd-column typ="dict" label="操作状态" prop="statusDict" :dict="state.sysOperLogStatus" width="80"></fd-column>
            <fd-column label="账号" prop="operUserName" width="150"></fd-column>
            <fd-column label="IP" prop="operIp" width="150"></fd-column>
            <fd-column label="地点" prop="operLocation"></fd-column>
            <fd-column typ="act" :detail="true" :del="true" :edit="true" header-align="center" align="center" width="200">
              <template #prefix>
                <el-tooltip :show-after="500" content="生成并预览代码" placement="top">
                  <el-button class="fd-tb-act" plain size="mini" type="warning">
                    <fd-icon icon="preview-open"></fd-icon>
                    预览
                  </el-button>
                </el-tooltip>
              </template>
            </fd-column>
          </el-table>
        </div>
        <el-backtop></el-backtop>
      </el-tab-pane>
      <el-tab-pane label="树状表格">
        <div class="fd-page__form">
          <el-form>
            <div class="fd-page__action">
              <div class="action-right">
                <fd-table-setting :option="tableSettingOpt2"></fd-table-setting>
              </div>
            </div>
          </el-form>
        </div>
        <div ref="menuTbWrapper" class="fd-page__table is-bordered">
          <el-table ref="menuTb" v-bind="menuTbAttrs">
            <fd-column typ="selection"></fd-column>
            <fd-column label="菜单名称" prop="name" width="200"></fd-column>
            <fd-column typ="icon" label="菜单图标" prop="icon" width="80"></fd-column>
            <fd-column typ="dict" label="类型" prop="typeDict" :dict="state.sysMenuType" width="80"></fd-column>
            <fd-column label="菜单缩写" prop="abbr" width="80"></fd-column>
            <fd-column typ="custom" label="是否显示" prop="visible" width="80">
              <template #default="scope">
                <fd-icon v-show="scope.row.visible" class="fd-tb-icon fd-tb-icon-success" icon="check"></fd-icon>
              </template>
            </fd-column>
            <fd-column label="菜单URL" prop="url"></fd-column>
            <fd-column typ="act" :edit="true" :del="true" header-align="center" align="center" width="100"></fd-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TestTable'
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { menuData, operLogData, sysMenuType, sysOperLogStatus } from '@/views/modules/test/table/data'
import useTable from '@/components/table/use-table'
import { AnyObject } from '@/utils'
import FdTableSetting from '@/components/table/table-setting.vue'
import usePage from '@/components/crud/use-page'

const state = reactive({
  operLogs: operLogData,
  sysOperLogStatus: sysOperLogStatus,
  currentIdx: null as number | null,

  menus: menuData,
  sysMenuType: sysMenuType
})

const operLogTbWrapper = ref()
const operLogTb = ref()

const onTableRowClick = (row: AnyObject) => {
  state.currentIdx = state.operLogs.findIndex((o) => o.id === row.id)
  setCurrentData()
}

const {
  tableAttrs: operLogTblAttrs,
  rowDensity,
  columns,
  expandAll,
  stripe,
  border,
  highlightCurrentRow
} = useTable(operLogTb, operLogTbWrapper, {
  alias: '_1',
  data: () => state.operLogs,
  rowSelectable: true,
  onRowClick: onTableRowClick
})

const tableSettingOpt = {
  expandAll: () => expandAll,
  rowDensity: () => rowDensity,
  columns: () => columns,
  stripe: () => stripe,
  border: () => border
}

const setCurrentData = (idx?: number) => {
  if (idx !== undefined) {
    ;(operLogTb.value as any).setCurrentRow(state.operLogs[idx])
  }
  nextTick(() => {
    highlightCurrentRow()
  })
}

const onPrev = () => {
  if (state.currentIdx === null) {
    state.currentIdx = state.operLogs.length - 1
    setCurrentData(state.operLogs.length - 1)
    return
  }
  if (state.currentIdx <= 0) {
    setCurrentData(0)
    return
  }
  state.currentIdx--
  setCurrentData(state.currentIdx)
}

const onNext = () => {
  const lastIdx = state.operLogs.length - 1
  if (state.currentIdx === null) {
    state.currentIdx = 0
    setCurrentData(0)
    return
  }
  if (state.currentIdx >= lastIdx) {
    setCurrentData(lastIdx)
    return
  }
  state.currentIdx++
  setCurrentData(state.currentIdx)
}

const menuTbWrapper = ref()
const menuTb = ref()

const {
  tableAttrs: menuTbAttrs,
  rowDensity: rowDensity2,
  columns: columns2,
  expandAll: expandAll2,
  stripe: stripe2,
  border: border2
} = useTable(menuTb, menuTbWrapper, {
  alias: '_2',
  treeTable: true,
  data: () => state.menus
})

const tableSettingOpt2 = {
  treeTable: true,
  expandAll: () => expandAll2,
  rowDensity: () => rowDensity2,
  columns: () => columns2,
  stripe: () => stripe2,
  border: () => border2
}

const { docMinHeight, showPageHeader, hasAuth } = usePage()
</script>
