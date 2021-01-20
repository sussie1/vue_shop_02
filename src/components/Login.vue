<template>
    <div class="login_container">
        <!-- 登录盒子 -->
        <div class="login_box">
            <!-- 头像 -->
            <div class="avator_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单 -->
           <el-form class="login_form" :model='loginForm' :rules='loginFormRules' ref='loginFormRef'>
            <el-form-item prop="username">
                <el-input   prefix-icon="iconfont icon-user" v-model="loginForm.username"  ></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password" ></el-input>
            </el-form-item>
            <el-form-item class="btns">
               <el-button type="primary" @click='login' >登录</el-button>
               <el-button type="info" @click="resetLoginForm('loginFormRef')">重置</el-button>
            </el-form-item>
           </el-form>

        </div>
    </div>
</template>

<script >

export default {
  data () {
    return {
      // 数据绑定
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  // 添加行为
  methods: {
    // 添加表单重置方法
    resetLoginForm (formname) {
      this.$refs[formname].resetFields()
    },
    //
    login () {
      // 点击登录的时候先调用validate方法验证表单内容是否有误
      // console.log(this.$refs.loginFormRef)
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return

        // ///发送请求进行登录
        const { data: res } = await this.$http.post('login', this.loginForm)
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error('登录失败:' + res.meta.msg)
        this.$message.success('登录成功')
        // console.log(res)
        // 登录成功后保存token
        window.sessionStorage.setItem('token', res.data.token)
        // 导航至/home
        this.$router.push('/home')
      })
    }
  }
}
</script>
<style lang="less" scoped>

.login_container {
    background-color: #2b5b6b;
    height: 100%;

    .login_box {
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        top: 50%;
        left:50%;
        transform: translate(-50%,-50%);
    }
    .avator_box {
    width: 130px;
    height: 130px;
    border:1px solid #eee;
    background-color: #fff;
    border-radius: 50%;
    padding:10px;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    box-shadow:0 0 10px #ddd ;

    img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }
}

.login_form {
    position: absolute;
    width:100%;
    bottom: 0;
    padding: 0 20px;
    box-sizing: border-box;

    .btns {
        display: flex;
        justify-content: flex-end;
    }
}
}
</style>
