import { CUSTOM_THEME } from '@/components/theme/theme'
import { useStore } from '@/store'
import { nextTick, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { UniversalTransition } from 'echarts/features'
import { AnyFunction, Indexable } from '@b/common/types'

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

export default function (option: Indexable, optionLoadFunc: AnyFunction) {
  const chartElement = ref()
  let chart = undefined as echarts.ECharts | undefined
  let theme = 'light'

  const store = useStore()
  const storeState = store.state

  /**
   * 加载图表数据
   */
  const setChartData = async () => {
    // const mask = theme === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.05)'
    const text = theme === 'light' ? 'rgba(36, 36, 36, 0.85)' : 'rgba(255, 255, 255, 0.6)'
    chart?.showLoading({ text: '正在加载...', textColor: text, maskColor: 'transparent' })
    const option = await optionLoadFunc()
    chart?.setOption(option)
    chart?.hideLoading()
  }

  /**
   * 设置图表主题色
   */
  const setChartTheme = () => {
    const names = ['--el-color-primary', '--el-color-success', '--el-color-warning', '--el-color-danger', '--el-color-info']
    const color = [] as string[]
    names.forEach((n) => {
      if (storeState.theme.theme && storeState.theme.theme[n]) {
        color.push(storeState.theme.theme[n])
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
  const initChart = () => {
    theme = storeState.theme.theme && storeState.theme.theme['dark-mode'] === 'true' ? 'dark' : 'light'
    chart = echarts.init(chartElement.value as HTMLElement, theme)
    setChartTheme()

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
      () => storeState.theme.theme,
      () => {
        theme = storeState.theme.theme && storeState.theme.theme['dark-mode'] === 'true' ? 'dark' : 'light'
        chart?.dispose()
        chart = echarts.init(chartElement.value as HTMLElement, theme)
        setChartTheme()
      }
    )

    return chart
  }

  return {
    chartElement,
    initChart,
    setChartData,
    setChartTheme
  }
}
