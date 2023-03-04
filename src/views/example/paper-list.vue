<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="title key word"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="prepareUpload">
        Upload
      </el-button>
      <el-dropdown v-if="this.$store.getters.roles.indexOf('admin') >= 0" type="primary">
        <el-button
          id="uploadFileId"
          class="filter-item"
          type="primary"
          icon="el-icon-plus"
        >Create<i class="el-icon-arrow-down el-icon--right" /></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="handleClickAddFolderBtn">
            <div class="img-text-wrapper"><img :src="dirImg">Folder</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

    </div>
    <div class="middle-wrapper">
      <!-- 面包屑导航栏 -->
      <el-input
        v-show="isShowInput"
        ref="filePathInputRef"
        v-model="inputFilePath"
        class="file-path-input"
        placeholder="请输入路径"
        size="mini"
        :autofocus="true"
        @blur="handleInputBlurEnter"
        @change="handleInputBlurEnter"
      />
      <div
        v-show="!isShowInput"
        class="breadcrumb-box"
        :class="{ 'able-input': fileType === 0 }"
        @click.self="handleClickBreadCrumbSelf"
      >
        <el-breadcrumb
          v-if="![0, 8].includes(fileType) && !['Share'].includes($route.name)"
          separator-class="el-icon-arrow-right"
        >
          <el-breadcrumb-item>{{ fileTypeMap[fileType] }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-breadcrumb v-else separator-class="el-icon-arrow-right">
          <el-breadcrumb-item
            v-for="(item, index) in breadCrumbList"
            :key="index"
            :to="getRouteQuery(item)"
          >{{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      highlight-current-row
      :data="list"
      fit
      style="width: 100%"
    >
      <el-table-column align="center" label="ID" width="50">
        <template v-slot="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="creator" width="100">
        <template v-slot="scope">
          <span>{{ scope.row.createUsrName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        key="isDir"
        label
        prop="isDir"
        :width="56"
        align="center"
        class-name="file-icon-column"
      >
        <template slot-scope="scope">
          <img
            :src="$file.setFileImg(scope.row)"
            style="width: 30px; max-height: 30px; cursor: pointer"
            @click="handleClickRow(scope.row)"
          >
        </template>
      </el-table-column>
      <el-table-column align="center" label="name" width="250">

        <template v-slot="scope">
          <!--          <el-link :href="scope.row.originalName" type="primary" target="_blank">{{ scope.row.originalName }}</el-link>-->
          <span @click="handleClickRow(scope.row)">{{ scope.row.originalName }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="type" width="70">
        <template slot-scope="scope">
          <span>{{ getFileType(scope.row) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="create time" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="update time" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            :disabled="disableCreateApplication(scope.row)"
            @click="handleClickRenameFileBtn(scope.row)"
          >
            Rename
          </el-button>
          <el-button
            v-if="scope.row.isDir === 0"
            type="primary"
            size="small"
            icon="el-icon-edit"
            :disabled="disableCreateApplication(scope.row)"
            @click="handleCover(scope.row)"
          >
            Cover
          </el-button>
          <el-button
            v-if="scope.row.isDir === 0"
            type="primary"
            size="small"
            icon="el-icon-download"
            :disabled="disableCreateApplication(scope.row)"
            @click="handleDownload(scope.row)"
          >
            Download
          </el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-delete"
            :disabled="disableCreateApplication(scope.row)"
            @click="handleDelete(scope.row)"
          >
            Delete
          </el-button>
          <el-button
            v-if="scope.row.isDir === 0"
            class="filter-item"
            style="margin-left: 10px"
            type="primary"
            icon="el-icon-edit"
            :disabled="disableCreateApplication(scope.row)"
            @click="prepareCreateApplication(scope.row)"
          >
            Create Application
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.current"
      :limit.sync="listQuery.size"
      @pagination="getList"
    />
    <el-dialog title="create" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="description">
          <el-input v-model="temp.description" />
        </el-form-item>
        <el-form-item label="fileName">
          <el-input v-model="temp.fileName" disabled />
        </el-form-item>
        <el-form-item label="Approval1">
          <el-select v-model="temp.approvalUsr1" style="width:100%">
            <el-option v-for="item in approvalUsr1s" :key="item.id" :label="item.username" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Approval2">
          <el-select v-model="temp.approvalUsr2" style="width:100%">
            <el-option v-for="item in approvalUsr2s" :key="item.id" :label="item.username" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> Cancel</el-button>
        <el-button type="primary" @click="handleCreateApplication">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="upload" :visible.sync="dialogUploadVisible">
      <el-upload
        class="upload"
        name="file"
        drag
        :http-request="handleUpload"
        :limit="1"
        :before-upload="handleBeforeUpload"
        :on-success="getList"
        :multiple="true"
        action=""
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">Drag your file here, or <em>click here to upload</em></div>
      </el-upload>
    </el-dialog>
    <el-dialog
      title="Create Folder"
      :visible.sync="dialogCreateFolderVisible"
      width="580px"
      :close-on-click-modal="false"
      @close="handleCreateFolderClose"
    >
      <el-form
        class="add-folder-form"
        :rules="formRules"
        :model="createFolderRequest"
      >
        <el-form-item label="FolderName" prop="fileName">
          <el-input v-model="createFolderRequest.fileName" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCreateFolderClose">取 消</el-button>
        <el-button
          type="primary"
          :loading="sureBtnLoading"
          @click="createFold"
        >Confirm
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="Rename"
      :visible.sync="dialogRenameFileVisible"
      width="580px"
      :close-on-click-modal="false"
      @close="handleRenameFileClose"
    >
      <el-form
        class="add-folder-form"
        :rules="formRules"
        :model="renameFileRequest"
      >
        <el-form-item label="FolderName" prop="fileName">
          <el-input v-model="renameFileRequest.fileName" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleRenameFileClose">取 消</el-button>
        <el-button
          type="primary"
          :loading="sureBtnLoading"
          @click="renameFile"
        >Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, download, deleteFile, uploadFile, createFolder, renameFile } from '@/api/paper'

import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { fetchUsrList } from '@/api/user'
import { createApplication } from '@/api/approval'

export default {
  name: 'ArticleList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  // props: {
  //   // 文件路径
  //   // eslint-disable-next-line vue/require-default-prop
  //   filePath: {
  //     require: true,
  //     type: String
  //   }
  // },

  data() {
    const validateFileName = (rule, value, callback) => {
      const fileNameReg = new RegExp(`[\\\\/:*?"<>|]`)
      if (value && fileNameReg.test(value)) {
        callback(new Error(`folderName can not contains: \\/:*?"<>|`))
      } else {
        callback()
      }
    }
    return {
      formRules: {
        fileName: [
          { required: true, message: 'folderName is required', trigger: 'blur' },
          { validator: validateFileName, trigger: ['blur', 'change'] }
        ]
      },
      sureBtnLoading: false,
      dialogCreateFolderVisible: false,
      dialogRenameFileVisible: false,
      createFolderRequest: {
        fileName: ''
      },
      renameFileRequest: {
        fileId: undefined,
        fileName: ''
      },
      fileType: 0,
      fileTypeMap: {
        1: '全部图片',
        2: '全部文档',
        3: '全部视频',
        4: '全部音乐',
        5: '其他',
        6: '回收站'
      },
      isShowInput: false, //  是否展示路径输入框
      inputFilePath: '', //  路径输入
      dirImg: require('@/assets/images/file/dir.png'),
      user_id: undefined,
      dialogFormVisible: false,
      dialogUploadVisible: false,
      list: null,
      total: 0,
      listLoading: true,
      temp: {
        id: undefined,
        fileId: undefined,
        fileName: '',
        title: '',
        description: '',
        approvalUsr1: undefined,
        approvalUsr2: undefined
      },
      approvalUsr1s: [],
      approvalUsr2s: [],
      // current=1&size=20&name=&createUserId=
      listQuery: {
        current: 1,
        size: 20,
        name: '',
        createUserId: null,
        filePath: '/'
      }
    }
  },
  computed: {
    /**
     * 面包屑导航栏数组
     */
    breadCrumbList: {
      get() {
        const path = this.filePath
        const filePathList = path ? path.split('/') : []
        const res = [] //  返回结果数组
        const _path = [] //  存放祖先路径
        for (let i = 0; i < filePathList.length; i++) {
          if (filePathList[i]) {
            _path.push(filePathList[i])
            res.push({
              path: _path.join('/'),
              name: filePathList[i]
            })
          } else if (i === 0) {
            //  根目录
            filePathList[i] = ''
            _path.push(filePathList[i])
            res.push({
              path: '/',
              name: 'Home'
            })
          }
        }
        return res
      },
      set() {
        return []
      }
    },
    filePath() {
      return this.$route.query.filePath ? this.$route.query.filePath : '/'
    }
  },
  watch: {
    filePath() {
      // 当左侧菜单选择“全部”或“我的分享”，文件路径发生变化时，再重新获取文件列表
      if (this.$route.name === 'PaperList') {
        this.getList()
        this.getApprovalUsr1List()
        this.getApprovalUsr2List()
      }
    }
  },

  created() {
    this.user_id = this.$store.getters.user_id
    this.getList()
    this.getApprovalUsr1List()
    this.getApprovalUsr2List()
  },
  methods: {
    isAdmin() {
      console.log(this.$store.getters.roles.indexOf('admin') >= 0)
      return this.$store.getters.roles.indexOf('admin') >= 0
    },
    renameFile() {
      renameFile(this.renameFileRequest).then(res => {
        if (res.code === 0) {
          this.$message.success(res.msg || 'Rename Success')
          this.dialogRenameFileVisible = false
          this.getList()
        } else {
          this.$message.error(res.msg || 'Rename failed')
        }
      })
      this.resetRenameFileRequest()
    },
    /**
     * 点击面包屑导航栏空白处
     */
    handleClickBreadCrumbSelf() {
      this.inputFilePath = this.filePath
      this.isShowInput = true
      this.$nextTick(() => {
        this.$refs.filePathInputRef.focus()
      })
    },
    /**
     * 路径输入框失去焦点或用户按下回车时触发
     */
    handleInputBlurEnter() {
      this.isShowInput = false
      if (this.inputFilePath !== this.filePath) {
        const fixInputFilePath = this.inputFilePath.endsWith('/')
          ? this.inputFilePath.slice(0, -1)
          : this.inputFilePath
        alert('Blur ' + fixInputFilePath)
      }
    },
    // 获取文件参数
    getRouteQuery(item) {
      // let routeName = this.$route.name
      // this.filePath = item.path
      // this.listQuery.filePath = item.path
      // this.getList()
      return { query: { filePath: item.path }}
    },
    handleClickAddFolderBtn() {
      this.dialogCreateFolderVisible = true
    },
    handleClickRenameFileBtn(row) {
      this.renameFileRequest.fileId = row.id
      this.dialogRenameFileVisible = true
    },
    handleCreateFolderClose() {
      this.dialogCreateFolderVisible = false
    },
    handleRenameFileClose() {
      this.dialogRenameFileVisible = false
    },
    createFold() {
      const data = {
        fileName: this.createFolderRequest.fileName,
        filePath: this.filePath
      }
      createFolder(data).then(res => {
        if (res.code === 0) {
          this.$message.success(res.msg || 'Create Success')
          this.dialogCreateFolderVisible = false
          this.getList()
        } else {
          this.$message.error(res.msg || 'Create failed')
        }
      })
      this.resetCreateFolderRequest()
    },
    handleClickRow(row) {
      if (row.isDir === 1) {
        if (row.filePath.endsWith('/')) {
          this.$router.push('/file/PaperList?filePath=' + row.filePath + row.originalName)
        } else {
          this.$router.push('/file/PaperList?filePath=' + row.filePath + '/' + row.originalName)
        }
      }
    },
    getFileType(row) {
      if (row.isDir === 1) {
        return 'folder'
      }
      return row.extendName === null ? 'pdf' : row.extendName
    },
    handleUpload(params) {
      const file = params.file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('filePath', this.filePath)
      uploadFile(formData).then(res => {
        if (res.code === 0) {
          this.$message.success(res.msg || 'Upload Success')
          this.dialogUploadVisible = false
          this.getList()
        } else {
          this.$message.error(res.msg || '文件导入失败，稍后重试')
        }
      })
    },
    handleBeforeUpload(file) {
      const uploadTypes = ['pdf']
      const filetype = file.name.replace(/.+\./, '')
      if (uploadTypes.indexOf(filetype.toLowerCase()) === -1) {
        this.$message.warning({
          message: 'Only pdf allowed'
        })
        return false
      }
      return true
    },
    handleDelete(row) {
      this.$confirm('confirm delete ?', 'warning', {
        iconClass: 'el-icon-question',
        confirmButtonText: 'confirm',
        cancelButtonText: 'cancel',
        showClose: true,
        type: 'warning'
      }).then(() => {
        deleteFile(row.id).then((res) => {
          if (res.code === 0) {
            this.$notify({
              title: 'Success',
              message: 'Delete Successfully',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$message.error(res.msg)
          }
          this.getList()
        })
      })
    },
    disableCreateApplication(row) {
      return this.user_id !== row.createUsr
    },
    handleCover(row) {
      alert(row.id)
    },
    handleDownload(row) {
      download(row.id).then(res => {
        if (res.code) {
          this.$message.error(res.msg)
        } else {
          const blob = new Blob([res])
          console.log(res.headers)
          const fileName = row.originalName
          if ('download' in document.createElement('a')) {
            const link = document.createElement('a')
            link.download = fileName
            link.style.display = 'none'
            link.href = URL.createObjectURL(blob)
            document.body.appendChild(link)
            link.click()
            URL.revokeObjectURL(link.href)
            document.body.removeChild(link)
          } else {
            navigator.msSaveBlob(blob, fileName)
          }
        }
      })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
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
    getList() {
      this.listLoading = true
      this.listQuery.filePath = this.filePath
      fetchList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleCreateApplication() {
      createApplication(this.temp).then(res => {
        if (res.code === 0) {
          this.$message({
            message: 'Create Application Success',
            type: 'success'
          })
        }
      })
      this.dialogFormVisible = false
    },
    prepareUpload() {
      this.dialogUploadVisible = true
    },
    prepareCreateApplication(row) {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.temp.fileId = row.id
      this.temp.fileName = row.originalName
      this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs["dataForm"].clearValidate();
      // });
    },
    resetTemp() {
      this.temp = {
        temp: {
          id: undefined,
          title: '',
          fileId: undefined,
          approvalUsr1: undefined,
          approvalUsr2: undefined,
          description: ''
        }
      }
    },
    resetCreateFolderRequest() {
      this.createFolderRequest = {
        fileName: ''
      }
    },
    resetRenameFileRequest() {
      this.renameFileRequest = {
        fileId: undefined,
        fileName: ''
      }
    }
  }

}

</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}

.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}

.img-text-wrapper {
  display: flex;
  align-items: center;
}

img {
  margin-right: 4px;
  height: 24px;
}

.middle-wrapper {
  margin-bottom: 8px;
}

.file-path-input {
  flex: 1;
  font-size: 14px;
}
</style>
