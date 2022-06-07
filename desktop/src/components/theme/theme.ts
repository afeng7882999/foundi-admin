import colorString from 'color-string'
import { colorCluster, mix } from '@b/utils/color'

export type Theme = Record<string, string>

// 默认暗色主题
export const DARK_THEME_DEFAULT = {
  'dark-mode': 'true',
  '--el-color-white': '#343A40',
  '--el-color-black': '#D2DEEA',
  '--el-text-color-primary': 'rgba(255, 255, 255, 0.8)',
  '--el-text-color-regular': 'rgba(255, 255, 255, 0.6)',
  '--el-text-color-secondary': 'rgba(255, 255, 255, 0.4)',
  '--el-text-color-placeholder': 'rgba(255, 255, 255, 0.3)',
  '--el-font-color-disabled-base': 'rgba(80, 80, 80, 1)',
  '--el-bg-color': 'rgba(43, 48, 52, 1)',
  '--el-border-color-base': 'rgba(182, 184, 190, 1)',
  '--el-border-color-light': 'rgba(162, 164, 169, 1)',
  '--el-border-color-lighter': 'rgba(134, 136, 140, 1)',
  '--el-border-color-extra-light': 'rgba(103, 104, 108, 1)',
  '--el-border-color-hover': 'rgba(227, 229, 235, 1)',
  '--el-body-background-color': '#2B3034'
}

/**
 * 处理主题
 */
export function _themeProcess(theme: Theme, useDefaultDark = false): Theme {
  let white = '#ffffff'
  let black = '#000000'

  if (theme['dark-mode']) {
    theme = _setThemeDark(theme, useDefaultDark)
  }

  if (theme['--el-color-white']) {
    white = theme['--el-color-white']
    theme['--el-color-white-rgb'] = colorString.get(white)!.value.slice(0, 3).join(', ')
  }
  if (theme['--el-color-black']) {
    black = theme['--el-color-black']
    theme['--el-color-black-rgb'] = colorString.get(black)!.value.slice(0, 3).join(', ')
  }

  let cluster = []
  const rgba = []
  if (theme['--el-color-black']) {
    cluster = colorCluster(theme['--el-color-black'], white, black)
    theme['--el-color-gray-02'] = mix(white, black, 98)
    theme['--el-color-gray-03'] = mix(white, black, 97)
    theme['--el-color-gray-05'] = mix(white, black, 95)
    theme['--el-color-gray-1'] = cluster[9]
    theme['--el-color-gray-2'] = cluster[8]
  }
  if (theme['--el-color-primary']) {
    cluster = colorCluster(theme['--el-color-primary'], white, black)
    theme['--el-color-primary-dark-1'] = cluster[10]
    theme['--el-color-primary-light-1'] = cluster[1]
    theme['--el-color-primary-light-2'] = cluster[2]
    theme['--el-color-primary-light-4'] = cluster[4]
    theme['--el-color-primary-light-5'] = cluster[5]
    theme['--el-color-primary-light-7'] = cluster[7]
    theme['--el-color-primary-light-8'] = cluster[8]
    theme['--el-color-primary-light-9'] = cluster[9]
  }
  if (theme['--el-color-success']) {
    cluster = colorCluster(theme['--el-color-success'], white, black)
    theme['--el-color-success-dark-1'] = cluster[10]
    theme['--el-color-success-light-1'] = cluster[1]
    theme['--el-color-success-light-2'] = cluster[2]
    theme['--el-color-success-light-4'] = cluster[4]
    theme['--el-color-success-light-5'] = cluster[5]
    theme['--el-color-success-light-7'] = cluster[6]
    theme['--el-color-success-light-8'] = cluster[8]
    theme['--el-color-success-light-9'] = cluster[9]
  }
  if (theme['--el-color-warning']) {
    cluster = colorCluster(theme['--el-color-warning'], white, black)
    theme['--el-color-warning-dark-1'] = cluster[10]
    theme['--el-color-warning-light-1'] = cluster[1]
    theme['--el-color-warning-light-2'] = cluster[2]
    theme['--el-color-warning-light-4'] = cluster[4]
    theme['--el-color-warning-light-5'] = cluster[5]
    theme['--el-color-warning-light-7'] = cluster[6]
    theme['--el-color-warning-light-8'] = cluster[8]
    theme['--el-color-warning-light-9'] = cluster[9]
  }
  if (theme['--el-color-danger']) {
    cluster = colorCluster(theme['--el-color-danger'], white, black)
    theme['--el-color-danger-dark-1'] = cluster[10]
    theme['--el-color-danger-light-1'] = cluster[1]
    theme['--el-color-danger-light-2'] = cluster[2]
    theme['--el-color-danger-light-4'] = cluster[4]
    theme['--el-color-danger-light-5'] = cluster[5]
    theme['--el-color-danger-light-7'] = cluster[6]
    theme['--el-color-danger-light-8'] = cluster[8]
    theme['--el-color-danger-light-9'] = cluster[9]
  }
  if (theme['--el-color-error']) {
    cluster = colorCluster(theme['--el-color-error'], white, black)
    theme['--el-color-error-dark-1'] = cluster[10]
    theme['--el-color-error-light-1'] = cluster[1]
    theme['--el-color-error-light-2'] = cluster[2]
    theme['--el-color-error-light-4'] = cluster[4]
    theme['--el-color-error-light-5'] = cluster[5]
    theme['--el-color-error-light-7'] = cluster[6]
    theme['--el-color-error-light-8'] = cluster[8]
    theme['--el-color-error-light-9'] = cluster[9]
  }
  if (theme['--el-color-info']) {
    cluster = colorCluster(theme['--el-color-info'], white, black)
    theme['--el-color-info-dark-1'] = cluster[10]
    theme['--el-color-info-light-1'] = cluster[1]
    theme['--el-color-info-light-2'] = cluster[2]
    theme['--el-color-info-light-4'] = cluster[4]
    theme['--el-color-info-light-5'] = cluster[5]
    theme['--el-color-info-light-7'] = cluster[6]
    theme['--el-color-info-light-8'] = cluster[8]
    theme['--el-color-info-light-9'] = cluster[9]
  }

  return theme
}

