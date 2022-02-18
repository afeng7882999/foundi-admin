import { App } from 'vue'
import {
  ElAlert,
  ElAside,
  ElAutocomplete,
  ElAvatar,
  ElBacktop,
  ElBadge,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElButtonGroup,
  ElCalendar,
  ElCard,
  // ElCarousel,
  // ElCarouselItem,
  ElCascader,
  ElCascaderPanel,
  ElCheckbox,
  ElCheckboxButton,
  ElCheckboxGroup,
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElCollapseTransition,
  ElColorPicker,
  ElContainer,
  ElDatePicker,
  ElDialog,
  ElDivider,
  ElDrawer,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  // ElFooter,
  ElForm,
  ElFormItem,
  ElHeader,
  // ElIcon,
  ElImage,
  // ElImageViewer,
  ElInput,
  ElInputNumber,
  ElLink,
  // ElMain,
  ElMenu,
  ElMenuItem,
  ElMenuItemGroup,
  ElOption,
  ElOptionGroup,
  ElPageHeader,
  ElPagination,
  ElPopconfirm,
  ElPopover,
  ElPopper,
  // ElProgress,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElRate,
  ElRow,
  ElScrollbar,
  ElSelect,
  ElStep,
  ElSteps,
  ElSwitch,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElTimePicker,
  ElTimeSelect,
  ElTimeline,
  ElTimelineItem,
  ElTooltip,
  // ElTransfer,
  ElTree,
  ElUpload,
  ElSpace,
  // ElSkeleton,
  // ElSkeletonItem,
  // ElCheckTag,
  // ElResult,
  ElInfiniteScroll,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElDescriptions,
  ElDescriptionsItem
} from 'element-plus'
// import ElButton from '@/components/element-plus/button'
import zhCn from 'element-plus/lib/locale/lang/zh-cn'

const components = [
  ElAlert,
  ElAside,
  ElAutocomplete,
  ElAvatar,
  ElBacktop,
  ElBadge,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElButtonGroup,
  ElCalendar,
  ElCard,
  // ElCarousel,
  // ElCarouselItem,
  ElCascader,
  ElCascaderPanel,
  ElCheckbox,
  ElCheckboxButton,
  ElCheckboxGroup,
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElCollapseTransition,
  ElColorPicker,
  ElContainer,
  ElDatePicker,
  ElDialog,
  ElDivider,
  ElDrawer,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  // ElFooter,
  ElForm,
  ElFormItem,
  ElHeader,
  // ElIcon,
  ElImage,
  // ElImageViewer,
  ElInput,
  ElInputNumber,
  ElLink,
  // ElMain,
  ElMenu,
  ElMenuItem,
  ElMenuItemGroup,
  ElOption,
  ElOptionGroup,
  ElPageHeader,
  ElPagination,
  ElPopconfirm,
  ElPopper,
  // ElProgress,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElRate,
  ElRow,
  ElScrollbar,
  ElSelect,
  ElStep,
  ElSteps,
  ElSwitch,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElTimePicker,
  ElTimeSelect,
  ElTimeline,
  ElTimelineItem,
  ElTooltip,
  // ElTransfer,
  ElTree,
  ElUpload,
  ElSpace,
  // ElSkeleton,
  // ElSkeletonItem,
  // ElCheckTag,
  // ElResult,
  ElDescriptions,
  ElDescriptionsItem
]

const plugins = [ElInfiniteScroll, ElLoading, ElMessage, ElMessageBox, ElNotification, ElPopover]

export default function installElementPlus(app: App): void {
  app.config.globalProperties.$ELEMENT = { size: 'medium', zIndex: 3000, locale: zhCn }
  // @ts-ignore
  // app.provide(LocaleInjectionKey, localeProviderMaker(zhCn))
  components.forEach((component) => {
    app.use(component)
  })
  plugins.forEach((plugin) => {
    app.use(plugin)
  })
}
