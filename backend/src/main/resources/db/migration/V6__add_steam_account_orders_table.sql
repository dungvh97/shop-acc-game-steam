CREATE TABLE steam_account_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'QR_CODE',
    qr_code_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    account_username VARCHAR(255),
    account_password VARCHAR(255),
    FOREIGN KEY (account_id) REFERENCES steam_accounts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_steam_account_orders_user_id ON steam_account_orders(user_id);
CREATE INDEX idx_steam_account_orders_account_id ON steam_account_orders(account_id);
CREATE INDEX idx_steam_account_orders_status ON steam_account_orders(status);
CREATE INDEX idx_steam_account_orders_created_at ON steam_account_orders(created_at);
CREATE INDEX idx_steam_account_orders_expires_at ON steam_account_orders(expires_at);
