"""
Image Processing Module for Onion Crop Health Analysis
Performs NDVI, SAVI, and GNDVI calculation and crop health analysis using OpenCV and TensorFlow.
Optimized for onion (Allium cepa) crop monitoring.
"""
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import json


def calculate_ndvi(image_path: str) -> Dict:
    """
    Calculate NDVI (Normalized Difference Vegetation Index) from an RGB image.
    
    For RGB images (non-multispectral), this uses a pseudo-NDVI approximation
    based on Red and Green channels. For true NDVI, use NIR band if available.
    
    Args:
        image_path: Path to the input image file
        
    Returns:
        Dictionary with NDVI statistics and processed image data
    """
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    
    # Convert BGR to RGB (OpenCV uses BGR by default)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Extract channels
    red = img_rgb[:, :, 0].astype(np.float32)
    green = img_rgb[:, :, 1].astype(np.float32)
    blue = img_rgb[:, :, 2].astype(np.float32)
    
    # Pseudo-NDVI approximation for RGB images
    # Using formula: (NIR - Red) / (NIR + Red)
    # Approximate NIR as: (2 * Green) - Red (common approximation)
    # Alternative: use Green channel as proxy
    nir_approx = (2.0 * green) - red
    nir_approx = np.clip(nir_approx, 0, 255)
    
    # Calculate NDVI
    denominator = red + nir_approx + 1e-7  # Avoid division by zero
    ndvi = (nir_approx - red) / denominator
    
    # Normalize to 0-1 range
    ndvi = np.clip(ndvi, -1, 1)
    ndvi_normalized = (ndvi + 1) / 2.0  # Scale to 0-1 for visualization
    
    # Calculate statistics
    mean_ndvi = float(np.mean(ndvi))
    std_ndvi = float(np.std(ndvi))
    min_ndvi = float(np.min(ndvi))
    max_ndvi = float(np.max(ndvi))
    
    # Onion-specific health classification based on NDVI
    # NDVI ranges: -1 to 1, typically vegetation is 0.2-0.8
    # Onion-specific thresholds optimized for Allium cepa
    if mean_ndvi < 0.2:
        health_status = "Very Poor"
        summary = "Critical attention needed - Onion crop severely stressed, brown/yellow foliage, sparse canopy"
    elif mean_ndvi < 0.4:
        health_status = "Poor"
        summary = "Attention needed - Onion crop showing stress, yellowing foliage, reduced canopy coverage"
    elif mean_ndvi < 0.6:
        health_status = "Moderate"
        summary = "Moderate health - Onion crop with light green foliage, some stress indicators present"
    elif mean_ndvi < 0.8:
        health_status = "Healthy"
        summary = "Healthy - Onion crop with green foliage, good canopy coverage, normal growing conditions"
    else:
        health_status = "Very Healthy"
        summary = "Very healthy - Onion crop with dark green vigorous foliage, optimal growing conditions"
    
    # Identify stress zones (low NDVI regions)
    stress_threshold = mean_ndvi - std_ndvi
    stress_mask = ndvi < stress_threshold
    stress_coords = np.where(stress_mask)
    
    # Generate stress zones grid (10x10 for visualization)
    h, w = ndvi.shape
    grid_size = 10
    stress_zones = []
    
    cell_h, cell_w = h // grid_size, w // grid_size
    for y in range(grid_size):
        for x in range(grid_size):
            y_start, y_end = y * cell_h, (y + 1) * cell_h
            x_start, x_end = x * cell_w, (x + 1) * cell_w
            
            cell_ndvi = ndvi[y_start:y_end, x_start:x_end]
            cell_mean = float(np.mean(cell_ndvi))
            
            # Convert to severity (0-1, where 1 is most stressed)
            severity = 1.0 - np.clip((cell_mean + 1) / 2.0, 0, 1)
            
            if severity > 0.3:  # Only flag significant stress
                stress_zones.append({
                    'x': x,
                    'y': y,
                    'severity': round(severity, 2),
                    'ndvi': round(cell_mean, 3)
                })
    
    # Create NDVI visualization (color-coded)
    ndvi_visual = np.zeros((h, w, 3), dtype=np.uint8)
    # Color mapping: red (low) -> yellow -> green (high)
    ndvi_scaled = (ndvi_normalized * 255).astype(np.uint8)
    ndvi_visual[:, :, 0] = np.clip(255 - ndvi_scaled, 0, 255)  # Red channel
    ndvi_visual[:, :, 1] = ndvi_scaled  # Green channel
    ndvi_visual[:, :, 2] = np.clip(255 - ndvi_scaled * 0.5, 0, 255)  # Blue channel
    
    return {
        'ndvi_mean': round(mean_ndvi, 3),
        'ndvi_std': round(std_ndvi, 3),
        'ndvi_min': round(min_ndvi, 3),
        'ndvi_max': round(max_ndvi, 3),
        'health_status': health_status,
        'summary': summary,
        'stress_zones': stress_zones,
        'ndvi_map_shape': list(ndvi.shape),
        'stress_count': len(stress_zones)
    }


