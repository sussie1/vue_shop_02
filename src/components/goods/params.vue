<template>
    <div>
            <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片试图  -->
    <el-card>
        <el-alert   show-icon title="只允许为第三级分类设置相关参数" type="warning"  :closable="false">
        </el-alert>
        <el-row class="rowspan">
           <el-col>
               <span>选择商品分类:  </span>
               <el-cascader v-model="selectedKeys" :options="cateList" :props='cateProps'  @change="selectChange"></el-cascader>
           </el-col>
        </el-row>
        <el-row>
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <!-- 添加动态 参数面板 -->
            <el-tab-pane label="动态参数" name="many">
                <el-button size="mini" type="primary" :disabled='isBtnDisabled' @click=showaddDialog>添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTableData" border stripe>
                  <el-table-column type="expand">
                    <template slot-scope="scope">
                      <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable  @close=handleClose(i,scope.row)>{{item}}</el-tag>
                        <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" slot-scope="" @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)">
                     </el-input>
                     <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column type="index"></el-table-column>
                  <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                   <el-table-column label="操作" >
                    <template slot-scope="scope">
                     <el-button type="primary" icon="el-icon-edit" size="mini"  @click=showEditDialog(scope.row.attr_id)>编辑</el-button>
                     <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParms(scope.row.attr_id)">删除</el-button>
                     </template>
                   </el-table-column>
                </el-table>
            </el-tab-pane>
              <!-- 添加静态属性面板 -->
            <el-tab-pane label="静态属性" name="only">
                <el-button size="mini" type="primary" :disabled='isBtnDisabled' @click=showaddDialog>添加属性</el-button>
                <!-- 静态属性表格 -->
                <el-table :data="onlyTableData" border stripe>
                  <el-table-column type="expand">
                    <template slot-scope="scope">
                      <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close=handleClose(i,scope.row)>{{item}}</el-tag>
                      <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" slot-scope="" @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)" >
                     </el-input>
                     <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column type="index"></el-table-column>
                  <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                   <el-table-column label="操作" >
                     <template slot-scope="scope">
                     <el-button type="primary" icon="el-icon-edit" size="mini" @click=showEditDialog(scope.row.attr_id)>编辑</el-button>
                     <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParms(scope.row.attr_id)">删除</el-button>
                     </template>
                   </el-table-column>
                </el-table>
            </el-tab-pane>
            </el-tabs>
        </el-row>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加'+titleText"  :visible.sync="addDialogVisble" width="50%" @close=addDialogClosed>
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" >
    <el-form-item :label="titleText" prop="attr_name">
      <el-input v-model="addForm.attr_name"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisble = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改'+titleText"  :visible.sync="editDialogVisble" width="50%" @close=editDialogClosed>
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" >
    <el-form-item :label="titleText" prop="attr_name">
      <el-input v-model="editForm.attr_name"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisble = false">取 消</el-button>
    <el-button type="primary" @click="editParams" >确 定</el-button>
    </span>
    </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
    // 商品分类列表
      cateList: [],
      //   选择款配置参数
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //  级联选择框双向绑定的数组
      selectedKeys: [],
      //   被激活的标签页名称
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性保存数据对象
      onlyTableData: [],
      addDialogVisble: false,
      // 添加参数的数据对象
      addForm: {
        attr_name: ''
      },
      // 表单验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      // addDialogVisble
      editDialogVisble: false,
      editForm: {
        attr_name: ''
      },
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
      // // 控制输入框的显示与隐藏
      // inputVisible: false,
      // // 输入框的值
      // inputValue: ''

    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 3 } })
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      this.cateList = res.data
      this.total = res.data.total
    },
    async getParamsList () {
      //   console.log(this.selectedKeys)
      //   证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //  选中的是三级分类
      console.log(this.selectedKeys)
      // 根据所选分类的id和当前的面板 获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      // const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      // console.log(res.data)
      // console.log(this.cateId)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
        console.log(this.manyTableData)
      }
      this.onlyTableData = res.data
    },
    selectChange () {
      this.getParamsList()
    },
    handleClick () {
      console.log(this.activeName)
      this.getParamsList()
    },
    showaddDialog () {
      this.addDialogVisble = true
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.addDialogVisble = false
        this.getParamsList()
      })
    },
    // 编辑对话框id
    async showEditDialog (attrid) {
      this.editDialogVisble = true
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrid}`, { params: { attr_sel: this.activeName } })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.editForm = res.data
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success('修改成功')
        this.editDialogVisble = false
        this.getParamsList()
      })
    },
    async deleteParms (attrid) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .catch(err => err)
        //   console.log(confirmResult)
        //   如果用户确认删除 则返回值为confirm
        // 如果用户取消删除 则返回值为cancel 提示取消删除
      if (confirmResult !== 'confirm') return this.$message.info('已经取消删除')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrid}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.editDialogVisble = false
      this.getParamsList()
    },
    showInput (row) {
      row.inputVisible = true
      // nextTick 当页面上元素被重新渲染之后 才会执行回调函数的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 文本框失去焦点 或按下enter 键触发
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return 则证明输入的内容是合法的 需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // saveAttrvals 将对attr_vals 的操作保存到数据库
    async saveAttrVals (row) {
      // 发起提交参数
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(',') })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.$message.success('修改参数成功')
    },
    // 删除对应的参数可选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用 则返回true 否则返回false
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) return true
      return false
    },
    // 当前选中的三级分类的id
    cateId () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 对话框title 的显示
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.rowspan {
    margin: 10px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
