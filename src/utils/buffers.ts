export const loadFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onabort = reject
    reader.onerror = reject
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.readAsArrayBuffer(file)
  })

export const stringToArrayBuffer = (text: string, encoding = 'UTF-8'): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const blob = new Blob([text], { type: `text/plain;charset=${encoding}` })
    const reader = new FileReader()
    reader.onload = (evt) => {
      if (evt.target?.result) {
        resolve(evt.target.result as ArrayBuffer)
      } else {
        reject(new Error('Could not convert string to array!'))
      }
    }
    reader.readAsArrayBuffer(blob)
  })
}