def calculate_gndvi(image_path: str) -> Dict:
    """
    Calculate GNDVI (Green Normalized Difference Vegetation Index) from an RGB image.
    
    GNDVI = (NIR - Green) / (NIR + Green)
    
    GNDVI is particularly useful for early growth stages and is less sensitive to
    atmospheric conditions. Good for onion crops during early development.
    
    For RGB images, approximates NIR similar to NDVI calculation.
    
    Args:
        image_path: Path to the input image file
        
    Returns:
        Dictionary with GNDVI statistics
    """
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    
    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Extract channels
    red = img_rgb[:, :, 0].astype(np.float32)
    green = img_rgb[:, :, 1].astype(np.float32)
    
    # Approximate NIR (same as NDVI)
    nir_approx = (2.0 * green) - red
    nir_approx = np.clip(nir_approx, 0, 255)
    
    # Calculate GNDVI
    denominator = green + nir_approx + 1e-7
    gndvi = (nir_approx - green) / denominator
    
    # Normalize to 0-1 range
    gndvi = np.clip(gndvi, -1, 1)
    gndvi_normalized = (gndvi + 1) / 2  # Scale to 0-1
    
    # Calculate statistics
    mean_gndvi = float(np.mean(gndvi))
    std_gndvi = float(np.std(gndvi))
    min_gndvi = float(np.min(gndvi))
    max_gndvi = float(np.max(gndvi))
    
    return {
        'gndvi_mean': round(mean_gndvi, 3),
        'gndvi_std': round(std_gndvi, 3),
        'gndvi_min': round(min_gndvi, 3),
        'gndvi_max': round(max_gndvi, 3),
        'gndvi_map': gndvi_normalized.tolist()  # For visualization if needed
    }


def calculate_savi(image_path: str, L: float = 0.5) -> Dict:
    """
    Calculate SAVI (Soil-Adjusted Vegetation Index) from an RGB image.
    
    SAVI = ((NIR - Red) / (NIR + Red + L)) * (1 + L)
    Where L is a soil adjustment factor (typically 0.5)
    
    For RGB images, approximates NIR similar to NDVI calculation.
    
    Args:
        image_path: Path to the input image file
        L: Soil adjustment factor (default 0.5)
        
    Returns:
        Dictionary with SAVI statistics
    """
    import cv2
    import numpy as np
    
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    
    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Extract channels
    red = img_rgb[:, :, 0].astype(np.float32)
    green = img_rgb[:, :, 1].astype(np.float32)
    
    # Approximate NIR (same as NDVI)
    nir_approx = (2.0 * green) - red
    nir_approx = np.clip(nir_approx, 0, 255)
    
    # Calculate SAVI
    denominator = red + nir_approx + L + 1e-7
    savi = ((nir_approx - red) / denominator) * (1 + L)
    
    # Normalize to 0-1 range
    savi = np.clip(savi, -1, 1)
    savi_normalized = (savi + 1) / 2  # Scale to 0-1
    
    # Calculate statistics
    mean_savi = float(np.mean(savi_normalized))
    std_savi = float(np.std(savi_normalized))
    min_savi = float(np.min(savi_normalized))
    max_savi = float(np.max(savi_normalized))
    
    return {
        'savi_mean': round(mean_savi, 3),
        'savi_std': round(std_savi, 3),
        'savi_min': round(min_savi, 3),
        'savi_max': round(max_savi, 3),
        'savi_map': savi_normalized.tolist()  # For visualization if needed
    }


