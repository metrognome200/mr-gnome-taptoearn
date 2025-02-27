-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    telegram_id VARCHAR NOT NULL UNIQUE,
    username VARCHAR,
    wallet_address VARCHAR,
    gnome_balance DECIMAL DEFAULT 0,
    ton_balance DECIMAL DEFAULT 0,
    tap_power INTEGER DEFAULT 1,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    last_tap TIMESTAMP,
    last_login TIMESTAMP,
    login_streak INTEGER DEFAULT 0,
    referral_code VARCHAR UNIQUE,
    referred_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Mining Cards Table
CREATE TABLE mining_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    level INTEGER DEFAULT 1,
    profit_per_hour DECIMAL,
    last_collected TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR NOT NULL,
    description TEXT,
    reward_amount DECIMAL,
    required_action TEXT,
    youtube_video_id VARCHAR,
    platform VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Tasks Table
CREATE TABLE user_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    task_id UUID REFERENCES tasks(id),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

-- Boosters Table
CREATE TABLE boosters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type VARCHAR NOT NULL,
    multiplier DECIMAL,
    duration INTEGER,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Daily Rewards Table
CREATE TABLE daily_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    day_number INTEGER,
    claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    icon VARCHAR,
    requirement_type VARCHAR NOT NULL,
    requirement_value INTEGER NOT NULL,
    reward_type VARCHAR NOT NULL,
    reward_amount DECIMAL NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Achievements Table
CREATE TABLE user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    achievement_id UUID REFERENCES achievements(id),
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Airdrops Table
CREATE TABLE airdrops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    token_type VARCHAR NOT NULL,
    total_amount DECIMAL NOT NULL,
    amount_per_user DECIMAL NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    requirements JSONB,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status VARCHAR DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Airdrops Table
CREATE TABLE user_airdrops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    airdrop_id UUID REFERENCES airdrops(id),
    claimed_amount DECIMAL NOT NULL,
    claimed_at TIMESTAMP DEFAULT NOW(),
    tx_hash VARCHAR,
    UNIQUE(user_id, airdrop_id)
);

-- Airdrop Requirements Table
CREATE TABLE airdrop_requirements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    airdrop_id UUID REFERENCES airdrops(id),
    requirement_type VARCHAR NOT NULL,
    requirement_value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);