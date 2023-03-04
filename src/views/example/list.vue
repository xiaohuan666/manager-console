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
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleQueryApprovedList"
      >
        Approved
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleQueryApprovalPendingList"
      >
        Approval Pending
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="ID" width="50">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="creator" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.creator }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="title" width="80">
        <template slot-scope="scope">
          <el-link :href="scope.row.url" type="primary" target="_blank">{{ scope.row.title }}</el-link>
          <!-- <span>{{ scope.row.id }}</span> -->
        </template>
      </el-table-column>
      <el-table-column align="center" label="description" width="500">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="approvaler1" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.approvalUsrName1 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="approvaler2" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.approvalUsrName2 }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Status1" width="110">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.approvalStatus1)">
            {{ getStatus(row.approvalStatus1) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Status2" width="110">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.approvalStatus2)">
            {{ getStatus(row.approvalStatus2) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="250">
        <template slot-scope="scope">
          <router-link :to="'/example/edit/' + scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              Edit
            </el-button>
          </router-link>

          <el-button type="primary" size="small" icon="el-icon-download" @click="handleDownload(scope.row)">
            Download
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.current"
      :limit.sync="listQuery.size"
      @pagination="queryApprovalList"
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
        <el-form-item label="Approval1">
          <el-select v-model="temp.Approval1" style="width:100%">
            <el-option v-for="item in approvalUsr1s" :key="item.id" :label="item.username" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Approval2">
          <el-select v-model="temp.Approval1" style="width:100%">
            <el-option v-for="item in approvalUsr2s" :key="item.id" :label="item.username" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Article">
          <el-select v-model="temp.fileId" style="width:100%">
            <el-option v-for="item in this.articles" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> Cancel</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { download } from '@/api/paper'
import { fetchApplicationList } from '@/api/approval'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { fetchUsrList } from '@/api/user'

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
  data() {
    return {
      user_id: '',
      dialogFormVisible: false,
      list: null,
      total: 0,
      listLoading: true,
      temp: {
        id: undefined,
        fileId: undefined,
        title: '',
        description: '',
        Approval1: undefined,
        Approval2: undefined
      },
      approvalUsr1s: [],
      approvalUsr2s: [],
      listQuery: {
        current: 1,
        size: 20,
        approvalUsrId: null,
        opt: '',
        name: ''
      }
    }
  },
  created() {
    this.user_id = this.$store.getters.user_id
    this.listQuery.createUserId = this.user_id
    this.handleQueryApprovalAllList()
    this.getApprovalUsr1List()
    this.getApprovalUsr2List()
  },
  methods: {
    getStatusType(status) {
      const statusTypeMap = {
        1: 'success',
        2: 'danger',
        0: ''
      }
      return statusTypeMap[status]
    },
    getStatus(status) {
      const statusTypeMap = {
        1: 'agree',
        2: 'disagree',
        0: 'pending'
      }
      return statusTypeMap[status]
    },
    handleDownload(row) {
      download(row.fileId).then(res => {
        if (res.code) {
          this.$message.error(res.msg)
        } else {
          const blob = new Blob([res])
          console.log(res.headers)
          const fileName = row.fileOriginalName
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
      this.handleQueryApprovalAllList()
    },
    getApprovalUsr1List() {
      this.listLoading = true
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
    handleQueryApprovedList() {
      this.queryApprovalList('approved')
    },
    handleQueryApprovalPendingList() {
      this.queryApprovalList('pending')
    },
    handleQueryApprovalAllList() {
      this.queryApprovalList('all')
    },
    queryApprovalList(opt) {
      this.listLoading = true
      this.listQuery.opt = opt
      fetchApplicationList(this.listQuery).then(res => {
        this.list = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
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
          Approval1: undefined,
          Approval2: undefined,
          description: ''
        }
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
</style>
