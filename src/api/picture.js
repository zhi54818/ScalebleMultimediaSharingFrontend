import request from '@/utils/request'

/**
 * 上传图片（文件）
 */
export function uploadPicture(file, data) {
  const formData = new FormData()
  formData.append('file', file)
  if (data.id) formData.append('id', data.id)
  if (data.pictureName) formData.append('pictureName', data.pictureName)
  if (data.fileUrl) formData.append('fileUrl', data.fileUrl)
  
  return request({
    url: '/picture/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 通过 URL 上传图片
 */
export function uploadPictureByUrl(data) {
  return request({
    url: '/picture/upload/url',
    method: 'post',
    data
  })
}

/**
 * 删除图片
 */
export function deletePicture(id) {
  return request({
    url: '/picture/delete',
    method: 'post',
    data: { id }
  })
}

/**
 * 批量删除图片
 */
export function deletePictureBatch(pictureIdList) {
  return request({
    url: '/picture/delete/batch',
    method: 'post',
    data: { pictureIdList }
  })
}

/**
 * 编辑图片
 */
export function editPicture(data) {
  return request({
    url: '/picture/edit',
    method: 'post',
    data
  })
}

/**
 * 批量编辑图片
 */
export function editPictureBatch(data) {
  return request({
    url: '/picture/edit/batch',
    method: 'post',
    data
  })
}

/**
 * 根据 id 获取图片
 */
export function getPictureById(id) {
  return request({
    url: '/picture/get/vo',
    method: 'get',
    params: { id }
  })
}

/**
 * 分页获取图片列表
 */
export function listPictureByPage(data) {
  return request({
    url: '/picture/list/page/vo',
    method: 'post',
    data
  })
}

