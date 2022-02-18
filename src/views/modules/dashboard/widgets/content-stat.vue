<template>
  <fd-widget-panel class="widget-content-stat" title="作品数据趋势" icon="analysis">
    <template v-if="false" #action>
      <span class="widget-content-stat__label">时间</span>
      <el-radio-group v-model="state.dateRange" class="widget-content-stat__radio" size="small" @change="onRadioGroupChange">
        <el-radio-button label="7">7天</el-radio-button>
        <el-radio-button label="30">30天</el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-model="state.dateRangeCustom"
        class="widget-content-stat__date-picker"
        size="small"
        :default-time="[new Date('0 0:0:0'), new Date('0 23:59:59')]"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        range-separator="-"
        start-placeholder="开始日期"
        type="daterange"
        @change="onDatePickerChange"
      ></el-date-picker>
    </template>
    <div ref="chartElement" style="width: 100%; height: 300px"></div>
  </fd-widget-panel>
</template>

<script lang="ts">
export default {
  name: 'WidgetContentStat'
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from 'vue'
import FdWidgetPanel from './panel.vue'
import * as echarts from 'echarts/core'
import { getContentStat } from '@/api-mock/dashboard'
import useECharts from '@/views/modules/dashboard/widgets/useECharts'

const option = {
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['阅读', '点赞', '评论', '转发']
  },
  grid: {
    left: '2%',
    right: '2%',
    bottom: '2%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [] as string[]
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '阅读',
      type: 'line',
      data: [] as number[]
    },
    {
      name: '点赞',
      type: 'line',
      data: [] as number[]
    },
    {
      name: '评论',
      type: 'line',
      data: [] as number[]
    },
    {
      name: '转发',
      type: 'line',
      data: [] as number[]
    }
  ],
  color: [],
  backgroundColor: 'transparent',
  darkMode: true,
  animationDelay: 500
}

let echartsCom = undefined as echarts.ECharts | undefined

const state = reactive({
  dateRange: 30 as number | 'custom',
  dateRangeCustom: [] as Date[]
})

const loadChartData = async () => {
  const data = await getContentStat(state.dateRange === 'custom' ? state.dateRangeCustom : Number(state.dateRange))
  option.xAxis.data = data.map((d) => d.date)
  option.series[0].data = data.map((d) => d.read)
  option.series[1].data = data.map((d) => d.like)
  option.series[2].data = data.map((d) => d.comment)
  option.series[3].data = data.map((d) => d.share)
  return option
}

const { chartElement, initChart, setChartData } = useECharts(option, loadChartData)

onMounted(async () => {
  echartsCom = initChart()
  await setChartData()
})

onUnmounted(() => {
  echartsCom?.dispose()
})

const onRadioGroupChange = async () => {
  state.dateRangeCustom = []
  await setChartData()
}

const onDatePickerChange = async () => {
  state.dateRange = 'custom'
  await setChartData()
}
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;
@use 'src/assets/style/mixin' as *;

.widget-content-stat {
  &__label {
    margin: 0 16px 0 0;
    color: var(--el-text-color-secondary);
  }

  &__radio {
    margin: 0 16px 0 0;
  }

  &__date-picker {
    width: 250px !important;
  }
}
</style>
