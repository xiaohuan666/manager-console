import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'file/list',
    method: 'get',
    params: query
  })
}

export function download(id) {
  return request({
    url: 'file/download/' + id,
    method: 'get'
  })
}

export function deleteFile(id) {
  return request({
    url: 'file/' + id,
    method: 'delete'
  })
}

export function uploadFile(param) {
  return request({
    url: 'file/upload',
    method: 'post',
    data: param,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function createFolder(data) {
  return request({
    url: 'file/createFold',
    method: 'post',
    data: data
  })
}

// 重命名文件
export function renameFile(data) {
  return request({
    url: 'file/rename',
    method: 'post',
    data: data
  })
}
