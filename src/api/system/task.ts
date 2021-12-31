import Api, { IResData } from '@/api'
import { AnyObject } from '@/utils'
import request from '@/app/request'
import { IDictItem } from '@/api/system/dict-item'

export interface ITask extends IResData {
  // 主键
  id: string
  // 任务名
  jobName: string
  // 任务分组
  jobGroup: string
  // 任务状态
  jobStatus: string
  // 任务是否并发
  isConcurrent: string
  // cron表达式
  cronExpression: string
  // 任务描述
  description: string
  // 任务执行时调用哪个类的方法 包名+类名
  beanClass: string
  // Spring bean
  springBean: string
  // 任务调用的方法名
  methodName: string
  // 创建时间
  createAt: string
  // 创建者
  createBy: string
  // 更新时间
  updateAt: string
  // 更新者
  updateBy: string
}

export const taskFields = {
  idField: 'id'
}

export const taskQuery = {
  jobName: undefined,
  jobStatus: undefined
}

export const TASK_STATUS_DICT = [
  { itemKey: '1', itemValue: '运行中' },
  { itemKey: '0', itemValue: '停止中' }
] as IDictItem[]

// api url
export const url = '/api/system/task'

// 获取单个系统任务
export const taskGetOne = async (id: string) => Api.getOne<ITask>(url, id)

// 获取系统任务列表
export const taskList = async (query?: AnyObject) => Api.getList<ITask>(url, query)

// 添加系统任务
export const taskPostOne = async (data: AnyObject) => Api.postOne(url, data)

// 编辑系统任务
export const taskPutOne = async (data: AnyObject) => Api.putOne(url, data)

// 删除系统任务
export const taskDel = async (ids: string[]) => Api.del(url, ids)

// 导出系统任务列表
export const taskExport = async (filename?: string, params?: AnyObject) =>
  Api.exportData(url + '/export', filename, params)

// 启动/停止任务
const changeTaskStatus = async (id: string, cmd: string) => {
  await request({
    url: url + '/status',
    method: 'get',
    params: {
      id: id,
      cmd: cmd
    }
  })
}

// 启动任务
export const taskStart = (id: string) => changeTaskStatus(id, 'start')

// 停止任务
export const taskStop = (id: string) => changeTaskStatus(id, 'stop')

// 立即运行任务
export const taskRunNow = async (id: string) => {
  await request({
    url: url + '/run',
    method: 'get',
    params: {
      id: id
    }
  })
}