def classify_crop_health_tensorflow(image_path: str, model_path: Optional[str] = None) -> Dict:
    """
    Classify onion crop health using a trained TensorFlow model.
    
    Loads the trained model and runs inference on the input image.
    Optimized for onion (Allium cepa) crop health classification.
    
    Args:
        image_path: Path to the input image
        model_path: Optional path to saved TensorFlow model
                    (defaults to ./models/onion_crop_health_model.h5)
        
    Returns:
        Dictionary with classification results including:
        - classification: Predicted health category
        - confidence: Confidence score (0-1)
        - classes: All available class names
        - all_predictions: Probability distribution across all classes
        - model_loaded: Whether model was successfully loaded
        - crop_type: 'onion'
    """
    import os
    
    # Default model path
    if model_path is None:
        # Try environment variable first
        model_path = os.getenv('ONION_MODEL_PATH', './models/onion_crop_health_model.h5')
    
    # Check if model exists
    if not os.path.exists(model_path):
        return {
            'classification': 'model_not_found',
            'confidence': 0.0,
            'classes': ['very_healthy', 'healthy', 'moderate', 'poor', 'very_poor', 'diseased', 'stressed', 'weeds'],
            'all_predictions': {},
            'model_loaded': False,
            'crop_type': 'onion',
            'error': f'Model file not found: {model_path}'
        }
    
    try:
        # Load model
        import tensorflow as tf
        model = tf.keras.models.load_model(model_path)
        
        # Load class names
        model_dir = os.path.dirname(model_path)
        class_names_path = os.path.join(model_dir, 'onion_class_names.json')
        
        if os.path.exists(class_names_path):
            with open(class_names_path, 'r') as f:
                class_names = json.load(f)
        else:
            # Default class names if file not found
            class_names = ['very_healthy', 'healthy', 'moderate', 'poor', 'very_poor', 'diseased', 'stressed', 'weeds']
        
        # Preprocess image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        # Resize to model input size (typically 224x224)
        img = cv2.resize(img, (224, 224))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = img.astype(np.float32) / 255.0  # Normalize
        img = np.expand_dims(img, axis=0)  # Add batch dimension
        
        # Predict
        predictions = model.predict(img, verbose=0)
        predicted_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_idx])
        
        # Create prediction dictionary
        all_predictions = {}
        for i, class_name in enumerate(class_names):
            if i < len(predictions[0]):
                all_predictions[class_name] = float(predictions[0][i])
        
        return {
            'classification': class_names[predicted_idx] if predicted_idx < len(class_names) else 'unknown',
            'confidence': round(confidence, 3),
            'classes': class_names,
            'all_predictions': all_predictions,
            'model_loaded': True,
            'crop_type': 'onion',
            'model_path': model_path
        }
        
    except Exception as e:
        return {
            'classification': 'error',
            'confidence': 0.0,
            'classes': ['very_healthy', 'healthy', 'moderate', 'poor', 'very_poor', 'diseased', 'stressed', 'weeds'],
            'all_predictions': {},
            'model_loaded': False,
            'crop_type': 'onion',
            'error': str(e)
        }


