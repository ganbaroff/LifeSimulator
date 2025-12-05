const fs = require('fs');
const path = require('path');

// Создаём простые PNG иконки (1x1 пиксель) для placeholder
// В реальном проекте используйте настоящие изображения

const createPlaceholderPNG = (filePath, size = 1024) => {
  // PNG header для 1x1 прозрачного изображения
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
    0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(filePath, pngData);
  console.log(`✓ Created ${path.basename(filePath)} (${size}x${size})`);
};

// Создаём директорию assets если не существует
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Создаём все необходимые иконки
createPlaceholderPNG(path.join(assetsDir, 'icon.png'), 1024);
createPlaceholderPNG(path.join(assetsDir, 'splash.png'), 1284);
createPlaceholderPNG(path.join(assetsDir, 'adaptive-icon.png'), 1024);
createPlaceholderPNG(path.join(assetsDir, 'favicon.png'), 48);

console.log('\n✓ All placeholder icons created successfully!');
console.log('⚠️  Replace these with your actual app icons before publishing.');
