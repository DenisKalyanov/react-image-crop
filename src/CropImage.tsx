import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactCrop from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";
import Button from "./Button";
import "./style.scss";

interface Crop {
  unit: "px" | "%";
  aspect?: number;
  x?: number;
  y?: number;
  width: number;
  height?: number;
}

const CropImage: React.FC = () => {
  const imgRef = useRef<HTMLImageElement>();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [upImg, setUpImg] = useState<string>("");
  const [nameImg, setNameImg] = useState<string | undefined | null>(null);
  const [cropBase64, setCropBase64] = useState<any>("");
  const [cropFile, setCropFile] = useState<any>("");
  const [completedImage, setCompletedImage] = useState<any>();
  const [crop, setCrop] = useState<Crop>({ unit: "%", width: 30 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNameImg(e.target.files[0].name);
      const reader = new FileReader();
      reader.addEventListener("load", () => setUpImg(String(reader.result)));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  function generateAvatar(canvas: HTMLCanvasElement) {
    if (!canvas) {
      return;
    }
    canvas.toBlob(
      (blob: Blob | null) => {
        const readerBase64: FileReader = new FileReader();
        if (blob != null) readerBase64.readAsDataURL(blob);
        readerBase64.onload = () => {
          setCropBase64(readerBase64.result);
        };
        const readerArrayBuffer: FileReader = new FileReader();
        if (blob != null) readerArrayBuffer.readAsArrayBuffer(blob);
        readerArrayBuffer.onload = () => {
          setCropFile(readerArrayBuffer.result);
        };
      },
      "image/jpeg",
      1
    );
  }

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const cropAvatar = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio;

    canvas.width = cropAvatar.width
      ? cropAvatar.width * pixelRatio * scaleX
      : canvas.width;
    canvas.height = cropAvatar.height
      ? cropAvatar.height * pixelRatio * scaleY
      : canvas.height;

    if (ctx) {
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        cropAvatar.x ? cropAvatar.x * scaleX : 0,
        cropAvatar.y ? cropAvatar.y * scaleY : 0,
        cropAvatar.width ? cropAvatar.width * scaleX : 0,
        cropAvatar.height ? cropAvatar.height * scaleY : 0,
        0,
        0,
        cropAvatar.width ? cropAvatar.width * scaleX : 0,
        cropAvatar.height ? cropAvatar.height * scaleY : 0
      );
    }

    generateAvatar(canvas);
  }, [completedCrop]);

  const downloadImage = () => {
    if (!previewCanvasRef.current) {
      return;
    }
    previewCanvasRef.current.toBlob(
      (blob) => {
        const previewUrl = window.URL.createObjectURL(blob);

        const anchor = document.createElement("a");
        anchor.download = "cropPreview.png";
        anchor.href = URL.createObjectURL(blob);
        anchor.click();

        window.URL.revokeObjectURL(previewUrl);
      },
      "image/png",
      1
    );
  };

  async function sendToServer() {
    const completedAvatarImage = new File(
      [cropFile],
      nameImg || "name does not exist",
      {
        type: "image/png",
      }
    );
    const formData: FormData = new FormData();
    formData.append("file", completedAvatarImage);

    let response = await fetch(`url`, {
      method: "POST",
      headers: {
        uploadFile: "file",
        "Content-Type": `multipart/form-data;`,
      },
      body: formData,
    });
  }

  const convertToBase64 = () => {
    setCompletedImage(cropBase64);
  };

  const copyText = () => navigator.clipboard.writeText(completedImage);

  const currentClick = () => {
    if (fileInput.current !== null) fileInput.current.click();
  };

  const inputTemplate = (hiddenElement: boolean) => (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="crop-input"
        ref={fileInput}
        hidden={hiddenElement}
      />
      <button
        type="button"
        className={`crop-input-button ${
          hiddenElement ? "crop-input-button__active" : ""
        }`}
        onClick={currentClick}
      >
        Choose file
      </button>
    </>
  );

  return (
    <>
      <div className="crop-wrapper">
        <h1>React crop image</h1>
        {!nameImg && (
          <div className="crop-wrapper-input">
            <span className="crop-input-description">
              Drag and drop files to here to upload (png, jpeg, webp, bmp, ico.)
            </span>
            {inputTemplate(false)}
          </div>
        )}
        {nameImg && inputTemplate(true)}
        <ReactCrop
          src={upImg}
          onImageLoaded={onLoad}
          crop={crop}
          onChange={(e: Crop) => setCrop(e)}
          onComplete={(e: Crop) => setCompletedCrop(e)}
        />
        {completedCrop && (
          <div>
            <canvas
              ref={previewCanvasRef}
              style={{
                width: Math.round(completedCrop?.width ?? 0),
                height: Math.round(completedCrop?.height ?? 0),
              }}
            />
          </div>
        )}
        {nameImg && <span>File name: {nameImg}</span>}
        <div className="crop-wrapper-buttons">
          <Button
            completedCrop={completedCrop}
            title="Download"
            func={downloadImage}
          />
          <Button
            completedCrop={completedCrop}
            title="Send To server"
            func={sendToServer}
          />
          <Button
            completedCrop={completedCrop}
            title="Convert crop to base64"
            func={convertToBase64}
          />
        </div>
        {completedImage && (
          <p className="crop-completed-image">
            <span className="crop-completed-image-button" onClick={copyText}>
              COPY
            </span>
            {completedImage}
          </p>
        )}
      </div>
    </>
  );
};

export default CropImage;
