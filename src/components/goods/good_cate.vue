<template>
    <div>   <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
     <el-card class="box-card">
         <el-row>
             <el-col><el-button type="primary" @click="showaddCateDialog">添加分类</el-button></el-col>
         </el-row>
         <tree-table  class="treeTable" :data="goodcateList" :columns="columns" :selection-type='false' :expand-type='false' show-index index-text='#' border>
             <!-- 模板:是否有效性 -->
             <template slot='isok' slot-scope="scope">
                 <i class="el-icon-success" v-if='scope.row.cat_deleted===false' style=" color:lightgreen "></i>
                 <i class="el-icon-error" v-else style=" color:red "></i>
             </template>
             <!-- 模板:等级 -->
             <template slot='order' slot-scope="scope">
                 <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
                 <el-tag type='success' v-else-if="scope.row.cat_level===1">二级</el-tag>
                 <el-tag type="warning" v-else>三级</el-tag>
             </template>
             <!-- 操作 -->
             <template slot-scope="scope" slot="operate">
                 <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
                 <el-button type="danger" icon="el-icon-delete" size="mini" @click="delelteCate(scope.row.cat_id)">删除</el-button>
             </template>
         </tree-table>
         <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
        <!-- 添加分类对话框 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addCateDialog"
        width="50%" @close=addCateDialogClosed
        >
        <el-form ref="addCateRef" :model="addCateform" :rules="addCateRules" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCateform.cat_name"></el-input>
        </el-form-item>
         <el-form-item label="父级分类:" >
              <el-cascader
                v-model="selectKeys"
                :options="parentCateList"
                :props='cascaderProps'
                @change="changeParentCate" clearable>
                </el-cascader>
        </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialog = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 编辑分类对话框 -->
        <el-dialog
        title="编辑分类"
        :visible.sync="editCateDialog"
        width="50%"
        >
        <el-form ref="editCateRef" :model="editCateform" :rules="editCateRules" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="editCateform.cat_name"></el-input>
        </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editCateDialog = false">取 消</el-button>
            <el-button type="primary" @click=editCate(editCateform.cat_id)>确 定</el-button>
        </span>
        </el-dialog>
     </el-card>
    </div>
</template>
<script>
export default {
  data () {
    return {
      goodcateList: [],
      queryInfo: {
        type: '[1,2,3]',
        pagenum: 1,
        pagesize: 5
      },
      // 为table 指定列
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        prop: 'cat_delete',
        // 表示，将当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用模板名称
        template: 'isok'

      }, {
        label: '排序',
        // 表示，将当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用模板名称
        template: 'order'
      }, {
        label: '操作',
        type: 'template',
        template: 'operate'
      }],
      total: 0,
      //  控制添加分类对话框显示
      addCateDialog: false,
      addCateform: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0

      },
      addCateRules: {
        cat_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      //   保存父级分类
      parentCateList: [],
      selectKeys: [],
      //   指定级联配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      // 控制编辑对话框的显示与否
      editCateDialog: false,
      editCateform: {
        cat_name: ''
      },
      editCateRules: {
        cat_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getGoodsCate()
  },
  methods: {
    async getGoodsCate () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('获取分类列表失败')
      }
      this.goodcateList = res.data.result
      console.log(this.goodcateList)
      this.total = res.data.total
    },
    // handleSizeChange 监听pagesize 改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsCate()
    },
    // 监听pagenum 改变
    handleCurrentChange (newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getGoodsCate()
    },
    // 监听添加分类按钮
    showaddCateDialog () {
      // 获取父级分类的列表
      this.getParentCateList()
      // 再打开对话框
      this.addCateDialog = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类失败')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    changeParentCate () {
      console.log(this.selectKeys)
      //  如果selectKeys数组中的Length 大于0,那么就证明选中父级分类
      // 反之没有选中父级分类
      if (this.selectKeys.length > 0) {
        //   父级分类id
        this.addCateform.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        // 当前分类的id
        this.addCateform.cat_level = this.selectKeys.length
        return
      }
      //   父级分类id
      this.addCateform.cat_pid = 0
      // 当前分类的id
      this.addCateform.cat_level = 0
    },
    // 重置表单内容
    addCateDialogClosed () {
      this.$refs.addCateRef.resetFields()
      this.selectKeys = []
      this.addCateform.cat_pid = 0
      this.addCateform.cat_level = 0
    },
    // 添加分类
    addCate () {
    //   console.log(this.addCateform)
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateform)
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getGoodsCate()
        this.addCateDialog = false
      })
    },
    // 查询当前的分类数据并显示在输入框
    async showEditCateDialog (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return
      this.editCateDialog = true
      this.editCateform = res.data
    },
    // 提交编辑更改分类名称
    editCate (id) {
      this.$refs.editCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + id, { cat_name: this.editCateform.cat_name })
        if (res.meta.status !== 200) return this.$message.error('修改分类名称失败')
        // 关闭对话框
        this.editCateDialog = false
        this.getGoodsCate()
        this.$message.success('提交成功')
      })
    },
    async delelteCate (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .catch(err => err)
      //   console.log(confirmResult)
      //   如果用户确认删除 则返回值为confirm
      // 如果用户取消删除 则返回值为cancel 提示取消删除
      if (confirmResult !== 'confirm') return this.$message.info('已经取消删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      //  console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除分类成功')
      this.getGoodsCate()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader {
    width: 100%;
}
</style>
