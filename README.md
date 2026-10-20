# Subnovel

Website terjemahan novel web "Subnovel" ([fenriralm.com](https://fenriralm.com)), dibangun dengan
[Jekyll](https://jekyllrb.com/) dan dipublikasikan ke GitHub Pages.

## Struktur repositori

| Path | Isi |
| --- | --- |
| `_posts/` | Chapter yang sudah dipublikasikan (format `YYYY-MM-DD-chapter-N.md`) |
| `chapter/done/` | Teks sumber chapter yang sudah selesai dikerjakan |
| `chapter/undone/` | Teks sumber chapter yang belum dipublikasikan |
| `_layouts/default.html` | Layout utama: `<head>`, navigasi chapter, dan tombol gulir |
| `index.html` | Halaman utama: hero, pencarian chapter, dan grid chapter |
| `404.html` | Halaman "tidak ditemukan" |
| `assets/style.css` | Seluruh gaya tampilan (light & dark mode, print) |
| `assets/js/scroll.js` | Bottom bar: progres baca, navigasi cepat, dan gulir otomatis |
| `assets/js/sidebar.js` | Sidebar daftar chapter dengan pencarian |
| `assets/js/index.js` | Pencarian chapter di halaman utama |
| `assets/favicon.svg`, `assets/og-image.png` | Ikon situs & gambar pratinjau media sosial |
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

## Menambahkan chapter

1. Setelah selesai dikerjakan, pindahkan teks sumber dari `chapter/undone/` ke `chapter/done/`.
2. Buat `_posts/YYYY-MM-DD-chapter-N.md` dengan front matter:

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

4. Chapter otomatis muncul di daftar pada `index.html` dan mendapat navigasi chapter
   sebelumnya/berikutnya.

## Deployment

`.github/workflows/jekyll-gh-pages.yml` membangun situs dengan versi gem yang sama persis dengan
`Gemfile.lock`, menjalankan pemeriksaan tautan dan konvensi konten, lalu mem-deploy hasilnya ke
GitHub Pages setiap ada push ke branch `main`. `.github/workflows/ci.yml` menjalankan pemeriksaan yang
sama pada setiap pull request.

## Konfigurasi

`_config.yml` memuat `url` dan `baseurl` yang dipakai untuk membuat tautan kanonik dan Open Graph.
Jika situs dipindahkan ke domain sendiri, sesuaikan kedua nilai tersebut.

Situs tidak memakai tema Jekyll pihak ketiga; seluruh layout dan gaya ditulis sendiri di repo ini.
