# MC Portfolio — Giao diện "Bàn Đặt Lịch"

Website một trang cho MC sự kiện, bố cục **chia đôi màn hình** như một quầy lễ tân khách sạn:

- **Máy tính**: bên trái là **ô đỏ gạch ghim cố định**. Ảnh lớn trong ô **đổi theo phần đang xem**: 8 thanh mành sáo
  khép lại rồi lật mở ra ảnh mới. Dưới ảnh là **tấm lịch trống** (thu gọn / mở được) và nút đặt lịch. Nút "Mục lục"
  ở góc trên mở danh sách các phần. Bên phải là nội dung cuộn.
- **Điện thoại**: ô trái thu thành **dải đỏ dính trên cùng** (chữ lồng tên · phần đang xem · nút **"Lịch trống"**).
  Bấm nút để mở bảng mục lục + lịch tháng.
- Mở trang: **ảnh MC hiện ra sau mành sáo lật mở**, tiêu đề serif lớn, chấm xanh "đang nhận lịch", nút Zalo.
- **Lịch trống**: ngày đã kín bị gạch chéo, ngày còn trống có chấm xanh. Bấm một ngày → ngày đó **tự điền vào Phiếu đặt lịch**.
- Thứ tự: Giới thiệu → **Sổ khách** (cảm nhận, đặt ngay sau giới thiệu) → Dịch vụ (hàng chọn + khung chi tiết)
  → Thước phim (video) → Khoảnh khắc (dải ảnh vuốt ngang) → Đối tác → Hỏi đáp → Đặt lịch (quầy liên hệ + phiếu).
- Liên hệ nhanh trên điện thoại: nút tròn đỏ **"Chat Zalo"** góc phải dưới.

Màu: màu xương `#F6F1E9`, đỏ gạch `#B5341E`, mực `#1E1A17`, xanh rêu `#3F5A3C`.
Font: Noto Serif Display (tiêu đề) · Hanken Grotesk (nội dung).

HTML + Tailwind CSS v4 + JavaScript thuần, không framework, không bundler.
Toàn bộ nội dung nằm trong **một file duy nhất: `site.config.js`**.

---

## Sửa nội dung (không cần biết code)

### Bước 1 — Mở đúng file
Mở **`site.config.js`** bằng Notepad, Notepad++ hoặc VS Code. Đây là file duy nhất cần sửa.
**Không** sửa `index.html`, `src/`, `dist/`.

### Bước 2 — Sửa chữ
- Chỉ sửa phần chữ **nằm giữa hai dấu ngoặc kép** `"..."`.
- Các chỗ ghi `[IN_HOA]` là thông tin chưa có, thay bằng thông tin thật. VD: `"[SO_DIEN_THOAI]"` → `"0901 234 567"`.
- Muốn xuống dòng trong tiêu đề: gõ `\n`. **Dòng sau `\n` sẽ in nghiêng màu đỏ gạch**
  (VD `"Khoảnh Khắc Đáng Nhớ\nBắt Đầu Từ Sân Khấu"`).
- Mỗi mục có comment đánh số (`// ─── 4. HERO ───`) cho biết mục đó hiện ở đâu trên trang.
- Tên từng phần (chữ "GIỚI THIỆU", "SỔ KHÁCH"… ở đầu mỗi phần, trong mục lục và trên dải đỏ) là key `sectionLabel` của từng mục.

### Bước 3 — Thay ảnh
1. Đặt ảnh vào đúng thư mục trong `public/images/` (xem bảng "Ảnh cần chuẩn bị" bên dưới).
2. Tên file viết thường, không dấu, nối bằng gạch ngang, có số: `service-01.webp`, `gallery-09.webp`.
3. Muốn có **bản nhẹ riêng cho điện thoại**: đặt thêm file cùng tên có đuôi `-m` ngay bên cạnh,
   VD `service-01-m.webp`. Trang tự dùng bản này trên điện thoại, không cần khai báo thêm.
4. Ghi đường dẫn vào `site.config.js` dạng `"public/images/services/service-01.webp"` (**không** có dấu `/` ở đầu).
5. Ảnh chưa có → trang tự hiện khung kẻ ngang (như mành sáo khép) đúng tỉ lệ, không bị vỡ.
6. Ảnh lớn ở ô trái (máy tính) cho từng phần: sửa `booking.paneImages`. Để `""` → tự lấy ảnh có sẵn của phần đó.

### Bước 4 — Thêm / bớt mục (dịch vụ, video, ảnh, đối tác, cảm nhận, câu hỏi)
- **Thêm**: copy nguyên một khối `{ ... },` rồi dán ngay sau nó, sửa chữ bên trong.
- **Bớt**: xóa cả khối `{ ... },` (kể cả dấu phẩy phía sau).
- Danh sách để trống `[]` → phần đó tự ẩn, số thứ tự của các phần sau tự dồn lên.

### Bước 5 — Đổi số mục hiện sẵn trên điện thoại
Trên điện thoại, danh sách dài được thu gọn sau nút **"Xem thêm (N)"**. Số mục hiện sẵn đặt bằng key `mobileVisible`:

