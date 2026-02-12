import { useState, useEffect, useCallback } from 'react'
import './App.scss'
import Compressor from 'compressorjs'
import backIcon from './assets/back.svg'

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(0.6);
  const [closing, setClosing] = useState(false);
  const showComparison = (file && originalUrl && compressedUrl) || closing;

  function resetState() {
    setClosing(true);
    setTimeout(() => {
      setFile(null);
      setOriginalUrl('');
      setCompressedUrl('');
      setClosing(false);
    }, 350);
  }

  const compressImage = useCallback((sourceFile: File, q: number) => {
    new Compressor(sourceFile, {
      quality: q,
      success(result) {
        setTimeout(() => {
          const url = URL.createObjectURL(result);
          setCompressedUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
          setCompressedSize(result.size);
        }, 500);
      },
      error(err) {
        console.log(err.message);
      },
    });
  }, []);

  useEffect(() => {
    if (file) {
      compressImage(file, quality);
    }
  }, [quality, file, compressImage]);

  function replaceFileExtension(filename: string, newExtension: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return filename + newExtension;
    }
    return filename.substring(0, lastDotIndex) + newExtension;
  }

  function getFileExtension(filename: string): string | null{
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return null;
    }
    return filename.substring(lastDotIndex);
  }

  function handleFile(selected: File) {
    setFile(selected);
    setSelectedFilePath(selected.name);
    setOriginalUrl(URL.createObjectURL(selected));
    setOriginalSize(selected.size);
  }

  function selectVideoFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleFile(target.files[0]);
      }
    };
    input.click();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) {
      handleFile(dropped);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <>
    <div className={`container ${file ? "go-back" : ""}`}>
      <div className={`text ${file ? "hide" : ""}`}>
        <h1>Free Online Image Compressor</h1>
        <h2>Reduce image file size without losing quality. Fast, secure, and easy to use.</h2>
      </div>
    </div>
      <div className={`container ${file ? "go-back" : ""}`}>
        
          <div className={`file-input ${file ? "go-back" : ""}`} onClick={file ? resetState : selectVideoFile} onDrop={file ? undefined : handleDrop} onDragOver={file ? undefined : handleDragOver}>
            <div className="inner-container">
              {
              file ?
                <div key="compress" className="compress-another">
                  <img src={backIcon} alt="back" />
                  Compress another image
                  </div>
                : <div key="upload" className="drag-and-drop">
                    Drag and drop an image here or click to select an image.
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M440-200h80v-167l64 64 56-57-160-160-160 160 57 56 63-63v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>
                  </div>
            }
            </div>
          </div>
        

        {showComparison && (
          <div className={`comparison ${closing ? 'closing' : ''}`}>
            <div className="comparison-images">
              <div className="comparison-card">
                <span className="comparison-label">Original</span>
                <img src={originalUrl} alt="Original" />
                <span className="comparison-size">{(originalSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="comparison-card">
                <span className="comparison-label">Compressed</span>
                <img src={compressedUrl} alt="Compressed" />
                <span className="comparison-size">{(compressedSize / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            <div className="quality-slider">
              <label>Quality: {Math.round(quality * 100)}%</label>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
              />
              <button
                className="download-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement('a');
                  link.href = compressedUrl;
                  link.download = replaceFileExtension(selectedFilePath, '_compressed' + getFileExtension(selectedFilePath));
                  link.click();
                }}
              >
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
