-- Adds multi-focus 1-5 feedback/ratings for service providers (e.g. accommodation,
-- catering, training venue) so future booking decisions aren't based on a single
-- reviewer's opinion but on the aggregated feedback across all raters.

CREATE TABLE IF NOT EXISTS service_provider_ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_provider_id INT NOT NULL,
  focus_area VARCHAR(100) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NULL,
  rated_by VARCHAR(150) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_service_provider_ratings_provider
    FOREIGN KEY (service_provider_id) REFERENCES raw_service_providers(ID) ON DELETE CASCADE,
  CONSTRAINT chk_service_provider_ratings_range CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_service_provider_ratings_provider (service_provider_id)
);
