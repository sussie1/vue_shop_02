<template>
    <div>
         <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
         <el-alert  title="编辑商品信息" type="info" center show-icon :closable="false"></el-alert>
         <el-steps  :active="activeIndex-0" finish-status="success" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>
        <!-- tab 区域 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" label-position="top">
        <el-tabs tab-position=left  v-model='activeIndex' :before-leave="beforeTabLeave" @tab-click="tabClicked()">
        <el-tab-pane label="基本信息" name='0'>
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model='editForm.goods_name'></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model.number='editForm.goods_price' type="number"></el-input>
          </el-form-item>
          <el-form-item label="重量" prop="goods_weight">
            <el-input v-model.number='editForm.goods_weight' type="number"></el-input>
          </el-form-item>
          <el-form-item label="数量" prop="goods_number">
            <el-input v-model.number='editForm.goods_number' type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader v-model="editForm.goods_cat" :options="cateList" :props="cateProp" @change="handleChange">
            </el-cascader>
        </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name='1'>
            <!-- 渲染表单的item 项 -->
          <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key=item.attr_id>
            <el-checkbox-group v-model="item.attr_vals">
            <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key=i border></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name='2'>
            <el-form-item :label='item.attr_name' v-for='item in onlyTableData' :key = item.attr_id>
                <el-input v-model='item.attr_vals'></el-input>
            </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name='3'>
            <!-- action 表示图片要上传的后台的地址 -->
            <el-upload
            :action="uploadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture" :headers='headerObj' :on-success=onSuccess>
  <el-button size="small" type="primary">点击上传</el-button>
</el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name='4'>
            <quill-editor v-model="editForm.goods_introduce"/>
            <el-button type="primary" @click="edit(goodsId)" class="btnAdd">提交</el-button>
        </el-tab-pane>
        </el-tabs>
        </el-form>
    </el-card>

    <!-- 图片预览图 -->
    <el-dialog
  title="图片预览"
  :visible.sync="previewVisible"
  width="50%">
    <img :src="previewURL" alt="" class="imgWidth">
</el-dialog>
    </div>
</template>
<script>
import _ from 'loadsh'
export default {
  name: 'Edit',
  // goodsId 为 goods（商品列表页List.vue）
  props: ['goodsId'],
  data () {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      editForm: {
        goods_name: '',
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        // 商品所属的分类
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      editFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trriger: blur }],
        goods_price: [{ required: true, message: '请输入商品价格', trriger: blur, type: 'number' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trriger: blur, type: 'number' }],
        goods_number: [{ required: true, message: '请输入商品数量', trriger: blur, type: 'number' }]
        // goods_cat: [{ required: true, message: '请选择分类', trriger: blur }]
      },
      cateProp: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      //  保存分类的数据对象
      cateList: [],
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 上传图片的URL
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewURL: '',
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
    this.getEdit(this.goodsId)
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.cateList = res.data
    },
    // 根据 ID 查询商品并显示数据
    async getEdit (goodsId) {
      const { data: res } = await this.$http.get(`goods/${goodsId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品信息失败')
      }
      this.editForm = res.data
      // 编辑商品时，需重新选择商品分类
      this.editForm.goods_cat = []
      console.log(this.editForm)
    },
    // 选中三级级联选择器触发函数
    handleChange () {
    //   console.log(this.editForm.goods_cat)
      if (this.editForm.goods_cat.length !== 3) {
        this.editForm.goods_cat = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.editForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品')
        return false
      }
    },
    async tabClicked () {
    // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          this.$message.error('获取参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals === '' ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      }
      if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数失败')
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    handlePreview (file) {
      console.log(file)
      this.previewURL = file.response.data.url
      this.previewVisible = true
    },
    handleRemove (file) {
    //   console.log(file)
    // 1获取想要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2从pics数组中 找到这图片的对应的索引值
      const picIndex = this.editForm.pics.findIndex(x =>
        x.pic === filePath
      )
      // 3调用数组的splice方法 把图片信息对象 从pics 数组中删除
      this.editForm.pics.splice(picIndex, 1)
      console.log(this.editForm)
    },
    onSuccess (response) {
    // 1.先拼接得到一个图片对象
    // 2.再把图片对象push 到pics
      const picInfo = { pic: response.data.tmp_path }
      this.editForm.pics.push(picInfo)
      console.log(this.editForm)
    },
    edit (goodsId) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单信息')
        //   console.log(this.addForm)
        // 执行添加的业务逻辑
        //   this.addForm.goods_cat = this.addForm.goods_cat.join(',') 报错与级联的数组分歧
        //   console.log(this.addForm)
        // 深拷贝出一份一模一样的addform
        //   const form = JSON.parse(JSON.stringify(this.addForm))
        //   const forms = form.goods_cat.join(',')
        //   console.log(forms)
        // loadsh clonedeep
        const form = _.cloneDeep(this.editForm)
        form.goods_cat = form.goods_cat.join(',')
        //   console.log(form)
        //  处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          this.editForm.attrs.push(newInfo)
        })
        //   处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.editForm.attrs.push(newInfo)
        })
        form.attrs = this.editForm.attrs
        console.log(form)
        // 发起请求添加商品
        // 商品的名称 必须是唯一的
        const { data: res } = await this.$http.put(`goods/${this.goodsId}`, form)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑商品失败')
        }
        this.$message.success('编辑商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.editForm.goods_cat.length === 3) {
        return this.editForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
    margin: 0 10px 0 0 !important;
}
.imgWidth {
    width: 100%;
}
.btnAdd {
    margin-top: 10px;
}
</style>
