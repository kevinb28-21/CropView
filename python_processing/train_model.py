"""
ML Model Training Script for Onion Crop Health Classification
Trains a TensorFlow model for automated onion crop health assessment.
Uses NDVI, SAVI, and GNDVI values for different health categories.
"""
import os
import json
import numpy as np
from pathlib import Path
from typing import List, Tuple
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
import cv2
from image_processor import preprocess_image, calculate_ndvi, calculate_savi, calculate_gndvi

# Onion-specific health categories
ONION_HEALTH_CATEGORIES = [
    'very_healthy',  # NDVI > 0.8, SAVI > 0.7, GNDVI > 0.75
    'healthy',       # NDVI 0.6-0.8, SAVI 0.5-0.7, GNDVI 0.6-0.75
    'moderate',      # NDVI 0.4-0.6, SAVI 0.3-0.5, GNDVI 0.4-0.6
    'poor',          # NDVI 0.2-0.4, SAVI 0.15-0.3, GNDVI 0.2-0.4
    'very_poor',     # NDVI < 0.2, SAVI < 0.15, GNDVI < 0.2
    'diseased',      # Fungal/bacterial/viral diseases
    'stressed',      # Water/nutrient/heat stress
    'weeds'          # Significant weed infestation
]


def load_images_from_folder(folder_path: str, target_size: Tuple[int, int] = (224, 224)):
    """
    Load and preprocess images from folder structure.
    
    Expected structure:
    folder_path/
        very_healthy/
            image1.jpg
            image2.jpg
        healthy/
            image1.jpg
        moderate/
            image1.jpg
        poor/
            image1.jpg
        very_poor/
            image1.jpg
        diseased/
            image1.jpg
        stressed/
            image1.jpg
        weeds/
            image1.jpg
    
    Or flat structure with labels file:
    folder_path/
        image1.jpg
        image2.jpg
        labels.json  # {"image1.jpg": "very_healthy", "image2.jpg": "healthy"}
    
    Args:
        folder_path: Path to images folder
        target_size: Target image size (width, height)
    
    Returns:
        images: List of preprocessed image arrays
        labels: List of label indices
        class_names: List of class names
    """
    folder = Path(folder_path)
    
    # Check for subfolder structure (recommended)
    subfolders = [d for d in folder.iterdir() if d.is_dir() and d.name in ONION_HEALTH_CATEGORIES]
    
    if subfolders:
        # Subfolder structure
        class_names = sorted([d.name for d in subfolders])
        images = []
        labels = []
        
        for class_idx, class_name in enumerate(class_names):
            class_folder = folder / class_name
            image_files = list(class_folder.glob('*.jpg')) + \
                         list(class_folder.glob('*.jpeg')) + \
                         list(class_folder.glob('*.png'))
            
            print(f"Loading {len(image_files)} images from '{class_name}'...")
            
            for img_path in image_files:
                try:
                    img = cv2.imread(str(img_path))
                    if img is None:
                        continue
                    
                    # Resize and preprocess
                    img = cv2.resize(img, target_size)
                    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    img = img.astype(np.float32) / 255.0  # Normalize
                    
                    images.append(img)
                    labels.append(class_idx)
                except Exception as e:
                    print(f"  Warning: Failed to load {img_path.name}: {e}")
        
        return np.array(images), np.array(labels), class_names
    
    else:
        # Flat structure - check for labels file
        labels_file = folder / "labels.json"
        
        if not labels_file.exists():
            raise ValueError(
                f"No class subfolders found and no labels.json file.\n"
                f"Please organize images in subfolders matching these categories:\n"
                f"  {', '.join(ONION_HEALTH_CATEGORIES)}\n"
                f"Or provide a labels.json file with image-to-category mappings."
            )
        
        with open(labels_file, 'r') as f:
            labels_dict = json.load(f)
        
        class_names = sorted(list(set(labels_dict.values())))
        # Validate categories
        for cat in class_names:
            if cat not in ONION_HEALTH_CATEGORIES:
                print(f"Warning: Category '{cat}' not in standard onion health categories")
        
        class_to_idx = {name: idx for idx, name in enumerate(class_names)}
        
        images = []
        labels = []
        
        image_files = list(folder.glob('*.jpg')) + \
                     list(folder.glob('*.jpeg')) + \
                     list(folder.glob('*.png'))
        
        print(f"Loading {len(image_files)} images from flat structure...")
        
        for img_path in image_files:
            if img_path.name not in labels_dict:
                continue
            
            try:
                img = cv2.imread(str(img_path))
                if img is None:
                    continue
                
                img = cv2.resize(img, target_size)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = img.astype(np.float32) / 255.0
                
                images.append(img)
                labels.append(class_to_idx[labels_dict[img_path.name]])
            except Exception as e:
                print(f"  Warning: Failed to load {img_path.name}: {e}")
        
        return np.array(images), np.array(labels), class_names


