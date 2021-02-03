<template>
    <div>
        <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
           <!-- 2为ECharts准备一个具备大小（宽高）的Dom -->
        <div id="main" style="width:600px;height:400px"></div>
    </el-card>
    </div>
</template>
<script>
// 1导入echarts
import echarts from 'echarts'
import _ from 'loadsh'
export default {
  data () {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {

  },
  //  此时页面上的元素已经被渲染完毕了
  async mounted () {
    //  3 基于准备好的dom 元素 初始化echarts 实例
    var myChart = echarts.init(document.getElementById('main'))
    // 4准备数据和配置项
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线数据失败')
    }
    // 5展示数据
    var result = _.merge(this.options, res.data)
    myChart.setOption(result)
    console.log(result)
  },
  methods: {

  }
}
</script>
<style lang="less" scoped>

</style>
