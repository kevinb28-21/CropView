"""
Prepare TOM2024 dataset for model training.
Maps TOM2024 categories to onion health categories and creates training structure.
Runs entirely offline - no database required.
"""
import os
import json
import shutil
from pathlib import Path
from typing import Dict, List, Optional
import cv2
import numpy as np
from image_processor import calculate_ndvi, calculate_savi, calculate_gndvi

# Mapping from TOM2024 categories to health categories
CATEGORY_MAPPING = {
    # Healthy categories
    'Healthy_leaf': 'healthy',  # Will be refined by NDVI if use_ndvi_classification=True
    'Feuille saine': 'healthy',
    'healthy_fruit': 'healthy',
    'healthy_leaf': 'healthy',
    
    # Disease categories → diseased
    'Alternaria_D': 'diseased',
    'Alternariose_D': 'diseased',
    'alternaria_d': 'diseased',
    'Bulb_blight-D': 'diseased',
    'Bulb_blight_d': 'diseased',
    'Fusarium-D': 'diseased',
    'Fusariose-D': 'diseased',
    'fusarium_d': 'diseased',
    'Virosis-D': 'diseased',
    'Virose-D': 'diseased',
    'virosis_d': 'diseased',
    'alternaria_mite_d': 'diseased',
    'Bacterial_floundering_d': 'diseased',
    'Blossom_end_rot_d': 'diseased',
    'exces_nitrogen_d': 'diseased',
    'Mite_d': 'diseased',
    'sunburn_d': 'diseased',
    'tomato_late_blight_d': 'diseased',
    'acarien_d': 'diseased',
    'alternariose_acarien_d': 'diseased',
    'alternariose_d': 'diseased',
    'coup_du_soleil_d': 'diseased',
    "exces_d'azote_d": 'diseased',
    'fl├⌐trissement_bact├⌐rien_d': 'diseased',
    'fusariose_d': 'diseased',
    'mildiou_de_la_tomate_d': 'diseased',
    'pourriture_apicale_d': 'diseased',
    
    # Pest categories → stressed
    'Caterpillar-P': 'stressed',
    'Chenilles-P': 'stressed',
    'caterpillars_p': 'stressed',
    'helicoverpa_armigera_p': 'stressed',
    'tuta_absoluta_p': 'stressed',
    
    # Weeds (if present)
    # Add any weed categories here
}

# NDVI-based health classification thresholds
NDVI_THRESHOLDS = {
    'very_healthy': (0.8, 1.0),
    'healthy': (0.6, 0.8),
    'moderate': (0.4, 0.6),
    'poor': (0.2, 0.4),
    'very_poor': (-1.0, 0.2),
}


def classify_by_ndvi(ndvi_mean: float) -> str:
    """Classify health status based on NDVI value."""
    for category, (min_val, max_val) in NDVI_THRESHOLDS.items():
        if min_val <= ndvi_mean < max_val:
            return category
    return 'moderate'  # Default


