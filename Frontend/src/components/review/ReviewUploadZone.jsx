import React, { useCallback, useRef, useState } from "react";
import "./ReviewUploadZone.css";

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ReviewUploadZone({ files = [], onFilesChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = useCallback(
    (file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return "Định dạng không hỗ trợ. Vui lòng chọn ảnh JPG, PNG, WebP hoặc GIF.";
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return `Ảnh vượt quá ${MAX_SIZE_MB}MB. Vui lòng chọn ảnh nhỏ hơn.`;
      }
      if (files.length >= MAX_FILES) {
        return `Tối đa ${MAX_FILES} ảnh.`;
      }
      return null;
    },
    [files.length],
  );

  const handleFiles = useCallback(
    (newFiles) => {
      const remaining = MAX_FILES - files.length;
      if (remaining <= 0) return;

      const valid = [];
      for (const file of Array.from(newFiles).slice(0, remaining)) {
        const err = validateFile(file);
        if (err) {
          setError(err);
          continue;
        }
        valid.push(file);
      }
      if (valid.length > 0) {
        setError(null);
        onFilesChange([...files, ...valid]);
      }
    },
    [files, onFilesChange, validateFile],
  );

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleInputChange(e) {
    handleFiles(e.target.files);
    e.target.value = "";
  }

  function removeFile(index) {
    setError(null);
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <fieldset className="review-upload-fieldset">
      <legend className="review-upload-legend">
        Hình ảnh sản phẩm{" "}
        <span className="review-upload-optional">(không bắt buộc)</span>
      </legend>

      {/* Previews */}
      {files.length > 0 && (
        <ul className="review-upload-previews" aria-label="Ảnh đã chọn">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="review-upload-preview-item"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Ảnh ${i + 1}`}
                className="review-upload-thumb"
              />
              <button
                type="button"
                className="review-upload-remove"
                onClick={() => removeFile(i)}
                aria-label={`Xóa ảnh ${i + 1}: ${file.name}`}
                title={`Xóa ${file.name}`}
              >
                ✕
              </button>
              <span className="review-upload-file-name">{file.name}</span>
              <span className="review-upload-file-size">
                {formatSize(file.size)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Drop zone */}
      {files.length < MAX_FILES && (
        <div
          className={`review-upload-zone ${dragOver ? "review-upload-zone-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Tải lên ảnh sản phẩm"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <span className="review-upload-icon" aria-hidden="true">
            📷
          </span>
          <span className="review-upload-text">
            Kéo thả ảnh vào đây hoặc{" "}
            <span className="review-upload-link">chọn ảnh</span>
          </span>
          <span className="review-upload-hint">
            JPG, PNG, WebP, GIF — Tối đa {MAX_SIZE_MB}MB/ảnh, {MAX_FILES} ảnh
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleInputChange}
        className="review-upload-input-hidden"
        aria-hidden="true"
      />

      {error && (
        <p className="review-upload-error" role="alert">
          ⚠️ {error}
        </p>
      )}
    </fieldset>
  );
}
