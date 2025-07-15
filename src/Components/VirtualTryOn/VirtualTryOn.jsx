import React, { useState } from 'react';
import axios from 'axios';
import './VirtualTryOn.css';

const VirtualTryOn = () => {
    const [personImage, setPersonImage] = useState(null);
    const [garmentImage, setGarmentImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    
    const handleImageChange = (e, setImage) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    const handleTryOn = async () => {
        if (!personImage || !garmentImage) {
            alert("Please upload both images!");
            return;
        }

        setLoading(true);
        setProcessingStatus('Analyzing images...');
        
        try {
            const formData = new FormData();
            formData.append("person_image", personImage);
            formData.append("garment_image", garmentImage);

            setProcessingStatus('Generating try-on result...');
            const response = await axios.post("http://localhost:5000/api/generate-3d", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            if (response.data.success) {
                setResultImage(response.data.model);
                setProcessingStatus('Complete!');
            } else {
                throw new Error("Failed to generate try-on result");
            }
        } catch (error) {
            console.error("Error processing try-on:", error);
            alert("Failed to generate try-on result. Please try again!");
            setProcessingStatus('Error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="virtual-tryon-container">
            <h2>Virtual Try-On</h2>
            <div className="image-upload-grid">
                <div className="upload-section">
                    <h3>Upload Your Photo</h3>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setPersonImage)} />
                    {personImage && <img src={URL.createObjectURL(personImage)} alt="Person" />}
                </div>
                
                <div className="upload-section">
                    <h3>Selected Garment</h3>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setGarmentImage)} />
                    {garmentImage && <img src={URL.createObjectURL(garmentImage)} alt="Garment" />}
                </div>
                
                <div className="result-section">
                    <h3>Result</h3>
                    {loading ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <div className="loading-status">{processingStatus}</div>
                        </div>
                    ) : (
                        resultImage && (
                            <div className="result-image-container">
                                <img src={resultImage} alt="AI Generated Try-On Result" />
                                <div className="result-overlay">AI Generated Result</div>
                            </div>
                        )
                    )}
                </div>
            </div>
            
            <button 
                onClick={handleTryOn} 
                className="try-on-button"
                disabled={loading || !personImage || !garmentImage}
            >
                {loading ? 'Processing...' : 'Try On'}
            </button>
        </div>
    );
};

export default VirtualTryOn;