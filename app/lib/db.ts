import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join, normalize } from 'path';

export const openDb = async () => {
    return open({
        filename: join(process.cwd(), 'app/database/database.sqlite'),
        driver: sqlite3.Database
    });
};

// Base directories
export const DB_IMAGES_DIR = join(process.cwd(), 'app/database');
export const UPLOADS_DIR = join(process.cwd(), 'public/images');

export const normalizePath = (path: string) => {
    // Convert Windows backslashes to forward slashes
    const normalizedPath = path.replace(/\\/g, '/');
    console.log('Normalized path:', normalizedPath);
    return normalizedPath;
};

export const getImagePath = (imagePath: string) => {
    const decodedPath = decodeURIComponent(imagePath);
    console.log('Decoded path:', decodedPath);
    
    // If it's a full Windows path
    if (decodedPath.match(/^[A-Z]:\\/i)) {
        // Use the path as-is, just normalize slashes
        const fullPath = decodedPath.replace(/\\/g, '/');
        console.log('Full Windows path:', fullPath);
        return fullPath;
    }
    
    // For uploaded images
    if (decodedPath.startsWith('plant_')) {
        const fullPath = join(UPLOADS_DIR, decodedPath);
        console.log('Uploads path:', fullPath);
        return fullPath;
    }
    
    // For relative paths
    const fullPath = join(DB_IMAGES_DIR, decodedPath);
    console.log('Relative path:', fullPath);
    return fullPath;
};