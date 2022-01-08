import { AnyFunction, AnyObject } from '@/utils'
import { CUSTOM_THEME } from '@/components/theme-select/theme'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { nextTick, ref, watch } from 'vue'

import * as echarts from 'echarts/core'
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

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

export default function (option: AnyObject, optionLoadFunc: AnyFunction) {
  const chartElement = ref()
  const store = useStore<AllState>()
  const storeState = store.state as AllState

  const chartRef = ref<echarts.ECharts>()

  /**
   * 加载图表数据
   */
  const setChartData = async () => {
    chartRef.value?.showLoading({ text: '正在加载...' })
    const option = await optionLoadFunc()
    chartRef.value?.setOption(option)
    chartRef.value?.hideLoading()
  }

  /**
   * 设置图表主题色
   */
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
      chartRef.value?.setOption(option)
    })
  }

  /**
   * 图表初始化
   */
  const initChart = () => {
    chartRef.value = echarts.init(chartElement.value as HTMLElement)

    watch(
      () => storeState.app.docWidth,
      () => {
        chartRef.value?.resize()
      }
    )
    watch(
      () => storeState.app.sidebarMode,
      () => {
        nextTick(() => {
          chartRef.value?.resize()
        })
      },
      { deep: true }
    )
    watch(
      () => storeState.app.theme,
      () => setChartTheme()
    )

    console.log(chartRef.value)
    setChartTheme()
  }

  return {
    chartElement,
    chartRef,
    initChart,
    setChartData,
    setChartTheme
  }
}
