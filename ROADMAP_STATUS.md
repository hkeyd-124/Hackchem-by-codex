# Roadmap Status

## ✅ Đã hoàn thành

### Phase 1 / 1.1
- Đã chuẩn hóa identity/session qua `sessionService.js`.
- Đã thay đa số truy cập `localStorage` trực tiếp sang service APIs.

### Phase 2
- Tách check-in/points logic ra `pointsService.js`.
- Tách lesson progress/rank logic ra `lessonProgressService.js`.

### Phase 3
- Harden `api/chat.js`: validate input, timeout + retry, guardrail quiz payload.

### Phase 4 (đang thực hiện)
- Thêm `userSchema.js` làm source-of-truth cho normalize/default user data.
- Thêm `scripts/backfillUserSchema.js` để dry-run/backfill dữ liệu users.

## 🔜 Bước tiếp theo (đang triển khai trong PR này)
- Thiết lập contract tests cho các helper thuần:
  - `userSchema` patch/default behavior.
  - `api/chatValidation` parse/extract/schema-validation behavior.
  - `pointsService` reward/check-in behavior.
  - `lessonProgressService` key migration/rank thresholds.

## 🎯 Mục tiêu sau đó
- Chạy migration `backfillUserSchema` ở dry-run trước, log kết quả, rồi mới apply thật.
- Bổ sung smoke test cho các luồng chính: login email, check-in, save lesson progress.
- Mở rộng smoke test cho `api/chat` handler với các case upstream lỗi 502 HTML.
- Mở rộng smoke test cho `sessionService` (ưu tiên uid/wallet fallback, scoped key, clear helpers).
- Tách phần lập kế hoạch patch migration thành pure-core để test độc lập trước khi chạy thật.
- Tách runner migration để test được dry-run/apply behavior trước khi chạy trên Firestore thật.
- Thêm formatter report để review nhanh kết quả dry-run trước khi apply migration.
- Bổ sung contract tests cho login-email decision flow (map auth errors, verify-state, banned-state).
- Soạn `MIGRATION_RUNBOOK.md` cho quy trình dry-run/apply/rollback trên staging -> production.
