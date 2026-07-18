// 生成应用图标的脚本 - 使用纯 JS 创建 PNG 图标
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// 太极图案生成器 - 中国传统风格
function createIcon(size) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // 背景色 - 深棕色
      png.data[idx] = 139;     // R
      png.data[idx + 1] = 69;  // G
      png.data[idx + 2] = 19;  // B
      png.data[idx + 3] = 255; // A

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= r) {
        // 太极图案
        const angle = Math.atan2(dy, dx);
        const halfR = r / 2;

        // 阴阳鱼颜色
        let isYin = false;
        if (dx < 0) {
          isYin = true;
        } else {
          isYin = false;
        }

        // 鱼眼
        const eyeX = isYin ? -halfR : halfR;
        const eyeY = 0;
        const eyeDist = Math.sqrt((dx - eyeX) ** 2 + (dy - eyeY) ** 2);
        const eyeR = r * 0.12;

        if (eyeDist <= eyeR) {
          // 鱼眼 - 相反颜色
          png.data[idx] = isYin ? 255 : 0;
          png.data[idx + 1] = isYin ? 255 : 0;
          png.data[idx + 2] = isYin ? 255 : 0;
        } else {
          // 阴阳鱼主体
          const upperDist = Math.sqrt((dx - 0) ** 2 + (dy + halfR) ** 2);
          if (upperDist <= halfR && dy < 0) {
            // 上半小鱼 - 反转
            png.data[idx] = isYin ? 255 : 20;
            png.data[idx + 1] = isYin ? 245 : 20;
            png.data[idx + 2] = isYin ? 220 : 20;
          } else if (dist <= halfR && dy > 0) {
            // 下半小鱼 - 反转
            png.data[idx] = isYin ? 20 : 255;
            png.data[idx + 1] = isYin ? 20 : 245;
            png.data[idx + 2] = isYin ? 20 : 220;
          } else {
            // 主体
            png.data[idx] = isYin ? 20 : 255;
            png.data[idx + 1] = isYin ? 20 : 245;
            png.data[idx + 2] = isYin ? 20 : 220;
          }
        }
      }
    }
  }

  return png;
}

// 生成 192x192 和 512x512 图标
[192, 512].forEach((size) => {
  const png = createIcon(size);
  const buffer = PNG.sync.write(png);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: ${filePath}`);
});

console.log('All icons generated!');
