import {Backend} from './backend'

export class OSGBackend extends Backend {
  public indexKey: string

  constructor(indexKey: string = 'snek-finder-osg-backend') {
    super()
    this.indexKey = indexKey
  }

  async upload(file: File) {
    const url = 'https://osg.snek.at/storage'

    console.log('uploading file', file)

    // add correct extension to filename if missing
    if (!file.name.includes('.')) {
      const mimeType = file.type
      const ext = mimeType.split('/')[1]

      file = new File([file], `${file.name}.${ext}`, {
        type: mimeType
      })
    }

    const formData = new FormData()
    formData.append('file', file)

    const resp = await fetch(url, {
      body: formData,
      method: 'POST'
    })

    const json = await resp.json()

    const src = `${url}/${json.file_id}`
    const previewSrc = json.thumb?.file_id
      ? `${url}/${json.thumb.file_id}`
      : undefined

    return {
      src,
      previewSrc
    }
  }
}

export default new OSGBackend('snek-finder-osg-backend-root')
