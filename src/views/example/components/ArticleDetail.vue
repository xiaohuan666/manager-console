<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="temp" :rules="rules" class="form-container">

      <!-- <sticky :z-index="10" :class-name="'sub-navbar ' + postForm.status">
                          <CommentDropdown v-model="postForm.comment_disabled" />
                          <PlatformDropdown v-model="postForm.platforms" />
                          <SourceUrlDropdown v-model="postForm.source_uri" />
                          <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
                            Publish
                          </el-button>
                          <el-button v-loading="loading" type="warning" @click="draftForm">
                            Draft
                          </el-button>
                        </sticky> -->

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="temp.title" :maxlength="100" name="name" required>
                Title
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="100px" label="Approval1:" class="postInfo-container-item">
                    <el-select v-model="temp.Approval1" style="width:100%">
                      <el-option
                        v-for="item in approvalUsr1s"
                        :key="item.id"
                        :label="item.username"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="100px" label="Approval2:" class="postInfo-container-item">
                    <el-select v-model="temp.Approval2" style="width:100%">
                      <el-option
                        v-for="item in approvalUsr2s"
                        :key="item.id"
                        :label="item.username"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="100px" label="Description:">
          <el-input
            v-model="temp.description"
            :rows="1"
            type="textarea"
            class="article-textarea"
            autosize
            placeholder="Please enter the description"
          />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>
        <el-row>
          <el-col :span="8">
            <el-form-item label-width="100px" label="Approval2:" class="postInfo-container-item">
              <el-select v-model="temp.Approval2" style="width:100%">
                <el-option v-for="item in approvalUsr2s" :key="item.id" :label="item.username" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-button
              class="filter-item"
              style="margin-left: 10px"
              type="primary"
              icon="el-icon-edit"
              @click="handleSelectPaper"
            >
              select
            </el-button>
          </el-col>
        </el-row>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="handleCreateApplication()">
            Confirm
          </el-button>
        </div>
      </div>
    </el-form>
    <el-dialog title="Select Paper" :visible.sync="dialogSelectPaperVisible">
      <hehe />
    </el-dialog>
  </div>
</template>

<script>
import MDinput from '@/components/MDinput'
import { validURL } from '@/utils/validate'
import { fetchArticle } from '@/api/article'
import { searchUser } from '@/api/remote-search'
import Warning from './Warning'
import { CommentDropdown, PlatformDropdown, SourceUrlDropdown } from './Dropdown'
import { fetchUsrList } from '@/api/user'
import hehe from '@/views/example/list.vue'
// import Timeline from '../list'
const defaultForm = {
  status: 'draft',
  title: '', // ????????????
  content: '', // ????????????
  content_short: '', // ????????????
  source_uri: '', // ????????????
  image_uri: '', // ????????????
  display_time: undefined, // ??????????????????
  id: undefined,
  platforms: ['a-platform'],
  comment_disabled: false,
  importance: 0,
  approval1: undefined,
  approval2: undefined
}

export default {
  name: 'ArticleDetail',
  components: { MDinput, hehe },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '????????????',
          type: 'error'
        })
        callback(new Error(rule.field + '????????????'))
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validURL(value)) {
          callback()
        } else {
          this.$message({
            message: '??????url???????????????',
            type: 'error'
          })
          callback(new Error('??????url???????????????'))
        }
      } else {
        callback()
      }
    }
    return {
      temp: {
        id: undefined,
        fileId: undefined,
        title: '',
        description: '',
        Approval1: undefined,
        Approval2: undefined
      },
      dialogSelectPaperVisible: false,
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      approvalUsr2s: [],
      approvalUsr1s: [],
      rules: {
        image_uri: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        source_uri: [{ validator: validateSourceUri, trigger: 'blur' }]
      },
      tempRoute: {}
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.content_short.length
    },
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.postForm.display_time))
      },
      set(val) {
        this.postForm.display_time = new Date(val)
      }
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }
    this.getApprovalUsr1List()
    this.getApprovalUsr2List()
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    handleSelectPaper() {
      this.dialogSelectPaperVisible = true
      // this.$nextTick(() => {
      //   this.$refs["dataForm"].clearValidate();
      // });
    },
    handleCreateApplication() {

    },
    getApprovalUsr1List() {
      this.listLoading = true
      this.listQuery
      const tempData = {
        current: 1,
        size: 100,
        username: '',
        role: 'manager1'
      }
      fetchUsrList(tempData).then((response) => {
        this.approvalUsr1s = response.data.records
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    getApprovalUsr2List() {
      this.listLoading = true
      this.listQuery
      const tempData = {
        current: 1,
        size: 100,
        username: '',
        role: 'manager2'
      }
      fetchUsrList(tempData).then((response) => {
        this.approvalUsr2s = response.data.records
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    fetchData(id) {
      fetchArticle(id).then(response => {
        this.postForm = response.data

        // just for test
        this.postForm.title += `   Article Id:${this.postForm.id}`
        this.postForm.content_short += `   Article Id:${this.postForm.id}`

        // set tagsview title
        this.setTagsViewTitle()

        // set page title
        this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = 'Edit Article'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Article'
      document.title = `${title} - ${this.postForm.id}`
    },
    submitForm() {
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$notify({
            title: '??????',
            message: '??????????????????',
            type: 'success',
            duration: 2000
          })
          this.postForm.status = 'published'
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '?????????????????????????????????',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '????????????',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 'draft'
    },
    getRemoteUserList(query) {
      searchUser(query).then(response => {
        if (!response.data.items) return
        this.userListOptions = response.data.items.map(v => v.name)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
