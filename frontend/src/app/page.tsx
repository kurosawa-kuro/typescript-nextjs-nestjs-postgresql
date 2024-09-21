'use client';

import React, { useState, ChangeEvent } from "react"
import axios from 'axios'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    } 
  }

  const upload = async () => {
    setUploadStatus("アップロード開始")
    setUploadedImageUrl(null)
    
    if (!file) {
      setUploadStatus('ファイルが選択されていません')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadStatus("サーバーにリクエスト中...")
      const res = await axios.post('http://localhost:3001/upload', formData)
      
      setUploadStatus('ファイルが正常にアップロードされました')
      
      if (res.data.file && res.data.file.filename) {
        setUploadedImageUrl(`http://localhost:3001/Images/${res.data.file.filename}`)
      }
    } catch (error) {
      console.error('アップロードエラー:', error)
      setUploadStatus('アップロードエラーが発生しました')
    } finally {
      setUploadStatus(prevStatus => prevStatus + " (処理完了)")
    }
  }

  return (
    <div>
      <label htmlFor="file-upload">ファイルを選択</label>
      <input id="file-upload" type="file" onChange={handleFileChange}/>
      <button type="button" onClick={upload}>アップロード</button>
      {uploadStatus && <p data-testid="upload-status">アップロードステータス: {uploadStatus}</p>}
      {uploadedImageUrl && (
        <div>
          <h3>アップロードされた画像:</h3>
          <img src={uploadedImageUrl} alt="Uploaded" style={{maxWidth: '300px'}} />
        </div>
      )}
    </div>
  )
}