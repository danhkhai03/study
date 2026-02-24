# 🎮 KẾ HOẠCH HỆ THỐNG PET - CLASSPET

## 📋 TỔNG QUAN

### Mục tiêu:
1. Giáo viên chọn 1 trong 5 pet mặc định khi tạo học sinh
2. Học sinh có thể mua thêm pet khác trong shop
3. Pet có nhiều trạng thái (idle, happy, hungry, eating, sleeping)
4. TV View có túi đồ, cho pet ăn, tương tác

---

## 🎨 HƯỚNG DẪN TÌM TÀI NGUYÊN SPRITE

### Bước 1: Tìm Sprite Sheet có nhiều trạng thái

**Nguồn miễn phí tốt nhất:**

1. **Itch.io** - https://itch.io/game-assets/free/tag-pets
   - Tìm kiếm: "pixel pet", "cute animal sprites", "pet pack"
   - Ưu điểm: Nhiều pack có sẵn nhiều animation states

2. **OpenGameArt** - https://opengameart.org/
   - Tìm: "animal sprite", "pet sprite sheet"
   - Filter by: CC0 or CC-BY license

3. **Kenney.nl** - https://kenney.nl/assets
   - Tìm: "animal", "creature"
   - 100% free, high quality

### Bước 2: Cấu trúc Sprite Sheet cần tìm

```
Mỗi con pet cần có các animation sau:
├── idle       (4-8 frames) - Đứng yên, thở
├── walk       (6-8 frames) - Đi lại
├── eat/feed   (4-6 frames) - Ăn
├── sleep      (2-4 frames) - Ngủ
├── happy      (4-6 frames) - Vui vẻ, nhảy
├── sad        (2-4 frames) - Buồn
└── hungry     (4 frames)   - Đói

Kích thước gợi ý: 32x32 hoặc 64x64 pixels mỗi frame
```

### Bước 3: Pack gợi ý cụ thể

| Pack | Link | Giá | Có gì |
|------|------|-----|-------|
| **Pixel Pets** | https://elthen.itch.io/2d-pixel-art-cat-sprites | FREE | Cat với nhiều states |
| **Sprout Lands** | https://cupnooble.itch.io/sprout-lands-asset-pack | $5 | Dog, Cat, Chicken, Cow |
| **Cute Fantasy RPG** | https://kenney.nl/assets/pixel-platformer-food | FREE | Nhiều food items |
| **Farm Animals** | https://opengameart.org/content/farm-animals | FREE | Pig, Cow, Sheep |

---

## 🗂️ CẤU TRÚC THƯ MỤC TÀI NGUYÊN

```
classpet-app/
└── public/
    └── assets/
        └── pets/
            ├── dog/
            │   ├── sprite_sheet.png    # Tất cả frames
            │   └── config.json         # Cấu hình animation
            ├── cat/
            ├── rabbit/
            ├── bear/
            ├── fox/
            └── dragon/
        └── foods/
            ├── cookie.png
            ├── carrot.png
            ├── meat.png
            └── cake.png
```

### Cấu trúc config.json cho mỗi pet:

```json
{
  "spriteSheet": "/assets/pets/dog/sprite_sheet.png",
  "frameSize": { "width": 64, "height": 64 },
  "animations": {
    "idle": {
      "row": 0,
      "frames": 4,
      "speed": 0.15
    },
    "walk": {
      "row": 1,
      "frames": 6,
      "speed": 0.1
    },
    "eat": {
      "row": 2,
      "frames": 4,
      "speed": 0.2
    },
    "sleep": {
      "row": 3,
      "frames": 2,
      "speed": 0.5
    },
    "happy": {
      "row": 4,
      "frames": 6,
      "speed": 0.1
    },
    "hungry": {
      "row": 5,
      "frames": 4,
      "speed": 0.2
    }
  }
}
```

---

## 🖥️ FRONTEND COMPONENTS CẦN TẠO

### 1. SpriteAnimator Component
- Load sprite sheet
- Play animation theo state
- Loop hoặc one-shot

### 2. PetInteractiveView Component (TV View)
- Phóng to pet khi click
- Hiển thị stats (hunger, happiness)
- Drag & drop food để cho ăn

### 3. InventoryPanel Component
- Grid hiển thị items
- Click để chọn food
- Số lượng của mỗi item

### 4. PetSelector Component (Khi tạo học sinh)
- Hiển thị 5 pet mặc định
- Click để chọn
- Preview animation

---

## 📡 API ENDPOINTS ĐÃ TẠO

### Pet Types:
- `GET /api/pet-types-default` - 5 pet mặc định
- `GET /api/pet-types-shop` - Pet có thể mua

### Pet Food:
- `GET /api/pet-foods` - Danh sách thức ăn
- `POST /api/students/{id}/buy-food` - Mua thức ăn
- `POST /api/students/{id}/feed-pet` - Cho pet ăn

### Inventory:
- `GET /api/students/{id}/inventory` - Túi đồ của học sinh
- `GET /api/students/{id}/pet-details` - Chi tiết pet + inventory

### Public (TV):
- `GET /api/public/students/{id}/pet` - Pet details cho TV
- `GET /api/public/students/{id}/inventory` - Inventory cho TV
- `POST /api/public/students/{id}/feed-pet` - Cho ăn từ TV

---

## ⏱️ TIMELINE THỰC HIỆN

### Phase 1: Backend (Đã hoàn thành ✅)
- [x] Migration database
- [x] Models (PetFood, StudentInventory, PetFeedLog)
- [x] Controller (PetInteractionController)
- [x] API Routes
- [x] Seeder (5 default pets + foods)

### Phase 2: Tài nguyên (Cần làm)
- [ ] Download sprite sheets
- [ ] Tạo config.json cho mỗi pet
- [ ] Upload vào public/assets/

### Phase 3: Frontend - Teacher View
- [ ] Cập nhật form tạo học sinh (chọn pet)
- [ ] PetSelector component

### Phase 4: Frontend - TV View
- [ ] SpriteAnimator component
- [ ] PetInteractiveView (click để phóng to)
- [ ] InventoryPanel
- [ ] Feed animation

### Phase 5: Polish
- [ ] Sound effects
- [ ] Particle effects khi cho ăn
- [ ] Leaderboard theo pet level

---

## 🚀 CHẠY MIGRATION

```bash
cd classpet-api
php artisan migrate
php artisan db:seed --class=PetSystemSeeder
```

---

## 📝 GHI CHÚ

1. **Hunger decreases over time**: Cần tạo Laravel Scheduler để giảm hunger mỗi giờ
2. **Pet mood affects XP gain**: Pet happy = +20% XP, Pet hungry = -20% XP
3. **Rare pets có stats cao hơn**: Max level cao hơn, hunger giảm chậm hơn
