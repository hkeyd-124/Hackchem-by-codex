# Phase 4 Migration Runbook (Staging -> Production)

Tài liệu này dùng để chạy backfill schema users an toàn, theo hướng **dry-run trước, apply sau**.

## 1) Pre-flight checklist

- [ ] Đảm bảo branch đã merge đầy đủ thay đổi Phase 4.
- [ ] Đảm bảo có backup Firestore hoặc export snapshot gần nhất.
- [ ] Đảm bảo test suite pass trước khi migrate.
- [ ] Đảm bảo có 1 khoảng thời gian ít traffic để apply.

## 2) Dry-run trên staging

Mục tiêu: chỉ xem patch dự kiến, **không ghi dữ liệu**.

```js
import { backfillUserSchema } from "./scripts/backfillUserSchema.js";
import { formatBackfillReport } from "./scripts/backfillReportFormatter.js";

const report = await backfillUserSchema({ dryRun: true });
console.log(formatBackfillReport(report, { maxRows: 30 }));
```

### Dry-run pass khi:
- `changedUsers` hợp lý với kỳ vọng.
- Không có patch bất thường (ví dụ reset `points/streak` sai).
- Report format đọc được và đủ thông tin review.

## 3) Apply trên staging (batch nhỏ)

Sau khi dry-run ổn:

```js
const applyReport = await backfillUserSchema({ dryRun: false });
console.log(formatBackfillReport(applyReport, { maxRows: 30 }));
```

### Verify sau apply staging
- Login email vẫn hoạt động.
- Check-in vẫn tăng điểm/streak đúng.
- Progress lesson cũ vẫn giữ nguyên.
- User bị ban vẫn bị chặn.

## 4) Promotion sang production

Chỉ promote khi staging pass toàn bộ checklist.

Các bước production lặp lại y hệt:
1. `dryRun: true` -> review report.
2. `dryRun: false` -> apply.
3. Verify acceptance checklist.

## 5) Rollback plan

Nếu phát hiện patch sai:
1. Dừng apply ngay.
2. Khôi phục từ Firestore export snapshot gần nhất.
3. Ghi lại root cause vào issue + bổ sung test cho case đó.

## 6) Acceptance checklist (bắt buộc)

- [ ] User login email nhận đúng trạng thái verify.
- [ ] Existing points/streak/progress không bị mất.
- [ ] Wallet linking không map sai uid.
- [ ] Lesson rank thresholds không đổi.
- [ ] API chat fallback vẫn trả response hợp lệ khi upstream lỗi.
