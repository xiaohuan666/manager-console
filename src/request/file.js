// 文件模块相关接口
import request from '@/utils/request'
/**
 * 以登录接口为例
 * export const login = p => get('/user/login', p);
 *
 * login ---------- 接口名称
 * p -------------- 传参，若需要在url中拼接其他信息，传参可以改为(p, other)
 * get ------------ 接口调用的方法，来自 http.js 中封装好的四个axios方法 get/post/put/axiosDelete
 * '/user/login' -- 接口url，若需要在url中拼接其他信息：
 *                  首先需要在传参处改为(p, other1, other2)
 *                  然后将url改为`/user/${other1}/login/${other2}`
 * p -------------- 传递给 get/post/put/axiosDelete 中的查询参数/请求体
 *
 *
 *
 * 除此之外，POST 请求支持请求体格式为 FormData，那么就需要多传递一个参数，true，如下示例：
 * export const example = p => post('/test/example', p, true);
 */

/**
 * 获取文件列表相关接口
 */
// 获取文件列表（区分文件路径）
export function getFileListByPath(query) {
  return request({
    url: '/file/getfilelist',
    method: 'get',
    params: query
  })
}

export function getFileListByType(query) {
  return request({
    url: '/file/selectfilebyfiletype',
    method: 'get',
    params: query
  })
}
export function getRecoveryFile(query) {
  return request({
    url: '/recoveryfile/list',
    method: 'get',
    params: query
  })
}
export function getMyShareFileList(query) {
  return request({
    url: '/share/shareList',
    method: 'get',
    params: query
  })
}
// export const getFileListByPath = (p) => get('/file/getfilelist', p)
// 获取文件列表（区分文件类型）
// export const getFileListByType = (p) => get('/file/selectfilebyfiletype', p)
// 获取回收站文件列表
// export const getRecoveryFile = (p) => get('/recoveryfile/list', p)
// 获取我已分享的文件列表
// export const getMyShareFileList = (p) => get('/share/shareList', p)
// 获取存储占用
export function getStorage(param) {
  return request({
    url: 'filetransfer/getstorage',
    method: 'get',
    params: param
  })
}
// export const getStorage = (p) => get('/filetransfer/getstorage', p)
// 获取文件目录树
export function getFoldTree(param) {
  return request({
    url: 'file/getfiletree',
    method: 'get',
    params: param
  })
}
// export const getFoldTree = (p) => get('/file/getfiletree', p)

/**
 * 单文件操作相关接口
 */
// 创建文件
export function createFold(data) {
  return request({
    url: 'file/createFold',
    method: 'post',
    data: data
  })
}
// export const createFold = (p) => post('/file/createFold', p)
// 获取文件详细信息
export function getFileDetail(param) {
  return request({
    url: 'file/detail',
    method: 'get',
    params: param
  })
}
// export const getFileDetail = (p) => get('/file/detail', p)
// 删除文件
export function deletefile(data) {
  return request({
    url: 'file/deletefile',
    method: 'post',
    data: data
  })
}
// export const deleteFile = (p) => post('/file/deletefile', p)
// 复制文件
export function copyfile(data) {
  return request({
    url: 'file/copyfile',
    method: 'post',
    data: data
  })
}
// export const copyFile = (p) => post('/file/copyfile', p)
// 移动文件
export function moveFile(data) {
  return request({
    url: 'file/movefile',
    method: 'post',
    data: data
  })
}
// export const moveFile = (p) => post('/file/movefile', p)
// 重命名文件

// export const renameFile = (p) => post('/file/renamefile', p)
// 解压文件
export function unzipFile(data) {
  return request({
    url: 'file/unzipfile',
    method: 'post',
    data: data
  })
}
// export const unzipFile = (p) => post('/file/unzipfile', p)
// 全局搜索文件
export function searchFile(query) {
  return request({
    url: '/file/search',
    method: 'get',
    params: query
  })
}
// export const searchFile = (p) => get('/file/search', p)
// 分享文件
export function shareFile(data) {
  return request({
    url: 'share/sharefile',
    method: 'post',
    data: data
  })
}
// export const shareFile = (p) => post('/share/sharefile', p)
// 校验分享链接过期时间
export function checkShareLinkEndtime(param) {
  return request({
    url: 'share/checkendtime',
    method: 'get',
    params: param
  })
}
// export const checkShareLinkEndtime = (p) => get('/share/checkendtime', p)
// 校验分享链接是否需要提取码
export function checkShareLinkType(param) {
  return request({
    url: 'share/sharetype',
    method: 'get',
    params: param
  })
}
// export const checkShareLinkType = (p) => get('/share/sharetype', p)
// 校验分享链接提取码是否正确
export function checkShareLinkCode(param) {
  return request({
    url: 'share/checkextractioncode',
    method: 'get',
    params: param
  })
}
// export const checkShareLinkCode = (p) => get('/share/checkextractioncode', p)
// 获取分享文件列表
export function getShareFileList(param) {
  return request({
    url: 'share/sharefileList',
    method: 'get',
    params: param
  })
}
// export const getShareFileList = (p) => get('/share/sharefileList', p)
// 保存分享文件
export function saveShareFile(data) {
  return request({
    url: 'share/savesharefile',
    method: 'post',
    data: data
  })
}
// export const saveShareFile = (p) => post('/share/savesharefile', p)

/**
 * 文件批量操作相关接口
 */
// 批量删除文件
export function batchDeleteFile(data) {
  return request({
    url: 'file/batchdeletefile',
    method: 'post',
    data: data
  })
}
// export const batchDeleteFile = (p) => post('/file/batchdeletefile', p)
// 批量移动文件
export function batchMoveFile(data) {
  return request({
    url: 'file/batchmovefile',
    method: 'post',
    data: data
  })
}
// export const batchMoveFile = (p) => post('/file/batchmovefile', p)

/**
 * 回收站文件操作相关接口
 */
// 回收站文件删除
export function deleteRecoveryFile(data) {
  return request({
    url: 'recoveryfile/deleterecoveryfile',
    method: 'post',
    data: data
  })
}
// export const deleteRecoveryFile = (p) =>
// 	post('/recoveryfile/deleterecoveryfile', p)
// 回收站文件还原
export function restoreRecoveryFile(data) {
  return request({
    url: 'recoveryfile/restorefile',
    method: 'post',
    data: data
  })
}
// export const restoreRecoveryFile = (p) => post('/recoveryfile/restorefile', p)
// 回收站文件批量删除
export function batchDeleteRecoveryFile(data) {
  return request({
    url: 'recoveryfile/batchdelete',
    method: 'post',
    data: data
  })
}
// export const batchDeleteRecoveryFile = (p) =>
// 	post('/recoveryfile/batchdelete', p)

/**
 * 文件公共接口
 */
// 文件预览
export function getFilePreview(data) {
  return request({
    url: 'filetransfer/preview',
    method: 'get',
    params: data
  })
}
// export const getFilePreview = (p) => get('/filetransfer/preview', p)
// 文件修改
export function modifyFileContent(data) {
  return request({
    url: 'file/update',
    method: 'post',
    params: data
  })
}
// export const modifyFileContent = (p) => post('/file/update', p)