/**
 * 暗色主题
 */
function _setThemeDark(theme: Theme, useDefault?: boolean): Theme {
  const dark = useDefault ? Object.assign({}, theme, DARK_THEME_DEFAULT) : Object.assign({}, theme)
  const white = dark['--el-color-white']
  dark['--el-color-primary'] = mix(white, theme['--el-color-primary'], 20)
  dark['--el-color-success'] = mix(white, theme['--el-color-success'], 20)
  dark['--el-color-warning'] = mix(white, theme['--el-color-warning'], 20)
  dark['--el-color-danger'] = mix(white, theme['--el-color-danger'], 20)
  dark['--el-color-error'] = mix(white, theme['--el-color-error'], 20)
  dark['--el-color-info'] = mix(white, theme['--el-color-info'], 20)
  return dark
}

/**
 * 设置主题
 */
export function _setDocumentTheme(theme: Theme): void {
  document.documentElement.setAttribute('style', '')
  Object.keys(theme).forEach((k) => document.documentElement.style.setProperty(k, theme[k]))
  if (theme['dark-mode']) {
    document.body.classList.add('theme-dark')
  } else {
    document.body.classList.remove('theme-dark')
  }
  if (theme['sharp-mode']) {
    document.body.classList.add('theme-sharp')
  } else {
    document.body.classList.remove('theme-sharp')
  }
  if (theme['round-mode']) {
    document.body.classList.add('theme-round')
  } else {
    document.body.classList.remove('theme-round')
  }
}

// 自定义主题
export const CUSTOM_THEME = {
  '--el-color-white': '#ffffff',
  '--el-color-black': '#000000',
  '--el-color-primary': '#579ddb',
  '--el-color-success': '#4caf50',
  '--el-color-warning': '#ff9800',
  '--el-color-danger': '#f44034',
  '--el-color-error': '#f44034',
  '--el-color-info': '#9e9e9e',
  '--el-text-color-regular': 'rgba(#000000, 0.85)',
  '--el-bg-color': '#F5F7FA',
  '--el-border-color-base': '#dcdfe6',
  '--fd-sidebar-back-color': '#343a40',
  '--fd-sidebar-active-color': '#579ddb'
} as Theme