| Khu vực | Key | Mặc định |
|---|---|---|
| Sổ khách (cảm nhận) | `testimonials.mobileVisible` | 2 |
| Hỏi đáp | `faq.mobileVisible` | 3 |

Từ 1024px trở lên (máy tính) luôn hiện đủ. Câu chuyện dài ở mục Giới thiệu (`about.story`) nằm sau nút
`about.storyToggleLabel` (mọi màn hình). Dịch vụ, video nhỏ và ảnh đã gọn sẵn (hàng chọn / vuốt ngang) nên
`services.mobileVisible`, `videos.mobileVisible`, `gallery.mobileVisible` được giữ để dùng chung với giao diện khác.

### Bước 6 — Cập nhật lịch trống
Trong mục `booking` ở đầu `site.config.js`:
- `busyDates`: danh sách **ngày đã kín lịch**, dạng `"NĂM-THÁNG-NGÀY"`, VD `"2026-11-14"`. Thêm/xóa ngày ở đây rồi build lại.
- `monthsAhead: 12`: khách xem được bao nhiêu tháng tới (lịch luôn bắt đầu từ tháng hiện tại; cuối tháng thì mở sẵn tháng sau).
- `title`, `note`, `pickLabel`, `indexLabel`: chữ trên tấm lịch và mục lục.

### Bước 7 — Build
Mở terminal trong thư mục này, chạy:

```bash
npm install        # chỉ cần lần đầu
npm run build
```

Terminal báo:
- **Vàng (cảnh báo)**: file ảnh được dùng nhưng chưa có, placeholder `[IN_HOA]` chưa thay.
- **Đỏ (lỗi)**: thiếu key / sai cú pháp → build trả mã lỗi 1. Lỗi hay gặp: **thiếu dấu phẩy** cuối dòng,
  **thiếu dấu ngoặc kép**, **xóa nhầm dấu `}` hoặc `]`**. Cần dấu ngoặc kép trong chữ thì dùng `“ ”` hoặc `\"`.

### Bước 8 — Xem thử trên điện thoại
```bash
npm run dev
```
Terminal in ra hai địa chỉ: `http://localhost:5173/` (máy tính) và `http://192.168.x.x:5173/` (**Mạng LAN**).
Điện thoại bắt **cùng Wi-Fi** với máy tính, mở địa chỉ Mạng LAN. Sửa `site.config.js` và lưu là trang tự build lại.

### Bước 9 — Đưa lên GitHub Pages
1. Tạo repo trên GitHub (VD `mc-portfolio`), đẩy toàn bộ thư mục này lên nhánh `main`.
2. Trên GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Mỗi lần push lên `main`, workflow `.github/workflows/deploy.yml` tự build và đưa lên (xem tiến trình ở tab **Actions**).
4. Điền `seo.url` trong `site.config.js` bằng link trang (VD `https://ten-ban.github.io/mc-portfolio/`)
   để ảnh chia sẻ Zalo/Facebook hiện đúng.

---

## Key mới của giao diện này (ghi "(MỚI)" trong `site.config.js`)

Xóa các key này đi trang vẫn chạy (dùng chữ mặc định). File config của Temp khác copy sang vẫn build được.

| Key | Tác dụng |
|---|---|
| `booking.busyDates` | Ngày đã kín lịch (gạch chéo trên lịch) |
| `booking.monthsAhead` | Số tháng khách xem được trên lịch |
| `booking.title`, `booking.note`, `booking.pickLabel`, `booking.indexLabel` | Chữ trên tấm lịch, nút "Điền phiếu cho ngày …", tên mục lục |
| `booking.paneImages` | Ảnh lớn ở ô trái (máy tính) cho từng phần; `""` = tự chọn |
| `services.askLabel` | Chữ nút "Hỏi lịch cho …" trong khung dịch vụ |
| `hero.availability` | Dòng có chấm xanh "đang nhận lịch" (để `""` thì ẩn) |
| `hero.image`, `hero.imagePosition` | Ảnh MC đã tối ưu (điện thoại / máy tính) và điểm lấy nét khi cắt ảnh |
| `ui.*` | Chữ trên nút "Xem thêm", "Thu gọn", "Đóng", "Ảnh trước/sau", lời báo video chưa có |
| `about.summary`, `about.storyToggleLabel` | Tóm tắt luôn hiện, chữ nút mở câu chuyện đầy đủ |
| `*.mobileVisible` | Số mục hiện sẵn trên điện thoại |
| `faq.*` | Câu hỏi thường gặp (mảng `items` rỗng → ẩn) |

`hero.backgroundDesktop` / `hero.backgroundMobile` chỉ dùng khi chưa có `hero.image`.
`brand.logo` chỉ làm favicon (ô trái hiện chữ lồng tự tạo từ tên).
`hero.scrollIndicator: true` hiện dòng "Cuộn xuống" cuối màn hình đầu trên máy tính.

## Placeholder cần thay

