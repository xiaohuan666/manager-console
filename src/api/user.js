import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    params: data
  })
}

export function getInfo(token) {
  return request({
    url: 'user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: 'user/logout',
    method: 'get'
  })
}

export function fetchUsrList(query) {
  return request({
    url: 'user/list',
    method: 'get',
    params: query
  })
}

export function deleteUser(id) {
  return request({
    url: 'user/' + id,
    method: 'delete'
  })
}
export function getRoles() {
  return request({
    url: 'role/listMetadata',
    method: 'get'
  })
}
export function updateUser(data) {
  return request({
    url: 'user/update',
    method: 'put',
    data
  })
}
export function addUser(data) {
  return request({
    url: 'user/add',
    method: 'post',
    data
  })
}
export function changePassword(data) {
  return request({
    url: 'user/changePassword',
    method: 'post',
    data
  })
}