// 预定义的主题列表
export const DEFAULT_THEMES: Theme[] = [
  {
    name: '默认'
  },
  {
    name: '暗黑',
    'dark-mode': 'true',
    '--el-color-white': '#343A40',
    '--el-color-black': '#D2DEEA',
    '--el-color-primary': '#579DDB',
    '--el-color-success': '#4caf50',
    '--el-color-warning': '#ff9800',
    '--el-color-danger': '#f44034',
    '--el-color-error': '#f44034',
    '--el-color-info': '#9e9e9e',
    '--el-text-color-primary': 'rgba(255, 255, 255, 0.8)',
    '--el-text-color-regular': 'rgba(255, 255, 255, 0.6)',
    '--el-text-color-secondary': 'rgba(255, 255, 255, 0.4)',
    '--el-text-color-placeholder': 'rgba(255, 255, 255, 0.3)',
    '--el-font-color-disabled-base': 'rgba(80, 80, 80, 1)',
    '--el-bg-color': 'rgba(43, 48, 52, 1)',
    '--el-border-color-base': 'rgba(182, 184, 190, 1)',
    '--el-border-color-light': 'rgba(162, 164, 169, 1)',
    '--el-border-color-lighter': 'rgba(134, 136, 140, 1)',
    '--el-border-color-extra-light': 'rgba(103, 104, 108, 1)',
    '--el-border-color-hover': 'rgba(227, 229, 235, 1)',
    '--el-body-bg-color': '#2B3034',
    '--fd-app-tags-bg-color': '#454D55',
    '--fd-app-title-bg-color': '#454D55',
    '--fd-sidebar-back-color': 'rgba(28, 30, 51, 1)',
    '--fd-sidebar-active-color': '#579ddb',
    '--fd-sidebar-active-hover-color': '#579ddb'
  },
  {
    name: '火焰',
    '--fd-sidebar-back-color': 'rgba(72, 51, 66, 1)',
    '--fd-sidebar-active-color': 'rgba(203, 163, 99, 1)',
    '--fd-sidebar-active-hover-color': 'rgba(203, 163, 99, 1)',
    '--el-color-primary': '#D96A3A',
    '--el-color-danger': '#C8473B',
    '--el-color-error': '#C8473B',
    '--el-color-warning': '#D09A0C',
    '--el-color-success': '#52955B'
  },
  {
    name: '月光',
    '--fd-sidebar-back-color': 'rgba(28, 30, 51, 1)',
    '--fd-sidebar-active-color': 'rgba(174, 149, 119, 1)',
    '--fd-sidebar-active-hover-color': 'rgba(174, 149, 119, 1)',
    '--el-color-primary': '#314671',
    '--el-color-danger': '#C8473B',
    '--el-color-error': '#C8473B',
    '--el-color-warning': '#D09A0C',
    '--el-color-success': '#52955B',
    '--el-body-bg-color': '#efeef5'
  },
  {
    name: '糖果',
    'round-mode': 'true',
    '--el-color-primary': '#f75b5c',
    '--el-color-success': '#00aa90',
    '--el-color-warning': '#e3a903',
    '--el-color-danger': '#d9352c',
    '--el-color-error': '#d9352c',
    '--el-color-info': '#9e9e9e',
    '--fd-sidebar-back-color': '#612a54',
    '--fd-sidebar-active-color': '#fb7471',
    '--fd-sidebar-active-hover-color': '#fb7471',
    '--el-border-radius-base': '20px',
    '--el-border-radius-small': '20px'
  },
  {
    name: '雾松',
    'sharp-mode': 'true',
    '--el-color-primary': '#244b4a',
    '--fd-sidebar-back-color': '#3c5945',
    '--fd-sidebar-active-color': '#79a598',
    '--fd-sidebar-active-hover-color': '#79a598',
    '--el-border-radius-base': '0px',
    '--el-border-radius-small': '0px'
    // '--el-body-bg-color': '#ffffff'
  }
]

/**
 * 处理主题
 */
export function themeProcess(theme: Theme, useDefaultDark = false): Theme {
  const result = _themeProcess(theme, useDefaultDark)
  if (result['--fd-sidebar-back-color']) {
    const rgba = colorString.get(theme['--fd-sidebar-back-color'])!.value
    if (theme['--fd-sidebar-bg-img'] && theme['--fd-sidebar-bg-img'] !== 'none') {
      theme['--fd-sidebar-bg-color'] = colorString.to.rgb(rgba)
    } else {
      theme['--fd-sidebar-bg-color'] = colorString.to.rgb(rgba.slice(0, 3), rgba[3] * 0.77)
    }
  }
  return result
}

/**
 * 设置全局主题
 */
export function setDocumentTheme(theme: Theme): void {
  const docTheme = {} as Theme
  for (const key in theme) {
    if (!key.startsWith('--fd-sidebar-')) {
      docTheme[key] = theme[key]
    }
  }
  _setDocumentTheme(docTheme)
}

/**
 * 设置sidebar主题
 */
export function setSidebarTheme(sidebarEl: HTMLElement, theme: Theme): void {
  const sidebarTheme = {} as Theme
  for (const key in theme) {
    if (!key.startsWith('--fd-sidebar-')) {
      sidebarTheme[key] = theme[key]
    }
  }
  sidebarEl.setAttribute('style', '')
  Object.keys(theme).forEach((k) => sidebarEl.style.setProperty(k, theme[k]))
}
