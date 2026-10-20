# Subnovel

Website terjemahan novel web ke dalam bahasa Indonesia, dibangun dengan
[Jekyll](https://jekyllrb.com/) dan dipublikasikan ke GitHub Pages. Situs ini mendukung
**lebih dari satu novel**: setiap novel adalah satu *collection* Jekyll dengan folder, tracker,
halaman daftar chapter, dan feed Atom-nya sendiri.

## Struktur repositori

| Path | Isi |
| --- | --- |
| `_absolute-regression/` | Chapter novel "Absolute Regression" (collection `absolute-regression`) |
| `_novel-dua/` | Chapter novel kedua (collection `novel-dua`) — contoh novel tambahan |
| `chapter/<slug>/done/` | Teks sumber chapter yang sudah selesai dikerjakan |
| `chapter/<slug>/undone/` | Teks sumber chapter yang belum dipublikasikan |
| `_layouts/default.html` | Layout utama: `<head>`, navigasi, sidebar, dan bottom bar |
| `_layouts/novel.html` | Halaman daftar chapter sebuah novel (hero + pencarian) |
| `index.html` | Beranda: daftar seluruh novel + chapter terbaru tiap novel |
| `<slug>.html` | Halaman daftar chapter sebuah novel |
| `404.html` | Halaman "tidak ditemukan" |
| `assets/style.css` | Seluruh gaya tampilan (light & dark mode, print) |
| `assets/js/scroll.js` | Bottom bar: progres baca, navigasi cepat, dan gulir otomatis |
| `assets/js/sidebar.js` | Sidebar daftar chapter + pemilih novel |
| `assets/js/index.js` | Pencarian chapter di halaman daftar chapter |
| `script/check-links.rb` | Pemeriksa tautan internal pada hasil build |
| `script/check-content.sh` | Pemeriksaan konvensi markdown chapter |

Folder `chapter/` hanya berisi materi kerja dan tidak ikut dipublikasikan.

## Menjalankan secara lokal

```bash
bundle install
bundle exec jekyll serve
```

Situs tersedia di <http://localhost:4000/subnovel/> (baseurl `/subnovel` mengikuti konfigurasi
GitHub Pages). Untuk membangun statis tanpa server:

```bash
bundle exec jekyll build --strict_front_matter
bash script/check-content.sh _site
ruby script/check-links.rb _site
```

## Menambahkan novel baru

1. Buat folder collection `_<slug>/` (misal `_novel-dua/`).
2. Daftarkan slug itu di `_config.yml`:

   ```yaml
   collections:
     novel-dua:
       output: true
       permalink: /novel-dua/:year/:month/:day/:title.html

   novels:
     novel-dua:
       title: Novel Dua
       description: Deskripsi singkat novel ini.
       source: https://contoh.com
       path: /novel-dua/      # halaman daftar chapter
       feed: /novel-dua/feed.xml
   ```

   `path` adalah URL halaman daftar chapter novel tersebut, `feed` URL feed Atom-nya.
   Halaman daftar chapter tiap novel memakai URL `/<slug>/`, sedangkan chapter-nya memakai
   permalink di atas supaya URL chapter lama tidak berubah.

3. Buat file halaman `<slug>.html` agar novel itu punya halaman daftar chapter:

   ```yaml
   ---
   layout: novel
   title: Novel Dua
   description: Deskripsi singkat novel ini.
   novel: novel-dua
   permalink: /novel-dua/
   wide: true
   scripts:
     - /assets/js/index.js
   ---
   ```

4. Buat tracker-nya: `chapter/<slug>/done/` dan `chapter/<slug>/undone/`.
5. Tambahkan chapter dengan nama file `YYYY-MM-DD-chapter-N.md` di `_<slug>/`.

Novel otomatis muncul di sidebar (pemilih novel), di beranda, dan sebagai section "Chapter terbaru"
di beranda.

## Peta halaman

| Halaman | URL |
| --- | --- |
| Beranda: daftar semua novel + chapter terbaru | `/` |
| Daftar chapter "Absolute Regression" | `/absolute-regression/` |
| Daftar chapter novel kedua | `/novel-dua/` |
| Chapter (URL tidak berubah) | `/2025/11/09/chapter-241.html` |

## Menambahkan chapter

1. Setelah selesai dikerjakan, pindahkan teks sumber dari `chapter/<slug>/undone/` ke
   `chapter/<slug>/done/`.
2. Buat `_<slug>/YYYY-MM-DD-chapter-N.md` dengan front matter:

   ```yaml
   ---
   layout: default
   title: "Chapter N: Judul Chapter"
   date: 2025-11-09 04:02:00 +0000
   ---
   ```

   `date` memakai tanggal dasar yang sama untuk semua chapter, dengan waktu yang menyatakan urutan
   chapter (jam 04:02 = chapter 242). Ini membuat feed Atom dan navigasi selalu terurut dari yang
   terbaru, tanpa mengubah URL chapter.

3. Isi body dengan format berikut:

   ```markdown
   Penerjemah: Nama Penerjemah
   Editor/Pemeriksa Kualitas: Nama Editor
   Konsultan Istilah Murim: Nama Konsultan
   {: .credits}

   ---

   Isi chapter...

   1 : Catatan kaki pertama
   2 : Catatan kaki kedua
   {: .notes}
   ```

   Beberapa aturan yang dijaga oleh `script/check-content.sh`:

   * Baris `{: .credits}` dan `{: .notes}` adalah *block IAL* kramdown yang menandai blok credit
     serta catatan kaki agar bisa diberi gaya terpisah. Judul chapter tidak perlu ditulis di body
     karena sudah diambil dari `title` pada front matter.
   * Nomor catatan kaki **harus** ditulis `1 :` (dengan spasi sebelum titik dua). Bentuk `1.` akan
     dibaca kramdown sebagai daftar berurutan dan merusak blok catatan.
   * Pemisah antar adegan ditulis `* * *` dengan spasi biasa. Spasi non-breaking (`U+00A0`) membuat
     baris tersebut terbaca sebagai bullet list.

4. Chapter otomatis muncul di daftar chapter novel tersebut dan mendapat navigasi chapter
   sebelumnya/berikutnya (dalam novel yang sama).

## Deployment

`.github/workflows/jekyll-gh-pages.yml` membangun situs dengan versi gem yang sama persis dengan
`Gemfile.lock`, menjalankan pemeriksaan tautan dan konvensi konten, lalu mem-deploy hasilnya ke
GitHub Pages setiap ada push ke branch `main`. `.github/workflows/ci.yml` menjalankan pemeriksaan yang
sama pada setiap pull request.

## Konfigurasi

`_config.yml` memuat `url` dan `baseurl` yang dipakai untuk membuat tautan kanonik dan Open Graph.
Jika situs dipindahkan ke domain sendiri, sesuaikan kedua nilai tersebut.

Situs tidak memakai tema Jekyll pihak ketiga; seluruh layout dan gaya ditulis sendiri di repo ini.