def create_model(input_shape: Tuple[int, int, int], num_classes: int):
    """
    Create a CNN model for onion crop health classification.
    
    Args:
        input_shape: (height, width, channels)
        num_classes: Number of classes
    
    Returns:
        Compiled Keras model
    """
    model = models.Sequential([
        # Data augmentation (only during training)
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        layers.RandomBrightness(0.1),
        
        # Base model (can use transfer learning)
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        
        # Classifier
        layers.Flatten(),
        layers.Dropout(0.5),
        layers.Dense(512, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model


def train_model(
    data_folder: str,
    output_dir: str = "./models",
    epochs: int = 50,
    batch_size: int = 32,
    validation_split: float = 0.2,
    test_split: float = 0.1
):
    """
    Train onion crop health classification model.
    
    Args:
        data_folder: Path to images folder
        output_dir: Directory to save model
        epochs: Number of training epochs
        batch_size: Batch size
        validation_split: Validation split ratio
        test_split: Test split ratio
    """
    print("=" * 60)
    print("Onion Crop Health ML Model Training")
    print("=" * 60)
    
    # Load images
    print("\n1. Loading images...")
    images, labels, class_names = load_images_from_folder(data_folder)
    
    print(f"\n   Loaded {len(images)} images")
    print(f"   Classes: {class_names}")
    print(f"   Image shape: {images[0].shape}")
    
    # Class distribution
    unique, counts = np.unique(labels, return_counts=True)
    print("\n   Class distribution:")
    for idx, count in zip(unique, counts):
        print(f"     {class_names[idx]}: {count}")
    
    # Split data
    print("\n2. Splitting data...")
    X_temp, X_test, y_temp, y_test = train_test_split(
        images, labels, test_size=test_split, random_state=42, stratify=labels
    )
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=validation_split/(1-test_split), 
        random_state=42, stratify=y_temp
    )
    
    print(f"   Train: {len(X_train)}")
    print(f"   Validation: {len(X_val)}")
    print(f"   Test: {len(X_test)}")
    
    # Create model
    print("\n3. Creating model...")
    input_shape = images[0].shape
    num_classes = len(class_names)
    model = create_model(input_shape, num_classes)
    model.summary()
    
    # Data augmentation
    datagen = ImageDataGenerator(
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        brightness_range=[0.8, 1.2]
    )
    
    # Callbacks
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            str(output_path / "onion_crop_best_model.h5"),
            save_best_only=True,
            monitor='val_accuracy',
            mode='max',
            save_weights_only=False
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=False  # Removed to fix pickling issue
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7
        )
    ]
    
    # Train
    print("\n4. Training model...")
    try:
        history = model.fit(
            datagen.flow(X_train, y_train, batch_size=batch_size),
            steps_per_epoch=len(X_train) // batch_size,
            epochs=epochs,
            validation_data=(X_val, y_val),
            callbacks=callbacks,
            verbose=1
        )
    except KeyboardInterrupt:
        print("\n⚠ Training interrupted by user")
        history = None
    
    # Load best model weights if available (from ModelCheckpoint)
    best_model_path = output_path / "onion_crop_best_model.h5"
    if best_model_path.exists():
        try:
            print("\nLoading best model from checkpoint...")
            model = keras.models.load_model(str(best_model_path))
            print("✓ Best model loaded")
        except Exception as e:
            print(f"⚠ Could not load best model: {e}")
            print("Using current model weights instead")
    
    # Evaluate
    print("\n5. Evaluating model...")
    test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"   Test Loss: {test_loss:.4f}")
    print(f"   Test Accuracy: {test_accuracy:.4f}")
    
    # Save final model (use best model if available, otherwise current)
    final_model_path = output_path / "onion_crop_health_model.h5"
    try:
        if best_model_path.exists() and best_model_path != final_model_path:
            # Copy best model to final location
            import shutil
            shutil.copy2(best_model_path, final_model_path)
            print(f"\n✓ Best model copied to: {final_model_path}")
        else:
            model.save(final_model_path)
            print(f"\n✓ Model saved to: {final_model_path}")
    except Exception as e:
        print(f"⚠ Error saving final model: {e}")
        if best_model_path.exists():
            print(f"  Using best model checkpoint: {best_model_path}")
            final_model_path = best_model_path
    
    # Save class names
    try:
        class_names_path = output_path / "onion_class_names.json"
        with open(class_names_path, 'w') as f:
            json.dump(class_names, f, indent=2)
        print(f"✓ Class names saved to: {class_names_path}")
    except Exception as e:
        print(f"⚠ Error saving class names: {e}")
    
    # Save training history (robust conversion)
    if history is not None:
        try:
            history_path = output_path / "onion_training_history.json"
            
            # Robust conversion of history values to floats
            def safe_float(value):
                """Safely convert TensorFlow tensor or numpy array to float"""
                if hasattr(value, 'numpy'):
                    return float(value.numpy())
                elif hasattr(value, 'item'):
                    return float(value.item())
                else:
                    return float(value)
            
            history_dict = {}
            for key in ['loss', 'accuracy', 'val_loss', 'val_accuracy']:
                if key in history.history:
                    try:
                        history_dict[key] = [safe_float(x) for x in history.history[key]]
                    except Exception as e:
                        print(f"⚠ Warning: Could not convert {key}: {e}")
                        history_dict[key] = []
            
            with open(history_path, 'w') as f:
                json.dump(history_dict, f, indent=2)
            print(f"✓ Training history saved to: {history_path}")
        except Exception as e:
            print(f"⚠ Error saving training history: {e}")
            print("  Model training completed successfully, but history could not be saved")
    
    # Save model metadata
    try:
        def safe_float(value):
            """Safely convert TensorFlow tensor or numpy array to float"""
            if hasattr(value, 'numpy'):
                return float(value.numpy())
            elif hasattr(value, 'item'):
                return float(value.item())
            else:
                return float(value)
        
        metadata = {
            'crop_type': 'onion',
            'classes': class_names,
            'num_classes': num_classes,
            'input_shape': list(input_shape),
            'test_accuracy': safe_float(test_accuracy),
            'test_loss': safe_float(test_loss),
            'training_samples': len(X_train),
            'validation_samples': len(X_val),
            'test_samples': len(X_test),
            'model_path': str(final_model_path),
            'best_model_path': str(best_model_path) if best_model_path.exists() else None
        }
        metadata_path = output_path / "onion_model_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"✓ Model metadata saved to: {metadata_path}")
    except Exception as e:
        print(f"⚠ Error saving metadata: {e}")
    
    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)
    
    return model, class_names


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python train_model.py <image_folder> [output_dir] [epochs]")
        print("\nImage folder structure (recommended):")
        print("  folder/")
        print("    very_healthy/")
        print("      img1.jpg")
        print("    healthy/")
        print("      img2.jpg")
        print("    moderate/")
        print("      img3.jpg")
        print("    poor/")
        print("      img4.jpg")
        print("    very_poor/")
        print("      img5.jpg")
        print("    diseased/")
        print("      img6.jpg")
        print("    stressed/")
        print("      img7.jpg")
        print("    weeds/")
        print("      img8.jpg")
        print("\nOr flat structure with labels.json:")
        print("  folder/")
        print("    img1.jpg")
        print("    img2.jpg")
        print("    labels.json  # {\"img1.jpg\": \"very_healthy\", ...}")
        print("\nExample:")
        print("  python train_model.py ./sample_onion_images ./models 50")
        sys.exit(1)
    
    data_folder = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "./models"
    epochs = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    
    train_model(data_folder, output_dir, epochs=epochs)

