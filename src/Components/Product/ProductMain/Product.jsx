import React, { useState, useRef, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../Features/Cart/cartSlice";

import product1 from "../../../Assets/ProductDetail/productdetail-1.jpg";
import product2 from "../../../Assets/ProductDetail/productdetail-2.jpg";
import product3 from "../../../Assets/ProductDetail/productdetail-3.jpg";
import product4 from "../../../Assets/ProductDetail/productdetail-4.jpg";

import { GoChevronLeft } from "react-icons/go";
import { GoChevronRight } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { PiShareNetworkLight } from "react-icons/pi";
import { IoCloseOutline } from "react-icons/io5";
import { BsCameraFill } from "react-icons/bs";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import "./Product.css";

import axios from 'axios';

// Modal style configuration
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '800px',
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto'
};

const Product = () => {
  // Product images Gallery
  const productImg = [product1, product2, product3, product4];
  const [currentImg, setCurrentImg] = useState(0);

  const prevImg = () => {
    setCurrentImg(currentImg === 0 ? productImg.length - 1 : currentImg - 1);
  };

  const nextImg = () => {
    setCurrentImg(currentImg === productImg.length - 1 ? 0 : currentImg + 1);
  };

  // Product Quantity
  const [quantity, setQuantity] = useState(1);

  const increment = () => {
    setQuantity(quantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  // Product WishList
  const [clicked, setClicked] = useState(false);

  const handleWishClick = () => {
    setClicked(!clicked);
  };

  // Product Sizes
  const sizes = ["XS", "S", "M", "L", "XL"];
  const sizesFullName = [
    "Extra Small",
    "Small",
    "Medium",
    "Large",
    "Extra Large",
  ];
  const [selectSize, setSelectSize] = useState("S");

  // Product Colors
  const [highlightedColor, setHighlightedColor] = useState("#C8393D");
  const colors = ["#222222", "#C8393D", "#E4E4E4"];
  const colorsName = ["Black", "Red", "Grey"];

  // Product Detail to Redux
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const handleAddToCart = () => {
    const productDetails = {
      productID: 14,
      productName: "Lightweight Puffer Jacket",
      productPrice: "₹299",
      frontImg: productImg[0],
      productReviews: "8k+ reviews",
    };

    const productInCart = cartItems.find(
      (item) => item.productID === productDetails.productID
    );

    if (productInCart && productInCart.quantity >= 20) {
      toast.error("Product limit reached", {
        duration: 2000,
        style: {
          backgroundColor: "#ff4b4b",
          color: "white",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#ff4b4b",
        },
      });
    } else {
      dispatch(addToCart(productDetails));
      toast.success(`Added to cart!`, {
        duration: 2000,
        style: {
          backgroundColor: "#07bc0c",
          color: "white",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#07bc0c",
        },
      });
    }
  };

  // Virtual Mirror Modal
  const [openMirror, setOpenMirror] = useState(false);
  const [mirrorView, setMirrorView] = useState("options"); // options, upload, camera, result
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleOpenMirror = () => {
    setOpenMirror(true);
    setMirrorView("options");
  };

  const handleCloseMirror = () => {
    setOpenMirror(false);
    stopCamera();
    setMirrorView("options");
  };

  const handleUploadOption = () => {
    setMirrorView("upload");
  };

  const handleCameraOption = () => {
    setMirrorView("camera");
    handleOpenCamera();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
      setMirrorView("upload-preview");
    }
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImage(null);
    setMirrorView("upload");
  };

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 1280, height: 720 }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing the camera: ", error);
      toast.error("Unable to access camera. Please check permissions.", {
        duration: 3000,
      });
      setMirrorView("options");
    }
  };

  const handleCaptureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL("image/png"));
    setMirrorView("camera-preview");
    stopCamera();
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleRemoveCapturedImage = () => {
    setCapturedImage(null);
    setMirrorView("camera");
    handleOpenCamera();
  };

  const processImage = (sourceImage) => {
    setProcessing(true);
    
    // Simulate API call to face-swapping service
    setTimeout(() => {
      // For demo purposes, we're just overlaying the product on the source image
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        
        // Here we would typically call an API to do the actual face swapping
        // For now, just add a watermark to simulate processing
        context.font = "20px Arial";
        context.fillStyle = "rgba(255, 255, 255, 0.7)";
        context.fillText("Virtual Try-On Preview", 20, 40);
        
        setProcessedImage(canvas.toDataURL("image/png"));
        setMirrorView("result");
        setProcessing(false);
      };
      img.src = sourceImage;
    }, 2000);
  };

  // Add these state variables for virtual try-on
  const [progress, setProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(true);

  // Add face detection function
  const detectFace = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob);
      
      const detectResponse = await axios.post('/api/detect-face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return detectResponse.data.faceDetected;
    } catch (error) {
      console.error("Face detection failed:", error);
      return true;
    }
  };

  // Modify handleProcessUploadedImage
  const handleProcessUploadedImage = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      // Convert base64 to blob
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      formData.append("person_image", blob);
      formData.append("garment_image", productImg[currentImg]);

      const apiResponse = await axios.post("http://localhost:5000/api/generate-3d", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(progress);
        }
      });

      if (apiResponse.data.success) {
        setProcessedImage(apiResponse.data.model);
        setMirrorView("result");
      } else {
        throw new Error(apiResponse.data.error || "Failed to generate try-on result");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate try-on result. Please try again!");
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessCapturedImage = async () => {
    if (!capturedImage) {
      toast.error("Please capture an image first");
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      formData.append("person_image", blob);
      formData.append("garment_image", productImg[currentImg]);

      const apiResponse = await axios.post("http://localhost:5000/api/generate-3d", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(progress);
        }
      });

      if (apiResponse.data.success) {
        setProcessedImage(apiResponse.data.model);
        setMirrorView("result");
      } else {
        throw new Error(apiResponse.data.error || "Failed to generate try-on result");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate try-on result. Please try again!");
    } finally {
      setProcessing(false);
    }
  };

  const handleTryAgain = () => {
    setProcessedImage(null);
    setMirrorView("options");
  };

  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Add these state variables in your component
  const [is3DProcessing, setIs3DProcessing] = useState(false);
  const [model3D, setModel3D] = useState(null);

  // Add this function to handle 3D generation
  const generate3DModel = async (imageData) => {
    setIs3DProcessing(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData })
      });
      
      const data = await response.json();
      if (data.success) {
        setModel3D(data.model);
        setMirrorView("3d-view");
      } else {
        toast.error("Failed to generate 3D model");
      }
    } catch (error) {
      console.error("Error generating 3D model:", error);
      toast.error("Error generating 3D model");
    } finally {
      setIs3DProcessing(false);
    }
  };

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleTryOn = async () => {
    const formData = new FormData();
    formData.append('userImage', userImage);
    formData.append('productImage', selectedProduct.image); // Assuming selectedProduct has the image path

    try {
      const response = await axios.post('http://localhost:5000/api/try-on', formData);
      if (response.data.success) {
        setResultImage(response.data.resultImage);
      }
    } catch (error) {
      console.error("Error during try-on:", error);
    }
  };

  return (
    <>
      <div className="productSection">
        <div className="productShowCase">
          <div className="productGallery">
            <div className="productThumb">
              <img src={product1} onClick={() => setCurrentImg(0)} alt="" />
              <img src={product2} onClick={() => setCurrentImg(1)} alt="" />
              <img src={product3} onClick={() => setCurrentImg(2)} alt="" />
              <img src={product4} onClick={() => setCurrentImg(3)} alt="" />
            </div>
            <div className="productFullImg">
              <img src={productImg[currentImg]} alt="" />
              <div className="buttonsGroup">
                <button onClick={prevImg} className="directionBtn">
                  <GoChevronLeft size={18} />
                </button>
                <button onClick={nextImg} className="directionBtn">
                  <GoChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="productDetails">
            <div className="productBreadcrumb">
              <div className="breadcrumbLink">
                <Link to="/">Home</Link>&nbsp;/&nbsp;
                <Link to="/shop">The Shop</Link>
              </div>
              <div className="prevNextLink">
                <Link to="/product">
                  <GoChevronLeft />
                  <p>Prev</p>
                </Link>
                <Link to="/product">
                  <p>Next</p>
                  <GoChevronRight />
                </Link>
              </div>
            </div>
            <div className="productName">
              <h1>Lightweight Puffer Jacket With a Hood</h1>
            </div>
            <div className="productRating">
              <FaStar color="#FEC78A" size={10} />
              <FaStar color="#FEC78A" size={10} />
              <FaStar color="#FEC78A" size={10} />
              <FaStar color="#FEC78A" size={10} />
              <FaStar color="#FEC78A" size={10} />
              <p>8k+ reviews</p>
            </div>
            <div className="productPrice">
              <h3>$90</h3>
            </div>
            <div className="productDescription">
              <p>
                The lightweight puffer jacket with a hood is designed for comfort and style. Made from soft cotton fabric, it features a relaxed fit and a detachable hood for versatility. The jacket is filled with warm insulation to keep you cozy on chilly days. The adjustable cuffs and hem ensure a snug fit, while the zip-up front and two side pockets provide easy access to your belongings.
              </p>
            </div>
            <div className="productSizeColor">
              <div className="productSize">
                <p>Sizes</p>
                <div className="sizeBtn">
                  {sizes.map((size, index) => (
                    <Tooltip
                      key={size}
                      title={sizesFullName[index]}
                      placement="top"
                      TransitionComponent={Zoom}
                      enterTouchDelay={0}
                      arrow
                    >
                      <button
                        style={{
                          borderColor: selectSize === size ? "#000" : "#e0e0e0",
                        }}
                        onClick={() => setSelectSize(size)}
                      >
                        {size}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
              <div className="productColor">
                <p>Color</p>
                <div className="colorBtn">
                  {colors.map((color, index) => (
                    <Tooltip
                      key={color}
                      title={colorsName[index]}
                      placement="top"
                      enterTouchDelay={0}
                      TransitionComponent={Zoom}
                      arrow
                    >
                      <button
                        className={
                          highlightedColor === color ? "highlighted" : ""
                        }
                        style={{
                          backgroundColor: color.toLowerCase(),
                          border:
                            highlightedColor === color
                              ? "0px solid #000"
                              : "0px solid white",
                          padding: "8px",
                          margin: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => setHighlightedColor(color)}
                      />
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
            <div className="productCartQuantity">
              <div className="productQuantity">
                <button onClick={decrement}>-</button>
                <input
                  type="text"
                  value={quantity}
                  onChange={handleInputChange}
                />
                <button onClick={increment}>+</button>
              </div>
              <div className="productCartBtn">
                <button onClick={handleAddToCart}>Add to Cart</button>
                <button 
                  onClick={handleOpenMirror} 
                  style={{ 
                    background: "linear-gradient(to right, #ff9966, #ff5e62)",
                    color: "white", 
                    padding: "12px 24px", 
                    borderRadius: "25px", 
                    margin: "10px", 
                    cursor: "pointer",
                    border: "none",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.3s ease"
                  }}
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="10" r="3"></circle>
                    <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"></path>
                  </svg>
                  Virtual Mirror
                </button>
              </div>
            </div>
            <div className="productWishShare">
              <div className="productWishList">
                <button onClick={handleWishClick}>
                  <FiHeart color={clicked ? "red" : ""} size={17} />
                  <p>Add to Wishlist</p>
                </button>
              </div>
              <div className="productShare">
                <PiShareNetworkLight size={22} />
                <p>Share</p>
              </div>
            </div>
            <div className="productTags">
              <p>
                <span>SKU: </span>N/A
              </p>
              <p>
                <span>CATEGORIES: </span>Casual & Urban Wear, Jackets, Men
              </p>
              <p>
                <span>TAGS: </span>biker, black, bomber, leather
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Mirror Modal */}
      <Modal
        open={openMirror}
        onClose={handleCloseMirror}
        aria-labelledby="virtual-mirror-modal"
        aria-describedby="try-on-clothing-virtually"
      >
        <Box sx={modalStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Typography id="virtual-mirror-modal-title" variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Virtual Mirror
            </Typography>
            <button
              onClick={handleCloseMirror}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px'
              }}
            >
              <IoCloseOutline size={24} />
            </button>
          </div>

          {/* Main content based on current view */}
          {mirrorView === "options" && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '20px',
              padding: '30px 0'
            }}>
              <Typography variant="body1" sx={{ textAlign: 'center', maxWidth: '600px', marginBottom: '20px' }}>
                Try on this Lightweight Puffer Jacket virtually! Our AI technology will show you how it looks on you.
              </Typography>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '30px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleUploadOption}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '30px',
                    background: '#f8f9fa',
                    border: '2px dashed #ced4da',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    width: '200px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FaCloudUploadAlt size={48} color="#6c757d" />
                  <Typography variant="h6" sx={{ marginTop: '15px', fontWeight: 'medium' }}>
                    Upload Photo
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', color: '#6c757d', marginTop: '8px' }}>
                    Select a photo from your device
                  </Typography>
                </button>

                <button
                  onClick={handleCameraOption}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '30px',
                    background: '#f8f9fa',
                    border: '2px dashed #ced4da',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    width: '200px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <BsCameraFill size={48} color="#6c757d" />
                  <Typography variant="h6" sx={{ marginTop: '15px', fontWeight: 'medium' }}>
                    Take Photo
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', color: '#6c757d', marginTop: '8px' }}>
                    Use your camera to take a selfie
                  </Typography>
                </button>
              </div>
            </div>
          )}

          {mirrorView === "upload" && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              padding: '40px 0'
            }}>
              <div
                style={{
                  border: '2px dashed #ced4da',
                  borderRadius: '12px',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '80%',
                  maxWidth: '500px',
                  cursor: 'pointer',
                  background: '#f8f9fa'
                }}
                onClick={triggerFileInput}
              >
                <FaCloudUploadAlt size={64} color="#6c757d" />
                <Typography variant="h6" sx={{ marginTop: '20px', fontWeight: 'medium' }}>
                  Drag & Drop or Click to Upload
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#6c757d', marginTop: '10px' }}>
                  For best results, use a clear, front-facing photo
                </Typography>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              <button
                onClick={() => setMirrorView("options")}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Back to Options
              </button>
            </div>
          )}

          {mirrorView === "upload-preview" && uploadedImage && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              padding: '20px 0'
            }}>
              <Typography variant="h6" sx={{ marginBottom: '20px' }}>
                Preview Your Photo
              </Typography>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '400px',
                  marginBottom: '30px'
                }}
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded Preview"
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <button
                  onClick={handleRemoveUploadedImage}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <MdDelete size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => setMirrorView("upload")}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid #ced4da',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Upload Different Photo
                </button>
                <button
                  onClick={handleProcessUploadedImage}
                  disabled={processing}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    background: 'linear-gradient(to right, #ff9966, #ff5e62)',
                    color: 'white',
                    border: 'none',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: processing ? 0.7 : 1
                  }}
                >
                  {processing ? 'Processing...' : 'Try It On'}
                </button>
              </div>
            </div>
          )}

          {mirrorView === "camera" && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              padding: '20px 0'
            }}>
              <Typography variant="body1" sx={{ marginBottom: '20px', textAlign: 'center' }}>
                Position your face in the center of the frame for best results
              </Typography>
              <div
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  marginBottom: '20px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: 'auto',
                    transform: 'scaleX(-1)' // Mirror effect
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => {
                    stopCamera();
                    setMirrorView("options");
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid #ced4da',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCaptureImage}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Capture Photo
                </button>
              </div>
            </div>
          )}

          {mirrorView === "camera-preview" && capturedImage && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              padding: '20px 0'
            }}>
              <Typography variant="h6" sx={{ marginBottom: '20px' }}>
                Preview Your Photo
              </Typography>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '400px',
                  marginBottom: '30px'
                }}
              >
                <img
                  src={capturedImage}
                  alt="Captured Preview"
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <button
                  onClick={handleRemoveCapturedImage}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <MdDelete size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setMirrorView("camera");
                    handleOpenCamera();
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid #ced4da',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Take Another Photo
                </button>
                <button
                  onClick={handleProcessCapturedImage}
                  disabled={processing}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    background: 'linear-gradient(to right, #ff9966, #ff5e62)',
                    color: 'white',
                    border: 'none',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: processing ? 0.7 : 1
                  }}
                >
                  {processing ? 'Processing...' : 'Try It On'}
                </button>
              </div>
            </div>
          )}

          {mirrorView === "result" && processedImage && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              padding: '20px 0'
            }}>
              <Typography variant="h6" sx={{ marginBottom: '10px', fontWeight: 'bold' }}>
                Here's How It Looks On You!
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: '20px', color: '#6c757d', textAlign: 'center' }}>
                Our AI has merged your photo with the selected product
              </Typography>
              <div
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  marginBottom: '30px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={processedImage}
                  alt="Virtual Try-On Result"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '10px',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={handleTryAgain}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid #ced4da',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Try Another Photo
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would add the product to cart
                    alert('Product added to cart!');
                    handleCloseMirror();
                  }}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}
          {mirrorView === "3d-view" && model3D && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              padding: '20px 0'
            }}>
              <Typography variant="h6" sx={{ marginBottom: '10px', fontWeight: 'bold' }}>
                3D View of Your Product
              </Typography>
              <div
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  height: '400px',
                  marginBottom: '30px',
                  position: 'relative'
                }}
              >
                {/* Add your 3D viewer component here */}
                <model-viewer
                  src={model3D}
                  auto-rotate
                  camera-controls
                  style={{
                    width: '100%',
                    height: '100%'
                  }}
                ></model-viewer>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => setMirrorView("options")}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid #ced4da',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Try Another Photo
                </button>
              </div>
            </div>
          )}
          {processing && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Processing... {progress}%
              </Typography>
            </div>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default Product;