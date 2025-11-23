"""
Batch NDVI/SAVI/GNDVI Testing Script for Onion Crops
Processes all images in a folder and generates comprehensive vegetation index reports.
"""
import os
import json
import csv
from pathlib import Path
from datetime import datetime
from image_processor import calculate_ndvi, calculate_savi, calculate_gndvi, analyze_crop_health

def process_image_folder(folder_path: str, output_dir: str = None):
    """
    Process all images in a folder and generate NDVI/SAVI/GNDVI reports for onion crops.
    
    Args:
        folder_path: Path to folder containing images
        output_dir: Optional output directory for results
    """
    folder = Path(folder_path)
    if not folder.exists():
        raise ValueError(f"Folder not found: {folder_path}")
    
    # Supported image formats
    image_extensions = {'.jpg', '.jpeg', '.png', '.tiff', '.tif'}
    
    # Find all images
    image_files = [
        f for f in folder.iterdir() 
        if f.suffix.lower() in image_extensions and f.is_file()
    ]
    
    if not image_files:
        print(f"No images found in {folder_path}")
        return
    
    print(f"Found {len(image_files)} onion crop images to process...")
    print("=" * 60)
    
    # Create output directory
    if output_dir is None:
        output_dir = folder / "onion_analysis_results"
    else:
        output_dir = Path(output_dir)
    
    output_dir.mkdir(exist_ok=True)
    
    # Results storage
    results = []
    failed = []
    
    # Process each image
    for i, img_path in enumerate(image_files, 1):
        print(f"\n[{i}/{len(image_files)}] Processing: {img_path.name}")
        
        try:
            # Full analysis (includes all indices)
            full_analysis = analyze_crop_health(str(img_path))
            
            # Calculate individual indices for detailed reporting
            ndvi_results = calculate_ndvi(str(img_path))
            savi_results = calculate_savi(str(img_path))
            gndvi_results = calculate_gndvi(str(img_path))
            
            # Save individual JSON result
            result_data = {
                'filename': img_path.name,
                'filepath': str(img_path),
                'crop_type': 'onion',
                'ndvi': ndvi_results,
                'savi': savi_results,
                'gndvi': gndvi_results,
                'full_analysis': full_analysis,
                'processed_at': datetime.now().isoformat()
            }
            
            json_output = output_dir / f"{img_path.stem}_analysis.json"
            with open(json_output, 'w') as f:
                json.dump(result_data, f, indent=2)
            
            # Add to summary
            results.append({
                'filename': img_path.name,
                'ndvi_mean': ndvi_results['ndvi_mean'],
                'ndvi_std': ndvi_results['ndvi_std'],
                'ndvi_min': ndvi_results['ndvi_min'],
                'ndvi_max': ndvi_results['ndvi_max'],
                'savi_mean': savi_results['savi_mean'],
                'savi_std': savi_results['savi_std'],
                'savi_min': savi_results['savi_min'],
                'savi_max': savi_results['savi_max'],
                'gndvi_mean': gndvi_results['gndvi_mean'],
                'gndvi_std': gndvi_results['gndvi_std'],
                'gndvi_min': gndvi_results['gndvi_min'],
                'gndvi_max': gndvi_results['gndvi_max'],
                'health_status': ndvi_results['health_status'],
                'stress_zones_count': ndvi_results['stress_count']
            })
            
            print(f"  ✓ NDVI Mean: {ndvi_results['ndvi_mean']:.3f} ({ndvi_results['health_status']})")
            print(f"  ✓ SAVI Mean: {savi_results['savi_mean']:.3f}")
            print(f"  ✓ GNDVI Mean: {gndvi_results['gndvi_mean']:.3f}")
            print(f"  ✓ Stress Zones: {ndvi_results['stress_count']}")
            
        except Exception as e:
            print(f"  ✗ Error: {e}")
            failed.append({
                'filename': img_path.name,
                'error': str(e)
            })
    
    # Generate summary CSV
    csv_path = output_dir / "onion_analysis_summary.csv"
    if results:
        with open(csv_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)
        print(f"\n✓ Summary CSV saved to: {csv_path}")
    
    # Generate summary report
    report_path = output_dir / "onion_analysis_report.txt"
    with open(report_path, 'w') as f:
        f.write("=" * 60 + "\n")
        f.write("Onion Crop Health Analysis Summary Report\n")
        f.write("Vegetation Indices: NDVI, SAVI, GNDVI\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Processed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total Images: {len(image_files)}\n")
        f.write(f"Successful: {len(results)}\n")
        f.write(f"Failed: {len(failed)}\n\n")
        
        if results:
            f.write("Vegetation Index Statistics:\n")
            f.write("-" * 60 + "\n")
            
            # NDVI statistics
            ndvi_means = [r['ndvi_mean'] for r in results]
            f.write(f"\nNDVI (Normalized Difference Vegetation Index):\n")
            f.write(f"  Mean - Average: {sum(ndvi_means)/len(ndvi_means):.3f}\n")
            f.write(f"  Mean - Min: {min(ndvi_means):.3f}\n")
            f.write(f"  Mean - Max: {max(ndvi_means):.3f}\n")
            
            # SAVI statistics
            savi_means = [r['savi_mean'] for r in results]
            f.write(f"\nSAVI (Soil-Adjusted Vegetation Index):\n")
            f.write(f"  Mean - Average: {sum(savi_means)/len(savi_means):.3f}\n")
            f.write(f"  Mean - Min: {min(savi_means):.3f}\n")
            f.write(f"  Mean - Max: {max(savi_means):.3f}\n")
            
            # GNDVI statistics
            gndvi_means = [r['gndvi_mean'] for r in results]
            f.write(f"\nGNDVI (Green Normalized Difference Vegetation Index):\n")
            f.write(f"  Mean - Average: {sum(gndvi_means)/len(gndvi_means):.3f}\n")
            f.write(f"  Mean - Min: {min(gndvi_means):.3f}\n")
            f.write(f"  Mean - Max: {max(gndvi_means):.3f}\n")
            
            # Health status distribution
            health_counts = {}
            for r in results:
                status = r['health_status']
                health_counts[status] = health_counts.get(status, 0) + 1
            
            f.write("\n\nOnion Crop Health Status Distribution:\n")
            f.write("-" * 60 + "\n")
            for status, count in sorted(health_counts.items()):
                percentage = (count / len(results)) * 100
                f.write(f"  {status}: {count} ({percentage:.1f}%)\n")
            
            # Expected ranges for onion crops
            f.write("\n\nExpected Vegetation Index Ranges for Onion Crops:\n")
            f.write("-" * 60 + "\n")
            f.write("Very Healthy: NDVI > 0.8, SAVI > 0.7, GNDVI > 0.75\n")
            f.write("Healthy:      NDVI 0.6-0.8, SAVI 0.5-0.7, GNDVI 0.6-0.75\n")
            f.write("Moderate:     NDVI 0.4-0.6, SAVI 0.3-0.5, GNDVI 0.4-0.6\n")
            f.write("Poor:         NDVI 0.2-0.4, SAVI 0.15-0.3, GNDVI 0.2-0.4\n")
            f.write("Very Poor:    NDVI < 0.2, SAVI < 0.15, GNDVI < 0.2\n")
        
        if failed:
            f.write("\n\nFailed Images:\n")
            f.write("-" * 60 + "\n")
            for item in failed:
                f.write(f"  {item['filename']}: {item['error']}\n")
    
    print(f"\n✓ Detailed report saved to: {report_path}")
    print(f"\n{'='*60}")
    print(f"Onion Crop Analysis Complete!")
    print(f"  ✓ Successful: {len(results)}")
    print(f"  ✗ Failed: {len(failed)}")
    print(f"  📁 Results in: {output_dir}")
    print(f"{'='*60}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python batch_test_ndvi.py <image_folder> [output_dir]")
        print("\nExample:")
        print("  python batch_test_ndvi.py ./sample_onion_images")
        print("  python batch_test_ndvi.py ./sample_onion_images ./results")
        print("\nThis script processes all images in the folder and generates:")
        print("  - Individual JSON analysis files for each image")
        print("  - CSV summary with all vegetation indices")
        print("  - Text report with statistics and health distribution")
        sys.exit(1)
    
    folder_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    process_image_folder(folder_path, output_dir)

