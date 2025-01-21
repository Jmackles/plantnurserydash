import json

def convert_txt_to_json(txt_file, json_file):
    with open(txt_file, 'r') as file:
        lines = file.readlines()
    
    image_paths = [line.strip() for line in lines if line.strip()]

    with open(json_file, 'w') as file:
        json.dump(image_paths, file, indent=4)

if __name__ == "__main__":
    txt_file = 'imagePaths.txt'
    json_file = 'unmatchedImages.json'
    convert_txt_to_json(txt_file, json_file)
    print(f"Converted {txt_file} to {json_file}")