<template>
  <div class="page-monitor-db fd-page" :style="docMinHeight">
    <fd-page-header v-show="showPageHeader"></fd-page-header>
    <div class="fd-page__form">
      <div class="page-monitor-db__act">
        <el-button v-if="hasAuth('monitor:dataSource:edit')" v-waves type="primary" @click="dbStatReset">重置</el-button>
      </div>
    </div>
    <div class="fd-page__table is-bordered">
      <el-tabs v-model="state.activeTab">
        <el-tab-pane label="首页" name="1"></el-tab-pane>
        <el-tab-pane label="数据源" name="2"></el-tab-pane>
        <el-tab-pane label="SQL监控" name="3"></el-tab-pane>
        <el-tab-pane label="SQL防火墙" name="4"></el-tab-pane>
        <el-tab-pane label="Web应用" name="5"></el-tab-pane>
        <el-tab-pane label="URI监控" name="6"></el-tab-pane>
        <el-tab-pane label="Spring监控" name="7"></el-tab-pane>
      </el-tabs>
      <div v-show="state.activeTab === '1'" class="page-monitor-db__sub-title">Stat Index:</div>
      <ul v-show="state.activeTab === '1'" class="db-stat-lst">
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">版本</span>
          <span class="db-stat-lst__value">{{ state.statBasic.Version }}</span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">驱动</span>
          <ul class="db-stat-lst__value">
            <li v-for="item in state.statBasic.Drivers" :key="item" class="db-stat-lst__value-item">{{ item }}</li>
          </ul>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">允许重置</span>
          <span class="db-stat-lst__value">{{ state.statBasic.ResetEnable }}</span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">重置次数</span>
          <span class="db-stat-lst__value">{{ state.statBasic.ResetCount }}</span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">Java版本</span>
          <span class="db-stat-lst__value">{{ state.statBasic.JavaVersion }}</span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">JVM名称</span>
          <span class="db-stat-lst__value">{{ state.statBasic.JavaVMName }}</span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">启动时间</span>
          <span class="db-stat-lst__value">{{ state.statBasic.StartTime }}</span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">classpath</span>
          <ul class="db-stat-lst__value">
            <li v-for="item in state.statBasic.JavaClassPath" :key="item" class="db-stat-lst__value-item">{{ item }}</li>
          </ul>
        </li>
      </ul>
      <div v-show="state.activeTab === '2'" class="page-monitor-db__sub-title">DataSourceStat List:</div>
      <el-tabs v-show="state.activeTab === '2'" type="card" model-value="tab0">
        <el-tab-pane v-for="(dataSource, i) in state.dataSourceList" :key="i" :label="dataSource.Name" :name="`tab${i}`">
          <ul class="db-stat-lst is-wide">
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 用户名</span>
              <span class="db-stat-lst__value">{{ dataSource.UserName }}</span>
              <span class="db-stat-lst__append">指定建立连接时使用的用户名</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 连接地址</span>
              <span class="db-stat-lst__value">{{ dataSource.URL }}</span>
              <span class="db-stat-lst__append">jdbc连接字符串</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 数据库类型</span>
              <span class="db-stat-lst__value">{{ dataSource.DbType }}</span>
              <span class="db-stat-lst__append">数据库类型</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 驱动类名</span>
              <span class="db-stat-lst__value">{{ dataSource.DriverClassName }}</span>
              <span class="db-stat-lst__append">jdbc驱动的类名</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* filter类名</span>
              <span class="db-stat-lst__value">{{ dataSource.FilterClassNames }}</span>
              <span class="db-stat-lst__append">filter的类名</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 获取连接时检测</span>
              <span class="db-stat-lst__value">{{ dataSource.TestOnBorrow }}</span>
              <span class="db-stat-lst__append">是否在获得连接后检测其可用性</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 空闲时检测</span>
              <span class="db-stat-lst__value">{{ dataSource.TestWhileIdle }}</span>
              <span class="db-stat-lst__append">是否在连接空闲一段时间后检测其可用性</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 连接放回连接池时检测</span>
              <span class="db-stat-lst__value">{{ dataSource.TestOnReturn }}</span>
              <span class="db-stat-lst__append">是否在连接放回连接池后检测其可用性</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 初始化连接大小</span>
              <span class="db-stat-lst__value">{{ dataSource.InitialSize }}</span>
              <span class="db-stat-lst__append">连接池建立时创建的初始化连接数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 最小空闲连接数</span>
              <span class="db-stat-lst__value">{{ dataSource.MinIdle }}</span>
              <span class="db-stat-lst__append">连接池中最小的活跃连接数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 最大连接数</span>
              <span class="db-stat-lst__value">{{ dataSource.MaxActive }}</span>
              <span class="db-stat-lst__append">连接池中最大的活跃连接数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 查询超时时间</span>
              <span class="db-stat-lst__value">{{ dataSource.QueryTimeout }}</span>
              <span class="db-stat-lst__append">查询超时时间</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 事务查询超时时间</span>
              <span class="db-stat-lst__value">{{ dataSource.TransactionQueryTimeout }}</span>
              <span class="db-stat-lst__append">事务查询超时时间</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 登录超时时间</span>
              <span class="db-stat-lst__value">{{ dataSource.LoginTimeout }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 连接有效性检查类名</span>
              <span class="db-stat-lst__value">{{ dataSource.ValidConnectionCheckerClassName }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* ExceptionSorter类名</span>
              <span class="db-stat-lst__value">{{ dataSource.ExceptionSorterClassName }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 默认autocommit设置</span>
              <span class="db-stat-lst__value">{{ dataSource.DefaultAutoCommit }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 默认只读设置</span>
              <span class="db-stat-lst__value">{{ dataSource.DefaultReadOnly }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* 默认事务隔离</span>
              <span class="db-stat-lst__value">{{ dataSource.DefaultTransactionIsolation }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* MinEvictableIdleTimeMillis</span>
              <span class="db-stat-lst__value">{{ dataSource.MinEvictableIdleTimeMillis }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* MaxEvictableIdleTimeMillis</span>
              <span class="db-stat-lst__value">{{ dataSource.MaxEvictableIdleTimeMillis }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* KeepAlive</span>
              <span class="db-stat-lst__value">{{ dataSource.KeepAlive }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* FailFast</span>
              <span class="db-stat-lst__value">{{ dataSource.FailFast }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* PoolPreparedStatements</span>
              <span class="db-stat-lst__value">{{ dataSource.PoolPreparedStatements }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* MaxPoolPreparedStatement- PerConnectionSize</span>
              <span class="db-stat-lst__value">{{ dataSource.MaxPoolPreparedStatementPerConnectionSize }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* MaxWait</span>
              <span class="db-stat-lst__value">{{ dataSource.MaxWait }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* MaxWaitThreadCount</span>
              <span class="db-stat-lst__value">{{ dataSource.MaxWaitThreadCount }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* LogDifferentThread</span>
              <span class="db-stat-lst__value">{{ dataSource.LogDifferentThread }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* UseUnfairLock</span>
              <span class="db-stat-lst__value">{{ dataSource.UseUnfairLock }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* InitGlobalVariants</span>
              <span class="db-stat-lst__value">{{ dataSource.InitGlobalVariants }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">* InitVariants</span>
              <span class="db-stat-lst__value">{{ dataSource.InitVariants }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">等待次数</span>
              <span class="db-stat-lst__value">{{ dataSource.NotEmptyWaitCount }}</span>
              <span class="db-stat-lst__append">获取连接时最多等待多少次</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">等待最大时长</span>
              <span class="db-stat-lst__value">{{ dataSource.NotEmptyWaitMillis }}</span>
              <span class="db-stat-lst__append">获取连接时最多等待多长时间</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">等待线程数量</span>
              <span class="db-stat-lst__value">{{ dataSource.WaitThreadCount }}</span>
              <span class="db-stat-lst__append">当前等待获取连接的线程数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">事务启动数</span>
              <span class="db-stat-lst__value">{{ dataSource.StartTransactionCount }}</span>
              <span class="db-stat-lst__append">事务开始的个数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">事务时间分布</span>
              <span class="db-stat-lst__value">{{ dataSource.TransactionHistogram }}</span>
              <span class="db-stat-lst__append">事务运行时间分布，分布区间为[0-10 ms, 10-100 ms, 100-1 s, 1-10 s, 10-100 s, >100 s]</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">池中连接数</span>
              <span class="db-stat-lst__value">{{ dataSource.PoolingCount }}</span>
              <span class="db-stat-lst__append">当前连接池中的数目</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">池中连接数峰值</span>
              <span class="db-stat-lst__value">{{ dataSource.PoolingPeak }}</span>
              <span class="db-stat-lst__append">连接池中数目的峰值</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">池中连接数峰值时间</span>
              <span class="db-stat-lst__value">{{ dataSource.PoolingPeakTime }}</span>
              <span class="db-stat-lst__append">连接池数目峰值出现的时间</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">活跃连接数</span>
              <span class="db-stat-lst__value">{{ dataSource.ActiveCount }}</span>
              <span class="db-stat-lst__append">当前连接池中活跃连接数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">活跃连接数峰值</span>
              <span class="db-stat-lst__value">{{ dataSource.ActivePeak }}</span>
              <span class="db-stat-lst__append">连接池中活跃连接数峰值</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">活跃连接数峰值时间</span>
              <span class="db-stat-lst__value">{{ dataSource.ActivePeakTime }}</span>
              <span class="db-stat-lst__append">活跃连接池峰值出现的时间</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">逻辑连接打开次数</span>
              <span class="db-stat-lst__value">{{ dataSource.LogicConnectCount }}</span>
              <span class="db-stat-lst__append">产生的逻辑连接建立总数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">逻辑连接关闭次数</span>
              <span class="db-stat-lst__value">{{ dataSource.LogicCloseCount }}</span>
              <span class="db-stat-lst__append">产生的逻辑连接关闭总数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">逻辑连接错误次数</span>
              <span class="db-stat-lst__value">{{ dataSource.LogicConnectErrorCount }}</span>
              <span class="db-stat-lst__append">产生的逻辑连接出错总数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">逻辑连接回收重用次数</span>
              <span class="db-stat-lst__value">{{ dataSource.LogicConnectionRecycleCount }}</span>
              <span class="db-stat-lst__append">逻辑连接回收重用次数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">物理连接打开次数</span>
              <span class="db-stat-lst__value">{{ dataSource.PhysicalConnectCount }}</span>
              <span class="db-stat-lst__append">产生的物理连接建立总数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">物理关闭数量</span>
              <span class="db-stat-lst__value">{{ dataSource.PhysicalCloseCount }}</span>
              <span class="db-stat-lst__append">产生的物理关闭总数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">物理连接错误次数</span>
              <span class="db-stat-lst__value">{{ dataSource.PhysicalConnectErrorCount }}</span>
              <span class="db-stat-lst__append">产生的物理连接失败总数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">执行数</span>
              <span class="db-stat-lst__value">{{ dataSource.ExecuteCount }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">错误数</span>
              <span class="db-stat-lst__value">{{ dataSource.ErrorCount }}</span>
              <span class="db-stat-lst__append"></span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">提交数</span>
              <span class="db-stat-lst__value">{{ dataSource.CommitCount }}</span>
              <span class="db-stat-lst__append">事务提交次数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">回滚数</span>
              <span class="db-stat-lst__value">{{ dataSource.RollbackCount }}</span>
              <span class="db-stat-lst__append">事务回滚次数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">真实PreparedStatement打开次数</span>
              <span class="db-stat-lst__value">{{ dataSource.RealPreparedStatementOpenCount }}</span>
              <span class="db-stat-lst__append">真实PreparedStatement打开次数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">真实PreparedStatement关闭次数</span>
              <span class="db-stat-lst__value">{{ dataSource.RealPreparedStatementClosedCount }}</span>
              <span class="db-stat-lst__append">真实PreparedStatement关闭次数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">PSCache访问次数</span>
              <span class="db-stat-lst__value">{{ dataSource.PSCacheAccessCount }}</span>
              <span class="db-stat-lst__append">PSCache访问总数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">PSCache命中次数</span>
              <span class="db-stat-lst__value">{{ dataSource.PSCacheHitCount }}</span>
              <span class="db-stat-lst__append">PSCache命中次数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">PSCache不命中次数</span>
              <span class="db-stat-lst__value">{{ dataSource.PSCacheMissCount }}</span>
              <span class="db-stat-lst__append">PSCache不命中次数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">连接持有时间分布</span>
              <span class="db-stat-lst__value">{{ dataSource.ConnectionHoldTimeHistogram }}</span>
              <span class="db-stat-lst__append">
                连接持有时间分布，分布区间为[0-1 ms, 1-10 ms, 10-100 ms, 100ms-1s, 1-10 s, 10-100 s, 100-1000 s, >1000 s]
              </span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">Clob打开次数</span>
              <span class="db-stat-lst__value">{{ dataSource.ClobOpenCount }}</span>
              <span class="db-stat-lst__append">Clob打开数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">Blob打开次数</span>
              <span class="db-stat-lst__value">{{ dataSource.BlobOpenCount }}</span>
              <span class="db-stat-lst__append">Blob打开数</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">KeepAlive检测次数</span>
              <span class="db-stat-lst__value">{{ dataSource.KeepAliveCheckCount }}</span>
              <span class="db-stat-lst__append">KeepAlive检测次数</span>
            </li>
          </ul>
        </el-tab-pane>
      </el-tabs>
      <el-row v-show="state.activeTab === '3'" :gutter="10">
        <el-col :span="6">
          <div class="page-monitor-db__sub-title">SQL Stat:</div>
        </el-col>
        <el-col :span="18">
          <div class="page-monitor-db__act is-in-tab">
            <span>刷新时间</span>
            <el-select v-model="state.sqlStatRefresh" placeholder="请选择" size="small" @change="sqlStatRefreshStart">
              <el-option label="停止" value="0"></el-option>
              <el-option label="5S" value="5"></el-option>
              <el-option label="10S" value="10"></el-option>
              <el-option label="20S" value="20"></el-option>
              <el-option label="30S" value="30"></el-option>
              <el-option label="60S" value="60"></el-option>
            </el-select>
            <el-button v-waves size="small" @click="sqlStatRefreshStop">停止刷新</el-button>
          </div>
        </el-col>
      </el-row>
      <el-table
        v-show="state.activeTab === '3'"
        key="table3"
        :data="state.sqlStatList"
        size="small"
        border
        style="width: 100%"
        stripe
        :default-sort="{ prop: 'ID', order: 'ascending' }"
      >
        <el-table-column label="N" prop="ID" width="60" sortable></el-table-column>
        <el-table-column label="SQL" prop="SQL" min-width="400" sortable :show-overflow-tooltip="true">
          <template #default="scope">
            <a class="page-monitor-db__link" @click="showFullSqlDlg(scope.row.ID)">{{ scope.row.SQL }}</a>
          </template>
        </el-table-column>
        <el-table-column label="执行数" prop="ExecuteCount" width="70" sortable></el-table-column>
        <el-table-column label="执行时间" prop="TotalTime" width="70" sortable></el-table-column>
        <el-table-column label="执行最慢" prop="MaxTimespan" width="70" sortable></el-table-column>
        <el-table-column label="事务执行" prop="InTransactionCount" width="70" sortable></el-table-column>
        <el-table-column label="错误数" prop="ErrorCount" width="70" sortable></el-table-column>
        <el-table-column label="更新行数" prop="EffectedRowCount" width="70" sortable></el-table-column>
        <el-table-column label="读取行数" prop="FetchRowCount" width="70" sortable></el-table-column>
        <el-table-column label="执行中" prop="RunningCount" width="70" sortable></el-table-column>
        <el-table-column label="最大并发" prop="ConcurrentMax" width="70" sortable></el-table-column>
        <el-table-column label="执行时间分布" prop="Histogram" width="120" :formatter="arrayFormatter"></el-table-column>
        <el-table-column
          label="执行+RS时分布"
          prop="ExecuteAndResultHoldTimeHistogram"
          width="120"
          :formatter="arrayFormatter"
        ></el-table-column>
        <el-table-column label="读取行分布" prop="FetchRowCountHistogram" width="120" :formatter="arrayFormatter"></el-table-column>
        <el-table-column label="更新行分布" prop="EffectedRowCountHistogram" width="120" :formatter="arrayFormatter"></el-table-column>
      </el-table>
      <div v-show="state.activeTab === '4'" class="page-monitor-db__sub-title">防御统计:</div>
      <ul v-show="state.activeTab === '4'" class="db-stat-lst is-wide">
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">检查次数</span>
          <span class="db-stat-lst__value">{{ state.wallData.checkCount }}</span>
          <span class="db-stat-lst__append"></span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">硬检查次数</span>
          <span class="db-stat-lst__value">{{ state.wallData.hardCheckCount }}</span>
          <span class="db-stat-lst__append"></span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">非法次数</span>
          <span class="db-stat-lst__value">{{ state.wallData.violationCount }}</span>
          <span class="db-stat-lst__append"></span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">黑名单命中次数</span>
          <span class="db-stat-lst__value">{{ state.wallData.blackListHitCount }}</span>
          <span class="db-stat-lst__append"></span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">黑名单长度</span>
          <span class="db-stat-lst__value">{{ state.wallData.blackListSize }}</span>
          <span class="db-stat-lst__append"></span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">白名单命中次数</span>
          <span class="db-stat-lst__value">{{ state.wallData.whiteListHitCount }}</span>
          <span class="db-stat-lst__append"></span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">白名单长度</span>
          <span class="db-stat-lst__value">{{ state.wallData.whiteListSize }}</span>
          <span class="db-stat-lst__append"></span>
        </li>
        <li class="db-stat-lst__item">
          <span class="db-stat-lst__title">语法错误次数</span>
          <span class="db-stat-lst__value">{{ state.wallData.syntaxErrorCount }}</span>
          <span class="db-stat-lst__append"></span>
        </li>
      </ul>
      <div v-show="state.activeTab === '4'" class="page-monitor-db__sub-title">表访问统计:</div>
      <el-table
        v-show="state.activeTab === '4'"
        :data="state.wallData.tables"
        size="small"
        border
        style="width: 100%"
        stripe
        :default-sort="{ prop: 'name', order: 'ascending' }"
      >
        <el-table-column label="表名" prop="name" min-width="200" :show-overflow-tooltip="true" sortable></el-table-column>
        <el-table-column label="Select数" prop="selectCount" min-width="80" sortable></el-table-column>
        <el-table-column label="SelectInto数" prop="selectIntoCount" min-width="80" sortable></el-table-column>
        <el-table-column label="Insert数" prop="insertCount" min-width="80" sortable></el-table-column>
        <el-table-column label="Update数" prop="updateCount" min-width="80" sortable></el-table-column>
        <el-table-column label="Delete数" prop="deleteCount" min-width="80" sortable></el-table-column>
        <el-table-column label="Truncate数" prop="truncateCount" min-width="80" sortable></el-table-column>
        <el-table-column label="Create数" prop="createCount" min-width="80" sortable></el-table-column>
        <el-table-column label="Alter数" prop="alterCount" min-width="80" sortable></el-table-column>
        <el-table-column label="Drop数" prop="dropCount" min-width="80" sortable></el-table-column>
        <el-table-column label="Replace数" prop="replaceCount" min-width="80"></el-table-column>
        <el-table-column label="读取行数" prop="fetchRowCount" min-width="80" sortable></el-table-column>
        <el-table-column label="读取行分布" prop="fetchRowHistogram" min-width="120" :formatter="arrayFormatter"></el-table-column>
        <el-table-column label="删除行数" prop="deleteDataCount" min-width="80" sortable></el-table-column>
        <el-table-column label="删除行分布" prop="deleteHisto" min-width="120" :formatter="arrayFormatter"></el-table-column>
        <el-table-column label="更新行数" prop="updateDataCount" min-width="80" sortable></el-table-column>
        <el-table-column label="更新行分布" prop="updateHisto" min-width="120" :formatter="arrayFormatter"></el-table-column>
      </el-table>
      <div v-show="state.activeTab === '4'" class="page-monitor-db__sub-title">函数调用统计:</div>
      <el-table
        v-show="state.activeTab === '4'"
        :data="state.wallData.functions"
        size="small"
        border
        style="width: 100%"
        stripe
        :default-sort="{ prop: 'name', order: 'ascending' }"
      >
        <el-table-column label="Function Name" prop="name" :show-overflow-tooltip="true" sortable></el-table-column>
        <el-table-column label="InvokeCount" prop="invokeCount" sortable></el-table-column>
      </el-table>
      <div v-show="state.activeTab === '4'" class="page-monitor-db__sub-title">SQL防御统计 - 白名单:</div>
      <el-table
        v-show="state.activeTab === '4'"
        :data="state.wallData.whiteList"
        size="small"
        border
        style="width: 100%"
        stripe
        :default-sort="{ prop: 'sql', order: 'ascending' }"
      >
        <el-table-column label="SQL" prop="sql" sortable min-width="400"></el-table-column>
        <el-table-column label="样本" prop="example" min-width="400"></el-table-column>
        <el-table-column label="执行数" prop="executeCount" sortable min-width="80"></el-table-column>
        <el-table-column label="执行出错数" prop="executeErrorCount" sortable min-width="80"></el-table-column>
        <el-table-column label="读取行数" prop="fetchRowCount" sortable min-width="80"></el-table-column>
        <el-table-column label="更新行数" prop="updateCount" sortable min-width="80"></el-table-column>
      </el-table>
      <div v-show="state.activeTab === '4'" class="page-monitor-db__sub-title">SQL防御统计 - 黑名单:</div>
      <el-table
        v-show="state.activeTab === '4'"
        :data="state.wallData.blackList"
        size="small"
        border
        style="width: 100%"
        stripe
        :default-sort="{ prop: 'sql', order: 'ascending' }"
      >
        <el-table-column label="SQL" prop="sql" sortable min-width="300"></el-table-column>
        <el-table-column label="样本" prop="example" min-width="300"></el-table-column>
        <el-table-column label="violationMessage" prop="violationMessage" sortable min-width="200"></el-table-column>
        <el-table-column label="执行数" prop="executeCount" sortable min-width="80"></el-table-column>
        <el-table-column label="读取行数" prop="fetchRowCount" sortable min-width="80"></el-table-column>
        <el-table-column label="更新行数" prop="updateCount" sortable min-width="80"></el-table-column>
      </el-table>
      <div v-show="state.activeTab === '5'" class="page-monitor-db__sub-title">WebAppStat List:</div>
      <el-tabs v-show="state.activeTab === '5'" type="card" model-value="tab0">
        <el-tab-pane v-for="(webApp, i) in state.webAppList" :key="i" :label="webApp.ContextPath" :name="`tab${i}`">
          <ul class="db-stat-lst is-wide">
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">ContextPath</span>
              <span class="db-stat-lst__value">{{ webApp.ContextPath }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">执行中</span>
              <span class="db-stat-lst__value">{{ webApp.RunningCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">最大并发</span>
              <span class="db-stat-lst__value">{{ webApp.ConcurrentMax }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">请求次数</span>
              <span class="db-stat-lst__value">{{ webApp.RequestCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">SessionCount</span>
              <span class="db-stat-lst__value">{{ webApp.SessionCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">事务提交数</span>
              <span class="db-stat-lst__value">{{ webApp.JdbcCommitCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">事务回滚数</span>
              <span class="db-stat-lst__value">{{ webApp.JdbcRollbackCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">Jdbc执行数</span>
              <span class="db-stat-lst__value">{{ webApp.JdbcExecuteCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">Jdbc时间</span>
              <span class="db-stat-lst__value">{{ webApp.JdbcExecuteTimeMillis }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">读取行数</span>
              <span class="db-stat-lst__value">{{ webApp.JdbcFetchRowCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">更新行数</span>
              <span class="db-stat-lst__value">{{ webApp.JdbcUpdateCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSMacOSXCount</span>
              <span class="db-stat-lst__value">{{ webApp.OSMacOSXCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSWindowsCount</span>
              <span class="db-stat-lst__value">{{ webApp.OSWindowsCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSLinuxCount</span>
              <span class="db-stat-lst__value">{{ webApp.OSLinuxCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSSymbianCount</span>
              <span class="db-stat-lst__value">{{ webApp.OSSymbianCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSFreeBSDCount</span>
              <span class="db-stat-lst__value">{{ webApp.OSFreeBSDCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSOpenBSDCount</span>
              <span class="db-stat-lst__value">{{ webApp.OSOpenBSDCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroidCount</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroidCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSWindows98Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSWindows98Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSWindowsXPCount</span>
              <span class="db-stat-lst__value">{{ webApp.OSWindowsXPCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSWindows2000Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSWindows2000Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSWindowsVistaCount</span>
              <span class="db-stat-lst__value">{{ webApp.OSWindowsVistaCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSWindows7Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSWindows7Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSWindows8Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSWindows8Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid15Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid15Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid16Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid16Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid20Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid20Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid21Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid21Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid22Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid22Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid23Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid23Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid30Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid30Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid31Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid31Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid32Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid32Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid40Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid40Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid41Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid41Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid42Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid42Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSAndroid43Count</span>
              <span class="db-stat-lst__value">{{ webApp.OSAndroid43Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">OSLinuxUbuntuCount</span>
              <span class="db-stat-lst__value">{{ webApp.OSLinuxUbuntuCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserIECount</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserIECount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserFirefoxCount</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserFirefoxCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserChromeCount</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserChromeCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserSafariCount</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserSafariCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserOperaCount</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserOperaCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserIE5Count</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserIE5Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserIE6Count</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserIE6Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserIE7Count</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserIE7Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserIE8Count</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserIE8Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserIE9Count</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserIE9Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BrowserIE10Count</span>
              <span class="db-stat-lst__value">{{ webApp.BrowserIE10Count }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">Browser360SECount</span>
              <span class="db-stat-lst__value">{{ webApp.Browser360SECount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">DeviceAndroidCount</span>
              <span class="db-stat-lst__value">{{ webApp.DeviceAndroidCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">DeviceIpadCount</span>
              <span class="db-stat-lst__value">{{ webApp.DeviceIpadCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">DeviceIphoneCount</span>
              <span class="db-stat-lst__value">{{ webApp.DeviceIphoneCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">DeviceWindowsPhoneCount</span>
              <span class="db-stat-lst__value">{{ webApp.DeviceWindowsPhoneCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BotCount</span>
              <span class="db-stat-lst__value">{{ webApp.BotCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BotBaiduCount</span>
              <span class="db-stat-lst__value">{{ webApp.BotBaiduCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BotYoudaoCount</span>
              <span class="db-stat-lst__value">{{ webApp.BotYoudaoCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BotGoogleCount</span>
              <span class="db-stat-lst__value">{{ webApp.BotGoogleCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BotMsnCount</span>
              <span class="db-stat-lst__value">{{ webApp.BotMsnCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BotBingCount</span>
              <span class="db-stat-lst__value">{{ webApp.BotBingCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BotSosoCount</span>
              <span class="db-stat-lst__value">{{ webApp.BotSosoCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BotSogouCount</span>
              <span class="db-stat-lst__value">{{ webApp.BotSogouCount }}</span>
            </li>
            <li class="db-stat-lst__item">
              <span class="db-stat-lst__title">BotYahooCount</span>
              <span class="db-stat-lst__value">{{ webApp.BotYahooCount }}</span>
            </li>
          </ul>
        </el-tab-pane>
      </el-tabs>
      <el-row v-show="state.activeTab === '6'" :gutter="10">
        <el-col :span="6">
          <div class="page-monitor-db__sub-title">Web URI Stat:</div>
        </el-col>
        <el-col :span="18">
          <div class="page-monitor-db__act is-in-tab">
            <span>刷新时间</span>
            <el-select v-model="state.webUriRefresh" placeholder="请选择" size="small" @change="webUriRefreshStart">
              <el-option label="停止" value="0"></el-option>
              <el-option label="5S" value="5"></el-option>
              <el-option label="10S" value="10"></el-option>
              <el-option label="20S" value="20"></el-option>
              <el-option label="30S" value="30"></el-option>
              <el-option label="60S" value="60"></el-option>
            </el-select>
            <el-button v-waves size="small" @click="webUriRefreshStop">停止刷新</el-button>
          </div>
        </el-col>
      </el-row>
      <el-table
        v-show="state.activeTab === '6'"
        key="table6"
        :data="state.webUriStatList"
        size="small"
        border
        style="width: 100%"
        stripe
        :default-sort="{ prop: 'URI', order: 'ascending' }"
      >
        <el-table-column label="URI" prop="URI" min-width="350" sortable :show-overflow-tooltip="true">
          <template #default="scope">
            <a class="page-monitor-db__link" @click="showWebUriDlg(scope.row.URI)">{{ scope.row.URI }}</a>
          </template>
        </el-table-column>
        <el-table-column label="请求次数" prop="RequestCount" width="70" sortable></el-table-column>
        <el-table-column label="请求时间（和）" prop="RequestTimeMillis" width="70" sortable></el-table-column>
        <el-table-column label="请求最慢（单次）" prop="RequestTimeMillisMax" width="70" sortable></el-table-column>
        <el-table-column label="执行中" prop="RunningCount" width="70" sortable></el-table-column>
        <el-table-column label="最大并发" prop="ConcurrentMax" width="70" sortable></el-table-column>
        <el-table-column label="Jdbc执行数" prop="JdbcExecuteCount" width="70" sortable></el-table-column>
        <el-table-column label="Jdbc出错数" prop="JdbcExecuteErrorCount" width="70" sortable></el-table-column>
        <el-table-column label="Jdbc时间" prop="JdbcExecuteTimeMillis" width="70" sortable></el-table-column>
        <el-table-column label="事务提交数" prop="JdbcCommitCount" width="70" sortable></el-table-column>
        <el-table-column label="事务回滚数" prop="JdbcRollbackCount" width="70" sortable></el-table-column>
        <el-table-column label="读取行数" prop="JdbcFetchRowCount" width="70" sortable></el-table-column>
        <el-table-column label="更新行数" prop="JdbcUpdateCount" width="70" sortable></el-table-column>
        <el-table-column label="区间分布" prop="Histogram" width="120" :formatter="arrayFormatter"></el-table-column>
      </el-table>
      <div v-show="state.activeTab === '7'" class="page-monitor-db__sub-title">Spring Stat:</div>
      <el-table
        v-show="state.activeTab === '7'"
        key="table7"
        :data="state.springStatList"
        size="small"
        border
        style="width: 100%"
        stripe
        :default-sort="{ prop: 'Class', order: 'ascending' }"
      >
        <el-table-column label="Class" prop="Class" min-width="300" sortable></el-table-column>
        <el-table-column label="Method" prop="Method" min-width="300" sortable></el-table-column>
        <el-table-column label="执行数" prop="ExecuteCount" width="70" sortable></el-table-column>
        <el-table-column label="执行时间" prop="ExecuteTimeMillis" width="70" sortable></el-table-column>
        <el-table-column label="执行中" prop="RunningCount" width="70" sortable></el-table-column>
        <el-table-column label="最大并发" prop="ConcurrentMax" width="70" sortable></el-table-column>
        <el-table-column label="Jdbc执行数" prop="JdbcExecuteCount" width="70" sortable></el-table-column>
        <el-table-column label="Jdbc时间" prop="JdbcExecuteTimeMillis" width="70" sortable></el-table-column>
        <el-table-column label="事务提交数" prop="JdbcCommitCount" width="70" sortable></el-table-column>
        <el-table-column label="事务回滚数" prop="JdbcRollbackCount" width="70" sortable></el-table-column>
        <el-table-column label="读取行数" prop="JdbcFetchRowCount" width="70" sortable></el-table-column>
        <el-table-column label="更新行数" prop="JdbcUpdateCount" width="70" sortable></el-table-column>
        <el-table-column label="区间分布" prop="Histogram" width="120" :formatter="arrayFormatter"></el-table-column>
      </el-table>
    </div>
    <full-sql-dialog ref="fullSqlDialog"></full-sql-dialog>
    <web-uri-detail-dialog ref="webUriDetailDialog"></web-uri-detail-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'PageMonitorDb'
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import usePage from '@/components/crud/use-page'
import request from '@/app/request'
import FullSqlDialog from './full-sql.vue'
import WebUriDetailDialog from './web-uri-detail.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const state = reactive({
  activeTab: '1',
  sqlStatRefresh: '0',
  sqlStatRefreshInterval: undefined as number | undefined,
  webUriRefresh: '0',
  webUriRefreshInterval: undefined as number | undefined,
  statBasicUrl: '/api/druid/basic.json',
  dataSourceUrl: '/api/druid/datasource.json',
  sqlStateUrl: '/api/druid/sql.json',
  wallUrl: '/api/druid/wall.json',
  webAppUrl: '/api/druid/webapp.json',
  webUriUrl: '/api/druid/weburi.json',
  springStatListUrl: '/api/druid/spring.json',
  resetAllUrl: '/api/druid/reset-all.json',
  statBasic: {} as any,
  dataSourceList: [] as any[],
  sqlStatList: [] as any[],
  wallData: {} as any,
  webAppList: [] as any[],
  webUriStatList: [] as any[],
  springStatList: [] as any[]
})

onMounted(() => {
  getData()
})

onUnmounted(() => {
  window.clearInterval(state.sqlStatRefreshInterval)
})

const getData = () => {
  getStatBasicData()
  getDataSourceData()
  getSqlStatList()
  getWallData()
  getWebAppList()
  getWebUriStatList()
  getSpringStatList()
}

const getStatBasicData = async () => {
  try {
    const { data } = await request({
      url: state.statBasicUrl,
      method: 'get'
    })
    state.statBasic = data.Content
    state.statBasic.JavaClassPath = textToArray(data.Content.JavaClassPath)
  } catch (e) {
    console.log(e)
  }
}

const getDataSourceData = async () => {
  try {
    const { data } = await request({
      url: state.dataSourceUrl,
      method: 'get'
    })
    state.dataSourceList = data.Content
  } catch (e) {
    console.log(e)
  }
}

const getSqlStatList = async () => {
  try {
    const { data } = await request({
      url: state.sqlStateUrl,
      method: 'get'
    })
    if (data.Content) {
      state.sqlStatList = data.Content
    }
  } catch (e) {
    console.log(e)
  }
}

const getWallData = async () => {
  try {
    const { data } = await request({
      url: state.wallUrl,
      method: 'get'
    })
    state.wallData = data.Content
    if (!state.wallData.tables) {
      state.wallData.tables = [] as any[]
    }
    if (!state.wallData.functions) {
      state.wallData.functions = [] as any[]
    }
  } catch (e) {
    console.log(e)
  }
}

const getWebAppList = async () => {
  try {
    const { data } = await request({
      url: state.webAppUrl,
      method: 'get'
    })
    if (data.Content) {
      state.webAppList = data.Content
    }
  } catch (e) {
    console.log(e)
  }
}

const getWebUriStatList = async () => {
  try {
    const { data } = await request({
      url: state.webUriUrl,
      method: 'get'
    })
    if (data.Content) {
      state.webUriStatList = data.Content
    }
  } catch (e) {
    console.log(e)
  }
}

const getSpringStatList = async () => {
  try {
    const { data } = await request({
      url: state.springStatListUrl,
      method: 'get'
    })
    if (data.Content) {
      state.springStatList = data.Content
    }
  } catch (e) {
    console.log(e)
  }
}

const fullSqlDialog = ref()
const showFullSqlDlg = (id: number) => {
  fullSqlDialog.value.init(id)
}

const webUriDetailDialog = ref()
const showWebUriDlg = (id: string) => {
  webUriDetailDialog.value.init(id)
}

const dbStatReset = async () => {
  try {
    await ElMessageBox.confirm('是否重置? 所有数据将清除！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request({
      url: state.resetAllUrl,
      method: 'get'
    })
    ElMessage({
      message: '操作成功',
      type: 'success',
      duration: 1500,
      onClose: async () => {
        await getData()
      }
    })
  } catch (e) {
    console.log(e)
  }
}

const sqlStatRefreshStart = () => {
  window.clearInterval(state.sqlStatRefreshInterval)
  let t = Number.parseInt(state.sqlStatRefresh)
  if (t !== 0) {
    state.sqlStatRefreshInterval = window.setInterval(() => {
      getSqlStatList()
    }, t * 1000)
  }
}

const sqlStatRefreshStop = () => {
  state.sqlStatRefresh = '0'
  window.clearInterval(state.sqlStatRefreshInterval)
}

const webUriRefreshStart = () => {
  window.clearInterval(state.webUriRefreshInterval)
  let t = Number.parseInt(state.webUriRefresh)
  if (t !== 0) {
    state.webUriRefreshInterval = window.setInterval(() => {
      getWebUriStatList()
    }, t * 1000)
  }
}

const webUriRefreshStop = () => {
  state.webUriRefresh = '0'
  window.clearInterval(state.webUriRefreshInterval)
}

const arrayFormatter = (row: any, column: any, cellValue: string[], index: number) => {
  return arrayToText(cellValue)
}

const textToArray = (text: string) => {
  return text.split(';')
}

const arrayToText = (array: string[]) => {
  if (array && array.length > 0) {
    return '[' + array.join(',') + ']'
  }
}

const { docMinHeight, showPageHeader, hasAuth } = usePage()
</script>

<style lang="scss">
@use 'src/assets/style/variable' as *;

.page-monitor-db {
  &__act {
    width: 100%;
    text-align: right;

    &.is-in-tab {
      padding-top: 12px;

      span {
        font-size: var(--el-font-size-small);
        padding-right: 10px;
      }

      .el-select {
        width: 100px;
        padding-right: 10px;
      }
    }
  }

  &__submenu-title {
    padding: 20px 0 10px 0;
    font-size: var(--el-font-size-large);
  }

  &__link {
    text-decoration: underline;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .fd-page__table {
    padding: 24px 24px;
  }
}

.db-stat-lst {
  margin: 0;
  padding: 0;
  color: var(--color-text-regular);
  list-style-type: none;

  &__item {
    display: flex;
    overflow: hidden;
    align-items: stretch;
    border: 1px solid var(--el-border-color-base);
    border-bottom: none;

    &:last-child {
      border-bottom: 1px solid var(--el-border-color-base);
    }
  }

  &__title {
    width: 100px;
    padding: 10px;
    flex-shrink: 0;
    vertical-align: middle;
    font-size: var(--el-font-size-small);
    font-weight: $font-weight-bold;
    border-right: 1px solid var(--el-border-color-base);
    background-color: var(--el-bg-color);
    box-sizing: border-box;
  }

  &__value {
    flex: 1;
    padding: 10px;
    font-size: var(--el-font-size-small);
    word-wrap: break-word;
    word-break: break-word;
  }

  &__value-item {
    padding-bottom: 5px;
    list-style-type: none;
  }

  &__append {
    width: 250px;
    padding: 10px;
    font-size: var(--el-font-size-small);
    flex-shrink: 0;
    border-left: 1px solid var(--el-border-color-base);
  }

  &.is-wide {
    .db-stat-lst__title {
      width: 250px;
    }
  }
}
</style>
