import numpy as np
import os
import math

def split_corresponding_npy_files(
    image_file_path,
    mask_file_path,
    type_file_path, # Path to types.npy, can be None if not splitting types
    output_parent_dir, # e.g., .../fold1
    image_split_subdir_name, # e.g., "images_split"
    mask_split_subdir_name,  # e.g., "masks_split"
    target_chunk_size_gb=2.0
):
    """
    Splits large .npy files (images, masks, types) into smaller, corresponding chunks.
    Ensures that samples with the same index across files remain paired.
    """
    
    print(f"Starting splitting process...")
    print(f"Output parent directory: {output_parent_dir}")

    # --- Load data (mmap_mode for efficiency) ---
    try:
        print(f"Loading {image_file_path}...")
        image_data = np.load(image_file_path, mmap_mode='r')
        print(f"Loading {mask_file_path}...")
        mask_data = np.load(mask_file_path, mmap_mode='r')
    except Exception as e:
        print(f"Error loading image or mask files: {e}")
        return

    type_data = None
    if type_file_path and os.path.exists(type_file_path):
        try:
            print(f"Loading {type_file_path}...")
            type_data = np.load(type_file_path, mmap_mode='r')
        except Exception as e:
            print(f"Error loading type file {type_file_path}: {e}. Proceeding without types.")
    elif type_file_path:
        print(f"Warning: Type file not found at {type_file_path}. Proceeding without types.")

    # --- Validate shapes ---    
    num_samples = image_data.shape[0]
    if num_samples == 0:
        print("Error: Image data has 0 samples. Aborting.")
        return
        
    if mask_data.shape[0] != num_samples:
        print(f"Error: Mismatch in sample count between images ({num_samples}) and masks ({mask_data.shape[0]}). Aborting.")
        return
    if type_data is not None and type_data.shape[0] != num_samples:
        print(f"Error: Mismatch in sample count between images ({num_samples}) and types ({type_data.shape[0]}). Aborting.")
        return
    
    print(f"Verified {num_samples} samples across all files.")

    # --- Calculate samples per chunk --- 
    target_bytes = target_chunk_size_gb * (1024**3)
    
    image_item_size = image_data.nbytes / num_samples if num_samples > 0 else 0
    mask_item_size = mask_data.nbytes / num_samples if num_samples > 0 else 0
    type_item_size = 0
    if type_data is not None and num_samples > 0:
        type_item_size = type_data.nbytes / num_samples

    s_p_c_values = []
    if image_item_size > 0:
        s_p_c_values.append(math.floor(target_bytes / image_item_size))
    if mask_item_size > 0:
        s_p_c_values.append(math.floor(target_bytes / mask_item_size))
    if type_item_size > 0:
        s_p_c_values.append(math.floor(target_bytes / type_item_size))
    
    if not s_p_c_values:
        print("Error: Could not determine samples per chunk (all item sizes are zero or no data). Aborting.")
        return
        
    samples_per_chunk = min(s_p_c_values)
    if samples_per_chunk == 0:
        samples_per_chunk = 1 # Ensure at least one sample if items are huge or target_chunk_size_gb is too small
    
    num_chunks = math.ceil(num_samples / samples_per_chunk)

    print(f"  Target chunk size: {target_chunk_size_gb:.2f} GB")
    print(f"  Calculated samples per chunk: {samples_per_chunk}")
    print(f"  Number of chunks to create: {num_chunks}")

    # --- Create output directories ---
    image_out_dir = os.path.join(output_parent_dir, image_split_subdir_name)
    mask_out_dir = os.path.join(output_parent_dir, mask_split_subdir_name)
    os.makedirs(image_out_dir, exist_ok=True)
    os.makedirs(mask_out_dir, exist_ok=True)
    print(f"  Image/Type output directory: {image_out_dir}")
    print(f"  Mask output directory: {mask_out_dir}")

    # --- Split and save --- 
    for i in range(num_chunks):
        start_index = i * samples_per_chunk
        end_index = min((i + 1) * samples_per_chunk, num_samples)
        print(f"  Processing chunk {i+1}/{num_chunks} (samples {start_index} to {end_index-1})...")

        # Image chunk
        image_chunk_data = image_data[start_index:end_index]
        image_output_filename = f"images_part_{i}.npy"
        image_output_path = os.path.join(image_out_dir, image_output_filename)
        try:
            np.save(image_output_path, image_chunk_data)
            print(f"    Saved {image_output_path} ({image_chunk_data.nbytes / (1024**2):.2f} MB)")
        except Exception as e:
            print(f"    Error saving {image_output_path}: {e}")

        # Mask chunk
        mask_chunk_data = mask_data[start_index:end_index]
        mask_output_filename = f"masks_part_{i}.npy"
        mask_output_path = os.path.join(mask_out_dir, mask_output_filename)
        try:
            np.save(mask_output_path, mask_chunk_data)
            print(f"    Saved {mask_output_path} ({mask_chunk_data.nbytes / (1024**2):.2f} MB)")
        except Exception as e:
            print(f"    Error saving {mask_output_path}: {e}")

        # Type chunk (if applicable)
        if type_data is not None:
            type_chunk_data = type_data[start_index:end_index]
            type_output_filename = f"types_part_{i}.npy"
            type_output_path = os.path.join(image_out_dir, type_output_filename) # Save in image_split_subdir
            try:
                np.save(type_output_path, type_chunk_data)
                print(f"    Saved {type_output_path} ({type_chunk_data.nbytes / (1024**2):.2f} MB)")
            except Exception as e:
                print(f"    Error saving {type_output_path}: {e}")
        print("\n")
    print("All splitting tasks complete.")

if __name__ == "__main__":
    fold1_dir = "/Users/hyunseo/study/jupyter/HoverNet/hover_net/dataset/fold1"
    
    img_path = os.path.join(fold1_dir, "images", "images.npy")
    msk_path = os.path.join(fold1_dir, "masks", "masks.npy")
    typ_path = os.path.join(fold1_dir, "images", "types.npy") # types.npy is in the images subfolder

    split_corresponding_npy_files(
        image_file_path=img_path,
        mask_file_path=msk_path,
        type_file_path=typ_path,
        output_parent_dir=fold1_dir, # Output subdirs will be created within fold1
        image_split_subdir_name="images_split",
        mask_split_subdir_name="masks_split",
        target_chunk_size_gb=2.0
    )
