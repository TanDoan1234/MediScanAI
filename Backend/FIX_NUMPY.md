# 🔧 Sửa lỗi xung đột numpy với pandas

## Vấn đề

Khi cài đặt EasyOCR, có cảnh báo:
```
pandas 2.1.3 requires numpy<2,>=1.26.0, but you have numpy 2.2.6 which is incompatible.
```

## Giải pháp

### Cách 1: Downgrade numpy về 1.x (Khuyến nghị)

```bash
pip install "numpy<2.0,>=1.26.0"
```

Hoặc cài lại tất cả dependencies:
```bash
pip install -r requirements.txt --force-reinstall
```

### Cách 2: Upgrade pandas lên version mới hơn

```bash
pip install pandas>=2.2.0
```

Pandas 2.2+ hỗ trợ numpy 2.x.

## Kiểm tra

Sau khi sửa, kiểm tra version:
```bash
pip show numpy pandas
```

Nên thấy:
- numpy: 1.26.x (không phải 2.x)
- pandas: 2.1.3 hoặc cao hơn

## Lưu ý

- Cảnh báo này không ngăn cản cài đặt
- Code có thể vẫn chạy được nhưng có thể gặp lỗi khi import pandas
- Nên sửa để đảm bảo tương thích

