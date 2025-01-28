import requests
import base64
from io import BytesIO
from PIL import Image
import re

def fetch_first_plant(base_url='http://localhost:3000'):
    """
    Fetches the first plant from the knowledgebase API.
    
    Args:
        base_url (str): The base URL of the API.
        
    Returns:
        dict: The first plant data or None if not found.
    """
    try:
        params = {
            'page': 1,
            'limit': 1
        }
        response = requests.get(f'{base_url}/api/knowledgebase', params=params)
        response.raise_for_status()
        
        data = response.json()
        print('Response status:', response.status_code)
        plants = data.get('data', [])
        if not plants:
            print('No plants found.')
            return None
        
        first_plant = plants[0]
        image_url = first_plant.get('ImageUrl')
        if not image_url:
            print('No ImageUrl found for the first plant.')
            return None
        
        # Validate base64 data
        if not image_url.startswith('data:image'):
            print('Invalid image data format')
            return None
            
        return image_url
    except requests.RequestException as e:
        print(f'Error fetching plant data: {e}')
        return None

def display_image(image_url):
    """
    Decodes and displays the image from the ImageUrl.
    
    Args:
        image_url (str): The base64 encoded image URL.
    """
    try:
        if not image_url.startswith('data:image'):
            print('Invalid image URL format')
            return

        # Extract the base64 part
        try:
            header, encoded = image_url.split(',', 1)
            # Clean up the base64 string
            encoded = re.sub(r'\s+', '', encoded)
            # Ensure the base64 string is properly padded
            padding = 4 - (len(encoded) % 4)
            if padding != 4:
                encoded += '=' * padding
        except ValueError:
            print('Invalid image URL format - could not split header and data')
            return

        try:
            # Decode base64
            image_data = base64.b64decode(encoded)
            
            # Try to open the image
            image = Image.open(BytesIO(image_data))
            print(f'Image format: {image.format}')
            print(f'Image size: {image.size}')
            print(f'Image mode: {image.mode}')
            
            # Display the image
            image.show()
        except base64.binascii.Error:
            print('Invalid base64 encoding')
        except Exception as e:
            print(f'Error processing image: {str(e)}')
            
    except Exception as e:
        print(f'Error displaying image: {str(e)}')

def main():
    """
    Main function to fetch and display the first plant's image.
    """
    print("Fetching first plant...")
    image_url = fetch_first_plant()
    if image_url:
        print("\nAttempting to display image...")
        display_image(image_url)
    else:
        print('No ImageUrl to display.')

if __name__ == '__main__':
    main()