def preprocess_image(image_path: str, output_path: Optional[str] = None, 
                     target_size: Optional[Tuple[int, int]] = None) -> str:
    """
    Preprocess image: resize, noise filtering, normalization.
    
    Args:
        image_path: Input image path
        output_path: Optional output path (if None, overwrites input)
        target_size: Optional (width, height) for resizing
        
    Returns:
        Path to processed image
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    
    # Resize if specified
    if target_size:
        img = cv2.resize(img, target_size, interpolation=cv2.INTER_AREA)
    
    # Denoise
    img = cv2.bilateralFilter(img, 9, 75, 75)
    
    # Save processed image
    if output_path is None:
        output_path = str(Path(image_path).with_suffix('.processed.jpg'))
    
    cv2.imwrite(output_path, img)
    return output_path


def analyze_crop_health(image_path: str, use_tensorflow: bool = False, 
                        model_path: Optional[str] = None) -> Dict:
    """
    Complete onion crop health analysis pipeline.
    
    Combines NDVI, SAVI, and GNDVI calculation with TensorFlow classification.
    Optimized for onion (Allium cepa) crop monitoring.
    
    Args:
        image_path: Path to input image
        use_tensorflow: Whether to use TensorFlow model (if available)
        model_path: Path to TensorFlow model
        
    Returns:
        Complete analysis dictionary with NDVI, SAVI, GNDVI, and classification
    """
    # Preprocess
    processed_path = preprocess_image(image_path)
    
    # Calculate NDVI
    ndvi_results = calculate_ndvi(processed_path)
    
    # Calculate SAVI
    savi_results = calculate_savi(processed_path)
    
    # Calculate GNDVI
    gndvi_results = calculate_gndvi(processed_path)
    
    # TensorFlow classification (if enabled)
    tf_results = {}
    health_status = None
    health_score = None
    summary = None
    confidence = None
    model_version = None
    
    if use_tensorflow:
        tf_results = classify_crop_health_tensorflow(processed_path, model_path)
        if tf_results.get('model_loaded') and tf_results.get('classification'):
            # Use TensorFlow classification
            health_status = tf_results.get('classification')
            confidence = tf_results.get('confidence', 0.0)
            model_version = os.path.basename(model_path) if model_path else 'tensorflow_model'
            
            # Generate summary based on classification
            status_descriptions = {
                'very_healthy': 'Excellent crop health with high vegetation vigor',
                'healthy': 'Good crop health with adequate vegetation',
                'moderate': 'Moderate crop health requiring monitoring',
                'poor': 'Poor crop health requiring attention',
                'very_poor': 'Critical crop health requiring immediate intervention',
                'diseased': 'Signs of disease detected - treatment recommended',
                'stressed': 'Crop stress detected - review environmental conditions',
                'weeds': 'Significant weed presence affecting crop health'
            }
            summary = status_descriptions.get(health_status, f'Crop health: {health_status}')
            
            # Calculate health score from confidence and status
            base_scores = {
                'very_healthy': 0.9,
                'healthy': 0.75,
                'moderate': 0.5,
                'poor': 0.3,
                'very_poor': 0.1,
                'diseased': 0.2,
                'stressed': 0.4,
                'weeds': 0.35
            }
            health_score = base_scores.get(health_status, 0.5) * confidence
    
    # Fallback to NDVI-based classification if TensorFlow not used
    if not health_status:
        mean_ndvi = ndvi_results.get('ndvi_mean', 0)
        if mean_ndvi < 0.2:
            health_status = "Very Poor"
            summary = "Critical attention needed"
        elif mean_ndvi < 0.4:
            health_status = "Poor"
            summary = "Attention needed"
        elif mean_ndvi < 0.6:
            health_status = "Moderate"
            summary = "Moderate health"
        elif mean_ndvi < 0.8:
            health_status = "Healthy"
            summary = "Healthy"
        else:
            health_status = "Very Healthy"
            summary = "Very healthy"
        
        # Calculate health score from NDVI
        health_score = min(1.0, max(0.0, (mean_ndvi + 0.2) / 1.0))
    
    # Combine results
    analysis = {
        **ndvi_results,
        **savi_results,
        **gndvi_results,
        'health_status': health_status,
        'health_score': health_score,
        'summary': summary,
        'tensorflow': tf_results if use_tensorflow else None,
        'confidence': confidence,
        'model_version': model_version,
        'processed_image_path': processed_path,
        'original_image_path': image_path,
        'crop_type': 'onion',
        'analysis_type': 'tensorflow_onion_classification' if use_tensorflow and tf_results.get('model_loaded') else 'ndvi_savi_gndvi_onion'
    }
    
    return analysis


if __name__ == "__main__":
    # Test script
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python image_processor.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    print(f"Analyzing: {image_path}")
    
    try:
        results = analyze_crop_health(image_path)
        print("\n=== Analysis Results ===")
        print(json.dumps(results, indent=2))
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

