<template>
  <fd-widget-panel class="widget-region" title="作品访问区域" icon="analysis">
    <div ref="myEcharts" style="width: 100%; height: 500px"></div>
  </fd-widget-panel>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs, watch } from 'vue'
import FdWidgetPanel from './panel.vue'
import * as echarts from 'echarts/core'
import {
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
  TitleComponent,
  TitleComponentOption,
  ToolboxComponent,
  ToolboxComponentOption,
  TooltipComponent,
  TooltipComponentOption
} from 'echarts/components'
import { LineChart, LineSeriesOption } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { useStore } from 'vuex'
import { AllState } from '@/store'

type EChartsOption = echarts.ComposeOption<
  TitleComponentOption | ToolboxComponentOption | TooltipComponentOption | GridComponentOption | LegendComponentOption | LineSeriesOption
>

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
  name: 'WidgetRegion',
  components: { FdWidgetPanel },
  setup() {
    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['阅读', '点赞', '评论', '转发']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['2021-11-11', '2021-11-12', '2021-11-13', '2021-11-14', '2021-11-15', '2021-11-16', '2021-11-17']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '阅读',
          type: 'line',
          stack: 'Total',
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '点赞',
          type: 'line',
          stack: 'Total',
          data: [220, 182, 191, 234, 290, 330, 310]
        },
        {
          name: '评论',
          type: 'line',
          stack: 'Total',
          data: [150, 232, 201, 154, 190, 330, 410]
        },
        {
          name: '转发',
          type: 'line',
          stack: 'Total',
          data: [320, 332, 301, 334, 390, 330, 320]
        }
      ]
    }

    const myEcharts = ref()

    const state = reactive({
      dateRange: '7d' as '7d' | '30d' | 'custom',
      dateRangeCustom: [] as string[]
    })

    let echartsCom = undefined as echarts.ECharts | undefined
    const initChart = () => {
      echartsCom = echarts.init(myEcharts.value as HTMLElement)
      echartsCom.setOption(option)
    }
    onMounted(() => {
      initChart()
    })

    const store = useStore<AllState>()
    const storeState = store.state as AllState
    watch(
      () => storeState.app.docWidth,
      () => {
        echartsCom?.resize()
      }
    )

    const onRadioGroupChange = () => {
      state.dateRangeCustom = []
    }

    const onDatePickerChange = () => {
      state.dateRange = 'custom'
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
