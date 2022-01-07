<template>
  <fd-widget-panel class="widget-visitor" title="作品数据趋势" icon="analysis">
    <template #action>
      <span class="widget-visitor__label">时间</span>
      <el-radio-group v-model="dateRange" class="widget-visitor__radio" size="mini" @change="onRadioGroupChange">
        <el-radio-button label="7">7天</el-radio-button>
        <el-radio-button label="30">30天</el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-model="dateRangeCustom"
        class="widget-visitor__date-picker"
        size="mini"
        :default-time="[new Date('0 0:0:0'), new Date('0 23:59:59')]"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        range-separator="-"
        start-placeholder="开始日期"
        type="daterange"
        @change="onDatePickerChange"
      ></el-date-picker>
    </template>
    <div ref="myEcharts" style="width: 100%; height: 300px"></div>
  </fd-widget-panel>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, reactive, ref, toRefs, watch } from 'vue'
import FdWidgetPanel from './panel.vue'
import * as echarts from 'echarts/core'
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { getContentStat } from '@/api-mock/dashboard'
import { CUSTOM_THEME } from '@/components/theme-select/theme'
import useECharts from '@/views/modules/dashboard/widgets/useECharts'

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition
])

export default defineComponent({
  name: 'WidgetVisitor',
  components: { FdWidgetPanel },
  setup() {
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['阅读', '点赞', '评论', '转发']
      },
      grid: {
        left: '1%',
        right: '1%',
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
      color: [] as string[],
      animationDelay: 500
    }

    const myEcharts = ref()

    const state = reactive({
      dateRange: 7 as number | 'custom',
      dateRangeCustom: [] as Date[]
    })

    let echartsCom = undefined as echarts.ECharts | undefined
    const initChart = () => {
      echartsCom = echarts.init(myEcharts.value as HTMLElement)
      echartsCom.setOption(option)
    }

    const setChart = async () => {
      if (echartsCom) {
        echartsCom.showLoading({ text: '正在加载...' })
        const data = await getContentStat(
          state.dateRange === 'custom' ? state.dateRangeCustom : Number(state.dateRange)
        )
        option.xAxis.data = data.map((d) => d.date)
        option.series[0].data = data.map((d) => d.read)
        option.series[1].data = data.map((d) => d.like)
        option.series[2].data = data.map((d) => d.comment)
        option.series[3].data = data.map((d) => d.share)
        echartsCom.setOption(option)
        echartsCom.hideLoading()
      }
    }

    const setChartTheme = () => {
      const names = [
        '--el-color-primary',
        '--el-color-success',
        '--el-color-warning',
        '--el-color-danger',
        '--el-color-info'
      ]
      const color = [] as string[]
      names.forEach((n) => {
        if (storeState.app.theme && storeState.app.theme[n]) {
          color.push(storeState.app.theme[n])
        } else {
          color.push(CUSTOM_THEME[n])
        }
        option.color = color
        echartsCom?.setOption(option)
      })
    }

    onMounted(async () => {
      initChart()
      setChartTheme()
      await setChart()
    })

    const store = useStore<AllState>()
    const storeState = store.state as AllState
    watch(
      () => storeState.app.docWidth,
      () => {
        echartsCom?.resize()
      }
    )
    watch(
      () => storeState.app.sidebarMode,
      () => {
        nextTick(() => {
          echartsCom?.resize()
        })
      },
      { deep: true }
    )
    watch(
      () => storeState.app.theme,
      () => setChartTheme()
    )

    const onRadioGroupChange = async () => {
      state.dateRangeCustom = []
      await setChart()
    }

    const onDatePickerChange = async () => {
      state.dateRange = 'custom'
      await setChart()
    }

    return {
      myEcharts,
      ...toRefs(state),
      onRadioGroupChange,
      onDatePickerChange
    }
  }
})
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;

.widget-visitor {
  &__label {
    margin: 0 15px 0 0;
    color: var(--el-text-color-secondary);
  }

  &__radio {
    margin: 0 15px 0 0;
  }

  &__date-picker {
    width: 250px !important;
  }
}
</style>
