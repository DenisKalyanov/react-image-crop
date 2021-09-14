import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactCrop from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

interface Crop {
  unit: "px" | "%";
  aspect?: number;
  x?: number;
  y?: number;
  width: number;
  height?: number;
}

const UploadAvatarModal: React.FC = () => {
  const imgRef = useRef<HTMLImageElement>();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [upImg, setUpImg] = useState<string>("");
  const [nameImg, setNameImg] = useState<string | undefined | null>(null);
  const [cropBase64, setCropBase64] = useState<any>("");
  const [crop, setCrop] = useState<Crop>({ unit: "%", width: 30, aspect: 1 });
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
        const readerAvatar: FileReader = new FileReader();
        if (blob != null) readerAvatar.readAsDataURL(blob);
        readerAvatar.onload = () => {
          // props.setAvatar(readerAvatar.result);
        };
        const reader: FileReader = new FileReader();
        if (blob != null) reader.readAsArrayBuffer(blob);
        reader.onload = () => {
          setCropBase64(reader.result);
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

  async function sendToServer() {
    const completedAvatarImage = new File(
      [cropBase64],
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

  return (
    <>
      <div className="" style={{ width: "450px" }}>
        <div>
          {!nameImg && (
            <div>
              <span>
                Drag and drop files to here to upload (png, jpeg, webp, bmp,
                ico.)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="crop-input"
                ref={fileInput}
              />
              <button
                type="button"
                className="crop-button"
                onClick={() => {
                  if (fileInput.current !== null) fileInput.current.click();
                }}
              >
                Choose file
              </button>
            </div>
          )}
          <ReactCrop
            src={upImg}
            onImageLoaded={onLoad}
            crop={crop}
            onChange={(e: Crop) => setCrop(e)}
            onComplete={(e: Crop) => setCompletedCrop(e)}
          />
          <div>
            <canvas
              ref={previewCanvasRef}
              style={{
                width: Math.round(completedCrop?.width ?? 0),
                height: Math.round(completedCrop?.height ?? 0),
              }}
              hidden
            />
          </div>
          <span>{nameImg}</span>
          <div>
            <button disabled={!completedCrop?.width || !completedCrop?.height}>
              Download
            </button>
            <button
              disabled={!completedCrop?.width || !completedCrop?.height}
              onClick={() => sendToServer()}
            >
              Send To server
            </button>
            <button
              disabled={!completedCrop?.width || !completedCrop?.height}
              // onClick={() => sendToServer()}
            >
              Convert crop to base64
            </button>
            <button
              disabled={!completedCrop?.width || !completedCrop?.height}
              // onClick={() => sendToServer()}
            >
              Convert crop to file
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadAvatarModal;
