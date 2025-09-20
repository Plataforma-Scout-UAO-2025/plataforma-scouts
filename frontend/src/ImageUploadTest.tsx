import React, { useState, useRef } from 'react';

interface UploadResponse {
  fileUrl: string;
  message?: string;
  error?: string;
}

const ImageUploadTest: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadedImageUrl('');
    setUploadStatus('');
    
    // Crear preview local
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadStatus('❌ Por favor selecciona solo archivos de imagen');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Por favor selecciona una imagen primero');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Subiendo imagen...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Endpoint del backend Spring Boot
      const response = await fetch('http://localhost:8080/api/test/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: UploadResponse = await response.json();
        setUploadedImageUrl(result.fileUrl);
        setUploadStatus('✅ Imagen subida exitosamente!');
      } else {
        const errorData: UploadResponse = await response.json();
        setUploadStatus(`❌ Error: ${errorData.error || 'Error al subir la imagen'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setUploadStatus(`❌ Error de conexión: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setUploadedImageUrl('');
    setUploadStatus('');
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '50px auto', 
      padding: '30px', 
      border: '2px solid #e0e0e0',
      borderRadius: '10px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9f9f9'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#333',
        marginBottom: '30px'
      }}>
        🖼️ Test de Subida de Imágenes
      </h2>

      {/* Área de Drop y Selección */}
      <div 
        style={{
          border: '3px dashed #007bff',
          borderRadius: '10px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '20px',
          backgroundColor: selectedFile ? '#e8f5e8' : '#f8f9fa',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {!selectedFile ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>
              Haz clic aquí o arrastra una imagen
            </h3>
            <p style={{ color: '#666', margin: '0' }}>
              Soporta JPG, PNG, GIF (máx. 10MB)
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h3 style={{ color: '#28a745', marginBottom: '10px' }}>
              Archivo seleccionado
            </h3>
            <p style={{ color: '#666', margin: '0' }}>
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </>
        )}
      </div>

      {/* Preview local de la imagen */}
      {previewUrl && (
        <div style={{ 
          marginBottom: '20px',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f0f8ff',
          borderRadius: '10px',
          border: '1px solid #b3d9ff'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#0066cc' }}>
            � Preview Local:
          </h4>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              border: '2px solid #007bff',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      )}

      {/* Botones grandes */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '20px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: isUploading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          {isUploading ? '⏳ Subiendo...' : '� SUBIR IMAGEN'}
        </button>

        <button
          onClick={openFileDialog}
          style={{
            padding: '20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          📁 ELEGIR ARCHIVO
        </button>

        <button
          onClick={clearAll}
          style={{
            padding: '20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          🗑️ LIMPIAR
        </button>
      </div>

      {/* Estado de la subida */}
      {uploadStatus && (
        <div style={{
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          backgroundColor: uploadStatus.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${uploadStatus.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          color: uploadStatus.includes('✅') ? '#155724' : '#721c24'
        }}>
          {uploadStatus}
        </div>
      )}

      {/* Imagen subida y su URL */}
      {uploadedImageUrl && (
        <div style={{
          border: '2px solid #28a745',
          borderRadius: '10px',
          padding: '20px',
          backgroundColor: '#d4edda'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: '#155724',
            textAlign: 'center'
          }}>
            🎉 ¡Imagen subida exitosamente!
          </h3>
          
          {/* URL de la imagen */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#155724'
            }}>
              🔗 URL de la imagen:
            </label>
            <input
              type="text"
              value={uploadedImageUrl}
              readOnly
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #c3e6cb',
                borderRadius: '5px',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            />
            <button
              onClick={() => navigator.clipboard.writeText(uploadedImageUrl)}
              style={{
                marginTop: '5px',
                padding: '5px 10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              📋 Copiar URL
            </button>
          </div>

          {/* Preview de la imagen */}
          <div style={{ textAlign: 'center' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px',
              fontWeight: 'bold',
              color: '#155724'
            }}>
              🖼️ Preview de la imagen:
            </label>
            <img
              src={uploadedImageUrl}
              alt="Imagen subida"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                border: '1px solid #c3e6cb',
                borderRadius: '5px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                setUploadStatus('❌ Error al cargar la imagen desde la URL');
              }}
            />
          </div>
        </div>
      )}

      {/* Instrucciones mejoradas */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#fff3cd',
        border: '2px solid #ffeaa7',
        borderRadius: '10px',
        fontSize: '15px'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#856404', textAlign: 'center' }}>
          📝 ¿Cómo usar?
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', color: '#856404' }}>
          <div>
            <strong>Método 1: Drag & Drop</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Arrastra una imagen al área azul</li>
              <li>Se mostrará un preview</li>
              <li>Haz clic en "SUBIR IMAGEN"</li>
            </ul>
          </div>
          <div>
            <strong>Método 2: Botón</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Haz clic en "ELEGIR ARCHIVO"</li>
              <li>Selecciona tu imagen</li>
              <li>Haz clic en "SUBIR IMAGEN"</li>
            </ul>
          </div>
        </div>
        <p style={{ margin: '15px 0 0 0', textAlign: 'center', fontWeight: 'bold' }}>
          ⚡ Asegúrate de que tu backend esté corriendo en localhost:8080
        </p>
      </div>
    </div>
  );
};

export default ImageUploadTest;