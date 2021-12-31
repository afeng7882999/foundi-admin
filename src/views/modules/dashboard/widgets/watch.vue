<template>
  <fd-widget-panel title="站点访问量" icon="analysis">
    <div ref="myEcharts" style="width: 100%; height: 300px"></div>
  </fd-widget-panel>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref, watch} from 'vue'
import FdWidgetPanel from './panel.vue'
import * as echarts from 'echarts/core'
import {BarChart, BarSeriesOption, LineSeriesOption} from 'echarts/charts'
import {
  DatasetComponent,
  DatasetComponentOption,
  GridComponent,
  GridComponentOption,
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  TransformComponent
} from 'echarts/components'
import {LabelLayout, UniversalTransition} from 'echarts/features'
import {CanvasRenderer} from 'echarts/renderers'
import {useStore} from 'vuex'
import {AllState} from '@/store'

type ECOption = echarts.ComposeOption<BarSeriesOption | LineSeriesOption | TitleComponentOption | TooltipComponentOption | GridComponentOption | DatasetComponentOption>

echarts.use([TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent, BarChart, LabelLayout, UniversalTransition, CanvasRenderer])

export default defineComponent({
  name: 'WidgetWatch',
  components: {FdWidgetPanel},
  setup() {
    const option: ECOption = {
      tooltip: {},
      xAxis: {
        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
      },
      yAxis: {},
      series: [
        {
          name: '销量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
        }
      ]
    }

    const myEcharts = ref()

    let echartsCom = undefined as echarts.ECharts
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

    return {
      myEcharts
    }
  }
})
</script>