def prepare_tom2024_data(
    source_folder: str,
    output_folder: str,
    use_ndvi_classification: bool = False,
    category_b_only: bool = True
):
    """
    Prepare TOM2024 data for training.
    
    Args:
        source_folder: Path to TOM2024 folder
        output_folder: Where to create training structure
        use_ndvi_classification: If True, use NDVI to refine healthy category classification
        category_b_only: If True, only use CATEGORY B (already split train/test)
    """
    source = Path(source_folder)
    output = Path(output_folder)
    
    # Create output structure
    train_output = output / "train"
    test_output = output / "test"
    train_output.mkdir(parents=True, exist_ok=True)
    test_output.mkdir(parents=True, exist_ok=True)
    
    # Create health category folders
    health_categories = ['very_healthy', 'healthy', 'moderate', 'poor', 'very_poor', 'diseased', 'stressed', 'weeds']
    for cat in health_categories:
        (train_output / cat).mkdir(exist_ok=True)
        (test_output / cat).mkdir(exist_ok=True)
    
    stats = {
        'train': {cat: 0 for cat in health_categories},
        'test': {cat: 0 for cat in health_categories}
    }
    
    if category_b_only:
        # Use CATEGORY B (already split)
        category_b_path = source / "CATEGORY B" / "CATB-English" / "onion with data augmentation"
        
        if not category_b_path.exists():
            print(f"Warning: {category_b_path} not found, trying alternative path...")
            # Try alternative path structure
            category_b_path = source / "CATEGORY B" / "CATB-English" / "onion with data augmentation"
        
        for split_name, split_output in [('train', train_output), ('test', test_output)]:
            split_path = category_b_path / split_name
            
            if not split_path.exists():
                print(f"Warning: {split_path} not found, skipping...")
                continue
            
            print(f"\nProcessing {split_name} data...")
            
            # Process each category folder
            for category_folder in split_path.iterdir():
                if not category_folder.is_dir():
                    continue
                
                category_name = category_folder.name
                
                # Map to health category
                health_category = CATEGORY_MAPPING.get(category_name, None)
                
                if not health_category:
                    print(f"  Warning: No mapping for '{category_name}', skipping...")
                    continue
                
                # Process images
                image_files = list(category_folder.glob('*.jpg')) + \
                             list(category_folder.glob('*.jpeg')) + \
                             list(category_folder.glob('*.png'))
                
                print(f"  {category_name} → {health_category}: {len(image_files)} images")
                
                for img_path in image_files:
                    try:
                        # If using NDVI classification and it's a healthy category, refine it
                        final_category = health_category
                        if use_ndvi_classification and health_category in ['healthy', 'very_healthy']:
                            try:
                                ndvi_result = calculate_ndvi(str(img_path))
                                ndvi_mean = ndvi_result.get('ndvi_mean', 0.5)
                                refined_category = classify_by_ndvi(ndvi_mean)
                                
                                # Only override if it makes sense
                                if refined_category in ['very_healthy', 'healthy']:
                                    final_category = refined_category
                            except Exception as e:
                                print(f"    Warning: Could not calculate NDVI for {img_path.name}: {e}")
                        
                        # Copy image to appropriate folder
                        dest_folder = split_output / final_category
                        dest_path = dest_folder / img_path.name
                        
                        # Handle name conflicts
                        counter = 1
                        while dest_path.exists():
                            stem = img_path.stem
                            suffix = img_path.suffix
                            dest_path = dest_folder / f"{stem}_{counter}{suffix}"
                            counter += 1
                        
                        shutil.copy2(img_path, dest_path)
                        stats[split_name][final_category] += 1
                        
                    except Exception as e:
                        print(f"    Error processing {img_path.name}: {e}")
    
    else:
        # Use CATEGORY A (need to manually split)
        category_a_path = source / "CATEGORY A" / "CATA-English"
        
        # Process onion_diseases and onion_pests
        for subfolder in ['onion_diseases', 'onion_pests']:
            folder_path = category_a_path / subfolder
            
            if not folder_path.exists():
                continue
            
            print(f"\nProcessing {subfolder}...")
            
            # Process each category
            for category_folder in folder_path.iterdir():
                if not category_folder.is_dir():
                    continue
                
                category_name = category_folder.name
                health_category = CATEGORY_MAPPING.get(category_name, None)
                
                if not health_category:
                    print(f"  Warning: No mapping for '{category_name}', skipping...")
                    continue
                
                image_files = list(category_folder.glob('*.jpg')) + \
                             list(category_folder.glob('*.jpeg')) + \
                             list(category_folder.glob('*.png'))
                
                print(f"  {category_name} → {health_category}: {len(image_files)} images")
                
                # Simple 80/20 split (or use sklearn train_test_split)
                split_idx = int(len(image_files) * 0.8)
                
                for idx, img_path in enumerate(image_files):
                    try:
                        split_name = 'train' if idx < split_idx else 'test'
                        split_output = train_output if split_name == 'train' else test_output
                        
                        # NDVI refinement if needed
                        final_category = health_category
                        if use_ndvi_classification and health_category in ['healthy', 'very_healthy']:
                            try:
                                ndvi_result = calculate_ndvi(str(img_path))
                                ndvi_mean = ndvi_result.get('ndvi_mean', 0.5)
                                refined_category = classify_by_ndvi(ndvi_mean)
                                if refined_category in ['very_healthy', 'healthy']:
                                    final_category = refined_category
                            except:
                                pass
                        
                        dest_folder = split_output / final_category
                        dest_path = dest_folder / img_path.name
                        
                        counter = 1
                        while dest_path.exists():
                            stem = img_path.stem
                            suffix = img_path.suffix
                            dest_path = dest_folder / f"{stem}_{counter}{suffix}"
                            counter += 1
                        
                        shutil.copy2(img_path, dest_path)
                        stats[split_name][final_category] += 1
                        
                    except Exception as e:
                        print(f"    Error processing {img_path.name}: {e}")
    
    # Print statistics
    print("\n" + "=" * 60)
    print("Data Preparation Summary")
    print("=" * 60)
    print("\nTraining set:")
    for cat, count in stats['train'].items():
        if count > 0:
            print(f"  {cat}: {count}")
    print("\nTest set:")
    for cat, count in stats['test'].items():
        if count > 0:
            print(f"  {cat}: {count}")
    
    total_train = sum(stats['train'].values())
    total_test = sum(stats['test'].values())
    print(f"\n✓ Data prepared in: {output}")
    print(f"  Train: {total_train} images")
    print(f"  Test: {total_test} images")
    print(f"  Total: {total_train + total_test} images")
    
    # Save mapping info
    mapping_info = {
        'category_mapping': CATEGORY_MAPPING,
        'stats': stats,
        'use_ndvi_classification': use_ndvi_classification,
        'category_b_only': category_b_only
    }
    with open(output / 'mapping_info.json', 'w') as f:
        json.dump(mapping_info, f, indent=2)
    
    return output


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python prepare_tom2024_data.py <tom2024_folder> [output_folder] [--use-ndvi] [--category-a]")
        print("\nExample:")
        print("  python prepare_tom2024_data.py ~/Downloads/TOM2024 ./training_data")
        print("  python prepare_tom2024_data.py ~/Downloads/TOM2024 ./training_data --use-ndvi")
        sys.exit(1)
    
    source_folder = sys.argv[1]
    output_folder = sys.argv[2] if len(sys.argv) > 2 else "./training_data"
    use_ndvi = '--use-ndvi' in sys.argv
    category_a = '--category-a' in sys.argv
    
    prepare_tom2024_data(
        source_folder,
        output_folder,
        use_ndvi_classification=use_ndvi,
        category_b_only=not category_a
    )

