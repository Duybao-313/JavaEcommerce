# Seed Data Script for JavaEcommerce (SplitGo)

## Overview

This SQL script generates seed data for the ecommerce database, including:

- **23 users**: 1 Admin + 1 Buyer + 21 Sellers (with stores)
- **161 categories**: Hierarchical (parent-child) categories from actual Lazada product data
- **200 products**: Real product data extracted from Lazada marketplace
- **57 product variants**: Sample variants (color/size combinations) for some products

## How to Use

### Option 1: MySQL Workbench (Recommended)

1. Open **MySQL Workbench**
2. Connect to your database (`localhost:3306`, user: `root`, password: `root`)
3. Make sure the database `ecommerce` exists:
   ```sql
   CREATE DATABASE IF NOT EXISTS ecommerce;
   USE ecommerce;
   ```
4. Open the file `seed_data.sql` (File → Open SQL Script)
5. Execute the script (⚡ button or Ctrl+Shift+Enter)

### Option 2: Command Line

```bash
mysql -u root -p ecommerce < seed_data.sql
```

Password: `root`

### Option 3: Via Spring Boot (Auto-init)

The script can be placed in `src/main/resources/` and Spring Boot can auto-execute it. However, since the app uses `ddl-auto: update`, you may need to run it manually the first time.

## What Gets Inserted

### Users (password: seller123 for all sellers)

| ID   | Username          | Role        | Store Name        |
| ---- | ----------------- | ----------- | ----------------- |
| 1    | admin             | ROLE_ADMIN  | System Admin      |
| 2    | buyer1            | ROLE_USER   | Nguyen Van A      |
| 3    | seller1           | ROLE_SELLER | 2022 Mobile Store |
| 4-22 | seller2..seller20 | ROLE_SELLER | Various stores    |

### Categories (161 total)

Hierarchical structure with up to 4 levels deep. Examples:

- Electronics → Komputer & Laptop → Laptop → Laptop Umum
- Fashion → Tas & Travel → Tas Anak → Koper
- Beauty → Kecantikan → Perawatan Kulit → Pelembap Muka

### Products (200 total)

Real products with:

- Actual names, descriptions, prices from Lazada
- Stock (10-500, randomized)
- View/sold counts
- Images (original Lazada URLs)
- Proper category assignments
- 15% featured products

## Notes

- The script uses `SET FOREIGN_KEY_CHECKS = 0` to bypass constraint checking
- Passwords use bcrypt hash format
- The product data was filtered from 1000+ raw entries to 200 best products
- Thai language categories are included (from Lazada Thailand data)
- Run this AFTER the tables have been created by Hibernate (start the Spring Boot app once first)
