<template>
    <div>
             <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
     <el-card class="box-card">
          <el-button type="primary" @click="Roles_addDialogVisible=true">添加角色</el-button>
      <!-- 权限列表区域 -->
      <el-table border :data="RolesList" stripe>
        <el-table-column  type="expand">
          <template slot-scope="scope">
            <!-- <pre>{{scope.row}}</pre> -->
            <!-- 渲染一级权限 -->
            <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['bdBottom',i1===0?'bdTop':'','vcenter']">
              <el-col :span='5'><el-tag closable @close='removeRightsById(scope.row,item1.id)'>{{item1.authName}}</el-tag><i class="el-icon-caret-right"></i></el-col>
               <!-- 渲染二三级权限 -->
              <el-col :span="19">
               <!-- 渲染二级 -->
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2===0?'':'bdTop','vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close='removeRightsById(scope.row, item2.id)'>{{item2.authName}}</el-tag><i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3,i3) in item2.children" :key="i3"  closable @close='removeRightsById(scope.row,item3.id)'>{{item3.authName}}</el-tag>
                    </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column label="操作" prop="level">
             <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini" @click=showEditDiaglo(scope.row.id)></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini" @click=removeRolesById(scope.row.id)></el-button>
            <el-tooltip
              effect="dark"
              content="分配权限"
              placement="top"
              :enterable="false" >
              <!-- 分配权限按钮 -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              @click=showRightsDiaglo(scope.row)></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="Roles_addDialogVisible"  width="50%" @close='addDialogClosed'>
      <!-- 内容主体区域 -->
        <el-form ref="addRoleFormRef" :model="addRoleForm" label-width="80px" :rules="addRoleFormRules">
        <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
         <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
        </el-form>
        <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
          <!-- 按钮 -->
        <el-button @click="Roles_addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click=addRole()>确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="Roles_editDialogVisible"  width="50%" @close='editDialogClosed'>
      <!-- 内容主体区域 -->
        <el-form ref="editRoleFormRef" :model="editRoleForm" label-width="80px" :rules="editRoleFormRules">
        <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
         <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
        </el-form>
        <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
          <!-- 按钮 -->
        <el-button @click="Roles_editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click=editRole(editRoleForm.roleId)>确 定</el-button>
      </span>
    </el-dialog>

    <!-- 权限选择对话框 -->
    <el-dialog title="分配权限" :visible.sync="RightsDialogVisible"  width="50%" @close="setRightsDiaglovisble">
        <!-- 内容主体区域 -->
        <el-tree  :default-checked-keys='defKeys' node-key="id" default-expand-all show-checkbox :data="RightsList" :props="rightsProps" ref='treeRef'></el-tree>
        <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
          <!-- 按钮 -->
        <el-button @click="RightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      RolesList: [],
      Roles_addDialogVisible: false,
      Roles_editDialogVisible: false,
      RightsDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 表单验证规则
      addRoleFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      },
      editRoleFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      },
      // 保存获取的树形权限列表
      RightsList: [],
      // 树形控件控制的对象
      rightsProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认展开节点的数值
      defKeys: [],
      // 即将分配权限的角色id
      RoleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.RolesList = res.data
    },
    // 监听关闭对话框表单重置
    addDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色
    addRole () {
      // 预校验
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入正确的信息')
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('创建角色成功')
        this.Roles_addDialogVisible = false
        this.getRolesList()
      })
    },
    editDialogClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 点击编辑按钮弹窗并显示数据
    async showEditDiaglo (id) {
      console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      // 打开弹窗
      this.Roles_editDialogVisible = true
      this.editRoleForm = res.data
    },
    editRole (id) {
      console.log(id)
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入正确的信息')
        const { data: res } = await this.$http.put('roles/' + id, { roleName: this.editRoleForm.roleName, roleDesc: this.editRoleForm.roleDesc })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('提交失败')
        // 关闭对话框
        this.Roles_editDialogVisible = false
        // 更新角色列表
        this.getRolesList()
        // 提示修改成功
        this.$message.success('更新成功')
      })
    },
    // 删除角色
    async removeRolesById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .catch(err => err)
      //   console.log(confirmResult)
      //   如果用户确认删除 则返回值为confirm
      // 如果用户取消删除 则返回值为cancel 提示取消删除
      if (confirmResult !== 'confirm') return this.$message.info('已经取消删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      //  console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    // 根据id删除权限
    async removeRightsById (role, rightId) {
      // 弹框提示用户是否药删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .catch(err => err)
      //   console.log(confirmResult)
      //   如果用户确认删除 则返回值为confirm
      // 如果用户取消删除 则返回值为cancel 提示取消删除
      if (confirmResult !== 'confirm') return this.$message.info('已经取消删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      // this.getRolesList()
      // 无需再重新加载所有权限
      role.children = res.data
    },
    // 打开分配权限按钮弹出对话框并显示树形列表
    async showRightsDiaglo (roles) {
      this.RoleId = roles.id
      const { data: res } = await this.$http.get('rights/' + 'tree')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.RightsList = res.data
      // 调用递归函数获取当前角色三级权限
      this.getLeafKeys(roles, this.defKeys)
      this.RightsDialogVisible = true
    },
    // 定义一个递归的函数 获取角色下所有三级权限的id并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 如果当前node 节点不包含chidren属性
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item =>
        this.getLeafKeys(item, arr)
      )
    },
    setRightsDiaglovisble () {
      this.defKeys = []
    },
    async allotRights () {
      const keys = [...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      console.log(idStr)
      const { data: res } = await this.$http.post(`roles/${this.RoleId}/rights`, { rids: idStr })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('授权失败')
      this.getRolesList()
      this.RightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.bdTop {
  border-top: 1px solid #eee;
}
.bdBottom {
  border-bottom: 1px solid #eee;
}
.el-tag {
  margin: 7px;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
