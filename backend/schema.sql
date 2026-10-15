-- =========================================================
-- IT Company Website — MySQL/MariaDB Schema (XAMPP Compatible)
-- =========================================================

CREATE DATABASE IF NOT EXISTS it_company_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_company_db;

-- ---------- ADMINS ----------
CREATE TABLE IF NOT EXISTS admins (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(160) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  last_login_at   DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admins_email (email)
) ENGINE=InnoDB;

-- ---------- PRODUCTS ----------
CREATE TABLE IF NOT EXISTS products (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(180) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  short_description VARCHAR(500) NULL,
  description     TEXT         NULL,
  features        LONGTEXT     NULL,
  category        VARCHAR(120) NULL,
  image_path      VARCHAR(255) NULL,
  demo_url        VARCHAR(255) NULL,
  status          ENUM('draft','published','on_hold') NOT NULL DEFAULT 'draft',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_status (status),
  INDEX idx_products_category (category)
) ENGINE=InnoDB;

-- ---------- SERVICES ----------
CREATE TABLE IF NOT EXISTS services (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(180) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  short_description VARCHAR(500) NULL,
  description     TEXT         NULL,
  image_path      VARCHAR(255) NULL,
  cta_text        VARCHAR(120) NULL,
  cta_link        VARCHAR(255) NULL,
  status          ENUM('draft','published','on_hold') NOT NULL DEFAULT 'draft',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_services_status (status)
) ENGINE=InnoDB;

-- ---------- JOBS ----------
CREATE TABLE IF NOT EXISTS jobs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  slug            VARCHAR(220) NOT NULL UNIQUE,
  department      VARCHAR(120) NULL,
  location        VARCHAR(160) NULL,
  employment_type ENUM('Full-Time','Part-Time','Internship','Contract') NOT NULL DEFAULT 'Full-Time',
  work_mode       ENUM('On-site','Remote','Hybrid') NOT NULL DEFAULT 'On-site',
  eligibility     VARCHAR(500) NULL,
  description     TEXT NULL,
  skills          VARCHAR(500) NULL,
  deadline        DATE NULL,
  status          ENUM('draft','published','on_hold','closed') NOT NULL DEFAULT 'draft',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_jobs_status (status),
  INDEX idx_jobs_department (department)
) ENGINE=InnoDB;

-- ---------- APPLICATIONS ----------
CREATE TABLE IF NOT EXISTS applications (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  job_id          INT NOT NULL,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(160) NOT NULL,
  phone           VARCHAR(30)  NOT NULL,
  resume_path     VARCHAR(255) NOT NULL,
  resume_original_name VARCHAR(255) NULL,
  status          ENUM('New','Reviewing','Shortlisted','Rejected','Hired') NOT NULL DEFAULT 'New',
  notes           TEXT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  INDEX idx_app_job (job_id),
  INDEX idx_app_status (status),
  INDEX idx_app_email (email)
) ENGINE=InnoDB;

-- ---------- ENQUIRIES ----------
CREATE TABLE IF NOT EXISTS enquiries (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(160) NOT NULL,
  phone           VARCHAR(30)  NULL,
  subject         VARCHAR(200) NOT NULL,
  message         TEXT NOT NULL,
  is_read         TINYINT(1) NOT NULL DEFAULT 0,
  follow_up_status ENUM('New','Contacted','Closed') NOT NULL DEFAULT 'New',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_enq_read (is_read),
  INDEX idx_enq_status (follow_up_status)
) ENGINE=InnoDB;

-- ---------- TESTIMONIALS ----------
CREATE TABLE IF NOT EXISTS testimonials (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  client_name     VARCHAR(150) NOT NULL,
  client_role     VARCHAR(150) NULL,
  company         VARCHAR(150) NULL,
  message         TEXT NOT NULL,
  avatar_path     VARCHAR(255) NULL,
  status          ENUM('draft','published','on_hold') NOT NULL DEFAULT 'draft',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_test_status (status)
) ENGINE=InnoDB;

-- ---------- MEDIA ----------
CREATE TABLE IF NOT EXISTS media_files (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  file_name       VARCHAR(255) NOT NULL,
  file_path       VARCHAR(255) NOT NULL,
  mime_type       VARCHAR(120) NULL,
  size_bytes      INT NULL,
  kind            ENUM('product','service','logo','testimonial','other') NOT NULL DEFAULT 'other',
  uploaded_by     INT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_admin FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_media_kind (kind)
) ENGINE=InnoDB;

-- ---------- SITE SETTINGS (single row) ----------
CREATE TABLE IF NOT EXISTS site_settings (
  id              INT PRIMARY KEY,
  company_name    VARCHAR(180) NOT NULL DEFAULT 'Your Company',
  logo_path       VARCHAR(255) NULL,
  email           VARCHAR(160) NULL,
  phone           VARCHAR(40)  NULL,
  address         VARCHAR(400) NULL,
  facebook_url    VARCHAR(255) NULL,
  twitter_url     VARCHAR(255) NULL,
  linkedin_url    VARCHAR(255) NULL,
  instagram_url   VARCHAR(255) NULL,
  github_url      VARCHAR(255) NULL,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO site_settings (id, company_name, email, phone, address)
VALUES (1, 'Your Company', 'hello@example.com', '+91 00000 00000', 'Your address')
ON DUPLICATE KEY UPDATE id = 1;

-- ---------- PAGE CONTENTS ----------
CREATE TABLE IF NOT EXISTS page_contents (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  page_key        VARCHAR(80) NOT NULL UNIQUE,
  section_key     VARCHAR(80) NOT NULL,
  content         LONGTEXT NOT NULL,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_page_section (page_key, section_key)
) ENGINE=InnoDB;

-- Default content seeds
INSERT INTO page_contents (page_key, section_key, content) VALUES
 ('home', 'hero', '{"headline":"Build the future with modern IT solutions","subheadline":"We craft scalable products and SaaS platforms for growing businesses.","cta_primary_text":"Explore Products","cta_primary_link":"/products","cta_secondary_text":"Talk to Us","cta_secondary_link":"/contact"}'),
 ('home', 'intro', '{"title":"Who we are","body":"We are a product-focused IT company delivering high quality software."}'),
 ('home', 'cta', '{"title":"Ready to start your next project?","button_text":"Contact Us","button_link":"/contact"}'),
 ('about', 'story', '{"title":"Our Story","body":"Founded with a mission to make great software accessible to everyone."}'),
 ('footer', 'about', '{"text":"We build modern IT products and SaaS platforms."}');

-- ---------- ADMIN ACTIVITY LOGS ----------
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  admin_id        INT NULL,
  action          VARCHAR(120) NOT NULL,
  entity          VARCHAR(80)  NULL,
  entity_id       INT NULL,
  meta            LONGTEXT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_log_admin (admin_id),
  INDEX idx_log_entity (entity, entity_id)
) ENGINE=InnoDB;