| Placeholder | Ý nghĩa / ví dụ |
|---|---|
| `[TEN_MC]` | Tên MC / thương hiệu |
| `[SO_NAM_KINH_NGHIEM]`, `[SO_SU_KIEN]` | Số liệu, VD `8`, `500` |
| `[SO_DIEN_THOAI]` | `0901 234 567` (tự tạo link `tel:`) |
| `[ZALO_LINK]` | `https://zalo.me/0901234567` |
| `[EMAIL]` | Email nhận phiếu đặt lịch từ form |
| `[FACEBOOK_LINK]`, `[YOUTUBE_LINK]` | Link trang cá nhân |
| `[YOUTUBE_SHOWREEL_URL]`, `[YOUTUBE_VIDEO_01..04]` | Link YouTube hoặc `public/videos/xxx.mp4` |
| `[WEBSITE_URL]` | URL website sau khi deploy |
| `[DIA_CHI]` | Khu vực hoạt động (còn placeholder thì dòng này tự ẩn) |

Link còn placeholder tự trỏ về phần Đặt lịch (`#contact`), không bao giờ thành link hỏng.

## Ảnh cần chuẩn bị

Ưu tiên `.webp`. Kích thước: **điện thoại** trước, **máy tính** sau.

| File | Điện thoại | Máy tính |
|---|---|---|
| `hero/hero-01-m.webp`, `hero/hero-01.webp` | 600×750 (dọc 4:5) | 900×1200 (dọc 3:4) — hiện ở ô trái |
| `about/portrait-mobile.webp`, `about/portrait.webp` | 400×500 (4:5) | 600×800 (3:4) — hiện ở ô trái |
| `services/service-01..06.webp` (+ `-m`) | 640×640 vuông, dùng chung | 640×640 |
| `videos/showreel-thumb.webp` (+ `-m`) | 1280×720, dùng chung | 1280×720 |
| `videos/video-01..04.webp` (+ `-m`) | 640×360, dùng chung | 640×360 |
| `gallery/gallery-01..08.webp` (+ `-m`) | 1200×900 (4:3), dùng chung — tự cắt vừa khung 4:5 / vuông | 1200×900 |
| Ảnh ô trái (`booking.paneImages`) | — (không hiện trên điện thoại) | 900×1200 dọc đẹp nhất |
| `partners/partner-01..06.webp` | 200×80 nền trong suốt, dùng chung | 200×80 |
| `testimonials/avatar-01..04.webp` | 100×100 vuông, dùng chung | 100×100 |
| `og/og-cover.jpg` | 1200×630 JPG (ảnh khi chia sẻ link) | — |

Tất cả nằm trong `public/images/`. Logo đối tác và avatar chưa có → trang hiện tên công ty / chữ cái đầu.
Icon (`public/icons/`): `favicon.svg` (chữ M nghiêng trên nền đỏ gạch), `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`.

---

## Các lệnh

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Build (không minify), mở server tại http://localhost:5173 + địa chỉ LAN, tự build lại khi sửa `index.html`, `site.config.js`, `src/`, `public/` |
| `npm run build` | Build bản chính thức (CSS minify) vào `dist/` |
| `npm run preview` | Chỉ phục vụ `dist/` đang có, không build |
| `node scripts/build.mjs --html-only` | Chỉ ghép HTML, bỏ qua CSS (nhanh) |

- Đổi cổng: PowerShell `$env:PORT=3000; npm run dev`.
- Giả lập GitHub Pages dạng project: `npm run dev -- --base=/mc-portfolio/` rồi mở http://localhost:5173/mc-portfolio/.
- Trên Windows, nếu PowerShell chặn `npm`, dùng `npm.cmd run build`.

## Cấu trúc thư mục

```
├── site.config.js        # NỘI DUNG website (sửa ở đây)
├── index.html            # Khung HTML (template): .page chia đôi = ô trái (.desk) + nội dung (main)
├── src/
│   ├── templates.js      # Bộ render: config → HTML (ô trái/dải đỏ, lịch, các phần)
│   ├── input.css         # CSS nguồn Tailwind v4 (màu, font trong @theme)
│   └── js/main.js        # JS: mành sáo đổi ảnh, phần đang xem, lịch trống, tab dịch vụ, xem thêm,
│                         #     dải ảnh, xem ảnh, video, nút nổi, phiếu đặt lịch
├── public/               # icons/, images/<khu-vuc>/, videos/
├── scripts/
│   ├── build.mjs         # Build → dist/
│   └── dev.mjs           # Server phát triển (cổng 5173, có địa chỉ LAN)
└── .github/workflows/deploy.yml
```

Không có JavaScript: dải đỏ thành khối mục lục + danh sách ngày đã kín ở đầu trang, mọi dịch vụ xếp chồng,
mọi nội dung (kể cả phần thu gọn) vẫn hiện đầy đủ.
Máy bật "giảm chuyển động": tắt mành sáo (ảnh đổi ngay), hiện dần, lộ ảnh theo dải, chấm nhấp nháy và cuộn mượt.
