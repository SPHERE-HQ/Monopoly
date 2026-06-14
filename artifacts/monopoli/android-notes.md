# Setup Android Keystore (untuk Release APK)

Untuk build APK release yang sudah ditandatangani, tambahkan secrets berikut di GitHub repo:
Settings → Secrets and variables → Actions → New repository secret

## Secrets yang dibutuhkan:

| Secret | Keterangan |
|--------|-----------|
| `KEYSTORE_BASE64` | Keystore dalam format base64 (`base64 -w 0 release.keystore`) |
| `KEY_ALIAS` | Alias key di keystore |
| `KEY_PASSWORD` | Password untuk key |
| `STORE_PASSWORD` | Password untuk keystore |

## Cara generate keystore baru:

```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias monopoli \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

## Cara encode ke base64:

```bash
base64 -w 0 release.keystore
```

## Catatan:
- Debug APK selalu ter-build tanpa perlu keystore
- Release APK hanya ter-build di branch `main` dan jika KEYSTORE_BASE64 sudah di-set
