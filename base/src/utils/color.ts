/**
 * 两个颜色混合
 */
export function mix(color1: string, color2: string, weight: number): string {
  color1 = color1.replace(/#/g, '')
  color2 = color2.replace(/#/g, '')
  weight = typeof weight !== 'undefined' ? weight : 50
  let color = '#'

  for (let i = 0; i <= 5; i += 2) {
    const v1 = parseInt(color1.substring(i, i + 2), 16)
    const v2 = parseInt(color2.substring(i, i + 2), 16)
    let val = Math.round(v2 + (v1 - v2) * (weight / 100.0)).toString(16)
    if (val.length < 2) {
      val = '0' + val
    }
    color += val
  }

  return color
}

/**
 * 获取基于某个颜色的变亮、变暗颜色列表
 */
export function colorCluster(color: string, white: string, black: string): string[] {
  const clusters = [color]
  for (let i = 1; i <= 9; i++) {
    clusters.push(mix(white, color, i * 10))
  }
  for (let i = 1; i <= 9; i++) {
    clusters.push(mix(black, color, i * 10))
  }
  return clusters
}
