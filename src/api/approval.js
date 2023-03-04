import request from '@/utils/request'

export function fetchApplicationList(query) {
  return request({
    url: 'approval/list',
    method: 'get',
    params: query
  })
}
export function createApplication(data) {
  return request({
    url: 'approval/create',
    method: 'post',
    data: data
  })
}

export function fetchMyApprovalList(query) {
  return request({
    url: 'approval/approvalList',
    method: 'get',
    params: query
  })
}

export function approval(query) {
  return request({
    url: 'approval/doApproval',
    method: 'post',
    data: query
  })
}
