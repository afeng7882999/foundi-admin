import { AnyFunction, AnyObject } from '@/utils'
import { CUSTOM_THEME } from '@/components/theme-select/theme'
import { useStore } from 'vuex'
import { AllState } from '@/store'
import { nextTick, watch } from 'vue'
import * as echarts from 'echarts/core'
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { UniversalTransition } from 'echarts/features'

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
  const store = useStore<AllState>()
  const storeState = store.state as AllState

  /**
   * 加载图表数据
   */
  const setChartData = async (chart: echarts.ECharts | undefined) => {
    chart?.showLoading({ text: '正在加载...' })
    const option = await optionLoadFunc()
    chart?.setOption(option)
    chart?.hideLoading()
  }

  /**
   * 设置图表主题色
   */
  const setChartTheme = (chart: echarts.ECharts | undefined) => {
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
      chart?.setOption(option)
    })
  }

  /**
   * 图表初始化
   */
  const initChart = (chart: echarts.ECharts | undefined) => {
    watch(
      () => storeState.app.docWidth,
      () => {
        chart?.resize()
      }
    )
    watch(
      () => storeState.app.sidebarMode,
      () => {
        nextTick(() => {
          chart?.resize()
        })
      },
      { deep: true }
    )
    watch(
      () => storeState.app.theme,
      () => setChartTheme(chart)
    )

    setChartTheme(chart)
  }

  return {
    initChart,
    setChartData,
    setChartTheme
  }
}
