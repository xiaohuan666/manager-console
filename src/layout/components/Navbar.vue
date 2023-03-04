<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container"/>
    <el-dialog title="ChangePassword" :visible.sync="changePasswordFormVisible">
      <el-form
        ref="changePasswordForm"
        :model="changePasswordForm"
        :rules="loginRules"
        label-position="top"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="password" prop="password">
          <el-input
            :key="passwordType"
            ref="password"
            v-model="changePasswordForm.password"
            :type="passwordType"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleChangePassword"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"/>
          </span>
        </el-form-item>
        <el-form-item label="new passwd" prop="password">
          <el-input
            :key="passwordType"
            ref="password"
            v-model="changePasswordForm.newPassword"
            :type="passwordType"
            placeholder="Password"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleChangePassword"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"/>
          </span>
        </el-form-item>
        <el-form-item label="confirm" prop="confirmPassword">
          <el-input
            :key="passwordType"
            ref="confirmPassword"
            v-model="changePasswordForm.confirmPassword"
            :type="passwordType"
            name="confirmPassword"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleChangePassword"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="changePasswordFormVisible = false"> Cancel</el-button>
        <el-button type="primary" @click.native.prevent="handleChangePassword">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <div class="right-menu">
      <template v-if="device !== 'mobile'">
        <search id="header-search" class="right-menu-item"/>

        <error-log class="errLog-container right-menu-item hover-effect"/>

        <screenfull id="screenfull" class="right-menu-item hover-effect"/>

        <el-tooltip content="Global Size" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect"/>
        </el-tooltip>

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar + '?imageView2/1/w/80/h/80'" class="user-avatar">
          <i class="el-icon-caret-bottom"/>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item divided @click.native="changePassword">
            <span style="display:block;">Change Password</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">Log Out</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import {changePassword} from '@/api/user'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    Search
  },
  data() {
    const validatePassword = (rule, value, callback) => {
      callback()
    }
    const validateConfirmPassword = (rule, value, callback) => {
      console.log(value + 11111)
      console.log(this.changePasswordForm.newPassword)
      if (value === this.changePasswordForm.newPassword) {
        callback()
      } else {
        callback(new Error('Confirm new password failed'))
      }
    }
    return {
      loginRules: {
        password: [{required: true, trigger: 'blur', validator: validatePassword}],
        confirmPassword: [{required: true, trigger: 'blur', validator: validateConfirmPassword}]
      },
      passwordType: 'password',
      changePasswordFormVisible: false,
      changePasswordForm: {
        password: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ])
  },
  methods: {
    checkCapslock(e) {
      const {key} = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleChangePassword() {
      this.$refs.changePasswordForm.validate(valid => {
        if (valid) {
          this.loading = true
          changePassword(this.changePasswordForm)
            .then((response) => {
              if (response.code === 0) {
                this.changePasswordFormVisible = false
                this.$notify({
                  title: 'Success',
                  message: 'Change Password Successfully, Please login again',
                  type: 'success',
                  duration: 5000
                })
                this.logout()
              } else {
                this.$message({
                  message: response.msg,
                  type: 'error'
                })
              }
            })
            .catch(() => {
              this.$message({
                message: 'Wrong user name or password, please try again'
              })
              this.loading = false
            })
          this.changePasswordFormVisible = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    changePassword() {
      this.changePasswordFormVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
