# English Learning Hub

Kişisel İngilizce çalışma alanı — kelime kartları, aralıklı tekrar (spaced repetition), mini oyunlar, ders notları, yapılacaklar listesi ve istatistikleri tek bir panelde toplar.

## Özellikler

- **Kelimeler** — kelime/anlam/örnek cümle ekleme, etiketleme, toplu ekleme
- **Kelime Tekrarı** — aralıklı tekrar algoritmasıyla günlük tekrar akışı
- **Oyun** — Quiz, Typing, Cloze ve Matching modlarıyla pratik
- **Notlar & Ders Notları** — serbest notlar ve ders bazlı kayıtlar
- **Yapılacaklar & Takvim** — görev ve ders takibi
- **İstatistikler** — ilerleme grafikleri

## Teknolojiler

- React 19 + TypeScript + Vite, Tailwind CSS
- PWA desteği (`vite-plugin-pwa`)
- Node/Express API + SQLite (`node:sqlite`) — veriler tarayıcıya değil diskteki veritabanına kaydedilir

## Kurulum

```bash
npm install
cp .env.example .env
npm run dev
```

Uygulama `http://localhost:5173`, API `http://localhost:5175` üzerinde çalışır.
