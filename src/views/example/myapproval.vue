<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
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
        <template v-slot="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="creator" width="80">
        <template v-slot="scope">
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
      <el-table-column class-name="status-col" label="Status1" width="110">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.approvalStatus)">
            {{ getStatus(row.approvalStatus) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="250">
        <template slot-scope="row">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-download"
            :disabled="checkDisabled(row.approvalStatus)"
            @click="handleProcess(row)"
          >
            Process
          </el-button>
          <el-button type="primary" size="small" icon="el-icon-download" @click="handleDownload(row)">
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
        <el-form-item label="option">
          <el-select v-model="temp.option" style="width:100%">
            <el-option v-for="item in options" :key="item.option" :label="item.label" :value="item.option" />
          </el-select>
        </el-form-item>
        <el-form-item label="opinion">
          <el-input v-model="temp.opinion" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> Cancel</el-button>
        <el-button type="primary" @click="handleApproval()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { download } from '@/api/paper'
import { fetchMyApprovalList, approval } from '@/api/approval'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'ArticleList',
  components: { Pagination },
  filters: {},
  data() {
    return {
      user_id: undefined,
      dialogFormVisible: false,
      list: null,
      total: 0,
      listLoading: true,
      options: [
        {
          option: true,
          label: 'agree'
        },
        {
          option: false,
          label: 'disagree'
        }
      ],
      temp: {
        opinion: '',
        option: '',
        approvalId: undefined
      },
      approvalUsr1s: [],
      approvalUsr2s: [],
      listQuery: {
        current: 1,
        size: 20,
        approvalUsrId: null,
        createUserId: null,
        name: '',
        opt: 'all'
      }
    }
  },
  created() {
    this.user_id = this.$store.getters.user_id
    this.listQuery.approvalUsrId = this.user_id
    this.queryApprovalList()
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
    checkDisabled(status) {
      return status !== 0
    },
    getStatus(status) {
      const statusTypeMap = {
        1: 'agree',
        2: 'disagree',
        0: 'pending'
      }
      return statusTypeMap[status]
    },
    handleApproval() {
      approval(this.temp).then(res => {
        if (res.code === 0) {
          this.$message({
            message: 'Approval Success',
            type: 'success'
          })
        }
        this.dialogFormVisible = false
        this.resetTemp()
        this.handleQueryApprovalAllList()
      })
    },
    handleProcess(row) {
      this.resetTemp()
      // this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.temp.approvalId = row.id
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
    handleQueryApprovedList() {
      this.listQuery.opt = 'approved'
      this.queryApprovalList()
    },
    handleQueryApprovalPendingList() {
      this.listQuery.opt = 'pending'
      this.queryApprovalList()
    },
    handleQueryApprovalAllList() {
      this.listQuery.opt = 'all'
      this.queryApprovalList()
    },
    queryApprovalList() {
      fetchMyApprovalList(this.listQuery).then(res => {
        this.list = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },

    handleFilter() {
      this.listQuery.current = 1
      this.handleQueryApprovalAllList()
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
        opinion: '',
        option: '',
        approvalId: undefined
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
