# Subnovel

Website terjemahan novel web "Subnovel" ([fenriralm.com](https://fenriralm.com)), dibangun dengan
[Jekyll](https://jekyllrb.com/) dan dipublikasikan ke GitHub Pages.

## Struktur repositori

| Path | Isi |
| --- | --- |
| `_posts/` | Chapter yang sudah dipublikasikan (format `YYYY-MM-DD-chapter-N.md`) |
| `chapter/done/` | Teks sumber chapter yang sudah selesai dikerjakan |
| `chapter/undone/` | Teks sumber chapter yang masih menunggu terjemahan |
| `_layouts/default.html` | Layout utama: `<head>`, navigasi chapter, dan tombol gulir |
| `index.html` | Daftar chapter, diurutkan dari yang terbaru |
| `assets/style.css` | Seluruh gaya tampilan (light & dark mode) |
| `assets/js/scroll.js` | Tombol pintasan gulir ke atas/bawah |
| `script/check-links.rb` | Pemeriksa tautan internal pada hasil build |

Folder `chapter/` hanya berisi materi kerja dan tidak ikut dipublikasikan.

## Menjalankan secara lokal

```bash
bundle install
bundle exec jekyll serve
```

Situs tersedia di <http://localhost:4000/subnovel/> (baseurl `/subnovel` mengikuti konfigurasi
GitHub Pages). Untuk membangun statis tanpa server:

```bash
bundle exec jekyll build
ruby script/check-links.rb _site
```

## Menambahkan chapter

1. Salin teks sumber dari `chapter/undone/` ke `chapter/done/` setelah selesai dikerjakan.
2. Buat `_posts/YYYY-MM-DD-chapter-N.md` dengan front matter:

   ```yaml
   ---
   layout: default
   title: "Chapter N: Judul Chapter"
   ---
   ```

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

   Baris `{: .credits}` dan `{: .notes}` adalah *block IAL* kramdown yang menandai blok credit
   serta catatan kaki agar bisa diberi gaya terpisah. Judul chapter tidak perlu ditulis di body
   karena sudah diambil dari `title` pada front matter.

4. Chapter otomatis muncul di daftar pada `index.html` dan mendapat navigasi chapter
   sebelumnya/berikutnya.

## Deployment

`.github/workflows/jekyll-gh-pages.yml` membangun situs dengan versi gem yang sama persis dengan
`Gemfile.lock` lalu mem-deploy hasilnya ke GitHub Pages setiap ada push ke branch `main`.
`.github/workflows/ci.yml` menjalankan build, pemeriksaan tautan internal, dan sanity check pada
setiap pull request.

## Konfigurasi

`_config.yml` memuat `url` dan `baseurl` yang dipakai untuk membuat tautan kanonik dan Open Graph.
Jika situs dipindahkan ke domain sendiri, sesuaikan kedua nilai tersebut.
