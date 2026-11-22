# Sumber gambar menu

Gambar menu awal diambil dari Wikimedia Commons dengan lisensi **CC0** (domain publik, atribusi tidak wajib), lalu diunggah ke Blob store `menu-images`.

| Menu | Sumber | Lisensi |
|------|--------|---------|
| Kopi Suroko | https://commons.wikimedia.org/wiki/File:Cup_of_coffee_in_Caf%C3%A9_Butter_-_Prenzlauer_Berg,_Berlin.jpg | CC0 |
| Nasi Ayam | https://commons.wikimedia.org/wiki/File:Fried_rice_with_chicken_1.jpg | CC0 |
| Teh Tarik | https://commons.wikimedia.org/wiki/File:Hong_Kong_Milk_Tea_(Cold)_-_Bun_House_2025-01-07.jpg | CC0 |

File diunduh sebagai thumbnail 960px, disimpan sebagai JPEG di Blob, dan URL-nya dicatat di kolom `Menu.imageUrl`. Admin dapat mengganti atau menghapus gambar lewat halaman Kelola Menu.

Catatan: generator gambar AI tidak terpakai karena kredensial tidak tersedia di lingkungan ini; foto CC0 dipilih agar tidak ada kewajiban atribusi di UI.
