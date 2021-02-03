<template>
    <div>
        <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <el-row >
            <el-col :span=8>
            <el-input placeholder="请输入内容" v-model="queryInfo.query"  @keydown.enter.native = "getOrderList" @clear = "getOrderList" clearable >
            <el-button slot="append" icon="el-icon-search" @click = "getOrderList"></el-button>
            </el-input>
            </el-col>
        </el-row>
        <el-table border stripe  :data="OrderList">
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="订单编号" prop="order_number"></el-table-column>
            <el-table-column label="订单价格" prop="order_price"></el-table-column>
            <el-table-column label="是否付款" prop="pay_status">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.pay_status==='1'">已付款</el-tag>
                    <el-tag v-else type="success">未付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="下单时间" prop="create_time">
                <template slot-scope="scope">
                    {{scope.row.create_time |dateFormat}}
                </template>
            </el-table-column>
            <el-table-column label="是否发货" prop="is_send">
            </el-table-column>
            <el-table-column label="操作" >
            <template slot-scope="scope">
                <el-tooltip effect = "dark" content = "修改订单地址" placement = "top" :enterable = "false">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddress"></el-button>
                </el-tooltip>
                <el-tooltip effect = "dark" content = "物流信息" placement = "top" :enterable = "false">
                  <el-button type="success" icon="el-icon-location" size="mini" @click='showProgress'></el-button>
                </el-tooltip>
                <el-tooltip effect = "dark" content = "查看订单" placement = "top" :enterable = "false">
                  <el-button icon="el-icon-view" type="danger" size="mini" @click='showOrderInfo(scope.row.order_id)'></el-button>
                </el-tooltip>
            </template>
            </el-table-column>
        </el-table>

        <!-- 页码区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page=this.queryInfo.pagenum
      :page-sizes="[5, 10, 15, 20]"
      :page-size=this.queryInfo.pagesize
      layout="total, sizes, prev, pager, next, jumper"
      :total="400">
    </el-pagination>
    </el-card>

    <!-- 弹出省市县地址 -->
    <el-dialog
  title="修改地址"
  :visible.sync="addressVisible"
  width="50%" @close=addressClosed>
    <el-form ref="addressFormRef" :model="addressForm" label-width="80px" :rules="addressFormRules">
  <el-form-item label="省市县" prop="address1">
     <el-cascader
    v-model="addressForm.address1"
    :options="cityData"
    :props="{ expandTrigger: 'hover' }">
    </el-cascader>
  </el-form-item>
  <el-form-item label="详细地址" prop="address2">
    <el-input v-model="addressForm.address2"></el-input>
  </el-form-item>
    </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addressVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressVisible = false">确 定</el-button>
  </span>
   </el-dialog>
   <!-- 快递物流信息 -->
   <el-dialog title="物流进度" :visible.sync="progressVisble" width="50%">
  <el-timeline >
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
   </el-dialog>

   <!-- 查看订单的对话框 -->
    <el-dialog title="订单信息" :visible.sync="orderInfoVisible" width="50%">
        <!-- 内容主体区域 -->
        <p>订单编号: {{this.OrderInfo.order_number}}</p>
        <p>订单价格: {{this.OrderInfo.order_price}}</p>
        <p>是否付款:
             <el-tag v-if="this.OrderInfo.pay_status==='1'">已付款</el-tag>
             <el-tag v-else type="success">未付款</el-tag>
        </p>
        <p>下单时间: {{this.OrderInfo.create_time |dateFormat}}</p>
        <p>是否发货: {{this.OrderInfo.is_send}}</p>
    </el-dialog>
    </div>
</template>
<script>
import cityData from './citydata'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      OrderList: [],
      total: 0,
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [{ required: true, message: '请选择', trigger: blur }],
        address2: [{ required: true, message: '请填写', trigger: blur }]
      },
      cityData,
      progressVisble: false,
      progressInfo: [],
      OrderInfo: {},
      // 查看订单的对话框
      orderInfoVisible: false

    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.OrderList = res.data.goods
      this.total = res.data.total
      console.log(this.OrderList)
    },
    handleSizeChange (NewSize) {
      this.queryInfo.pagesize = NewSize
      this.getOrderList()
    },
    handleCurrentChange (PageNum) {
      this.queryInfo.pagenum = PageNum
      this.getOrderList()
    },
    showAddress () {
      this.addressVisible = true
    },
    addressClosed () {
      this.addressForm = {}
    },
    async showProgress () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error('获取快递信息失败')
      console.log(res.data)
      this.progressVisble = true
      this.progressInfo = res.data
    },
    async showOrderInfo (orderId) {
      const { data: res } = await this.$http.get('orders/' + orderId)
      if (res.meta.status !== 200) {
        this.$message.error('获取失败')
      }
      this.OrderInfo = res.data
      this.orderInfoVisible = true
    }
  }
}
</script>
<style lang="less" scoped>

</style>
