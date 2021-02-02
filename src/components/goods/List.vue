<template>
    <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <el-row :gutter=20>
            <el-col :span="8">
            <el-input placeholder="请输入内容" v-model='queryInfo.query' clearable @clear='getGoodList'>
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
            </el-input>
            </el-col>
            <el-col :span="4"> <el-button type="primary" @click="goAddPage()">添加商品</el-button></el-col>
        </el-row>
        <el-table :data="goodList" border stripe="">
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="goods_name" label="商品名称" >
        </el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）" width="95px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
            <template slot-scope="scope">
                {{scope.row.add_time | dateFormat}}
            </template>
        </el-table-column>
        <el-table-column prop="address" label="操作" width="120px">
        <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="goEditPage(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
        </template>
        </el-table-column>
        </el-table>

          <!-- 页码区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10,15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total" background
      >
      </el-pagination>
    </el-card>
    </div>
</template>
<script>
export default {
  data () {
    return {
      goodList: [],
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //   total
      total: 0
    }
  },
  created () {
    this.getGoodList()
  },
  methods: {
    //   根据分页获取列表
    async getGoodList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品列表失败')
      }
      this.$message.success('获取商品列表成功')
      //   console.log(res.data)
      this.total = res.data.total
      this.goodList = res.data.goods
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    handleCurrentChange (PageNum) {
      this.queryInfo.pagenum = PageNum
      this.getGoodList()
    },
    // 删除商品
    async removeById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getGoodList()
    },
    goAddPage () {
      this.$router.push('/goods/add')
    },
    async goEditPage (goodsId) {
      this.$router.push({ path: `/goods/edit/${goodsId}` })
      console.log(goodsId)
    }

  }
}
</script>
<style lang="less" scoped>

</style>
