# Civicfix Database Schema

This document outlines the complete database schema for the Civicfix civic issue reporting platform.

## Overview

The Civicfix platform uses a relational database to manage users, civic issues, votes, comments, notifications, and administrative functions. The schema is designed to support:

- User authentication and profiles
- Issue reporting and management
- Community voting and engagement
- Comments and discussions
- Notifications and alerts
- Administrative oversight
- Analytics and reporting

## Database Tables

### 1. Users Table

Stores user account information and profile data.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    role user_role DEFAULT 'citizen',
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enums
CREATE TYPE user_role AS ENUM ('citizen', 'moderator', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned', 'deleted');
```

### 2. Issues Table

Central table for civic issues reported by users.

```sql
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    status issue_status DEFAULT 'pending',
    priority issue_priority DEFAULT 'medium',
    location_address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    ward_id UUID REFERENCES wards(id),
    constituency_id UUID REFERENCES constituencies(id),
    reported_by UUID REFERENCES users(id) NOT NULL,
    assigned_to UUID REFERENCES users(id),
    assigned_department_id UUID REFERENCES departments(id),
    estimated_cost DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2),
    estimated_completion_date DATE,
    actual_completion_date DATE,
    upvotes_count INTEGER DEFAULT 0,
    downvotes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    tags TEXT[], -- Array of hashtags
    metadata JSONB, -- Additional structured data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Enums
CREATE TYPE issue_status AS ENUM ('pending', 'under_review', 'approved', 'in_progress', 'resolved', 'rejected', 'duplicate');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'critical');
```

### 3. Issue Images Table

Stores multiple images for each issue.

```sql
CREATE TABLE issue_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50),
    upload_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Categories Table

Hierarchical categories for issues (e.g., Infrastructure > Roads > Potholes).

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    icon_name VARCHAR(50),
    color_hex VARCHAR(7),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Votes Table

User votes (upvotes/downvotes) on issues.

```sql
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, issue_id)
);

CREATE TYPE vote_type AS ENUM ('upvote', 'downvote');
```

### 6. Comments Table

Comments and discussions on issues.

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id), -- For nested replies
    content TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE, -- Government/admin response
    is_solution BOOLEAN DEFAULT FALSE, -- Marked as solution
    likes_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### 7. Comment Likes Table

Likes on comments.

```sql
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, comment_id)
);
```

### 8. Follows Table

Users following specific issues for updates.

```sql
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    notification_preferences JSONB DEFAULT '{"status_updates": true, "comments": true, "votes": false}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, issue_id)
);
```

### 9. Departments Table

Government departments responsible for different issue types.

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    website_url TEXT,
    head_of_department VARCHAR(255),
    address TEXT,
    response_time_sla INTEGER, -- Hours
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10. Wards Table

Electoral wards for location-based organization.

```sql
CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    ward_number VARCHAR(10),
    constituency_id UUID REFERENCES constituencies(id),
    population INTEGER,
    area_sq_km DECIMAL(10, 2),
    councillor_name VARCHAR(255),
    councillor_email VARCHAR(255),
    councillor_phone VARCHAR(20),
    boundary_coordinates JSONB, -- GeoJSON polygon
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11. Constituencies Table

Parliamentary/assembly constituencies.

```sql
CREATE TABLE constituencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    constituency_type constituency_type,
    representative_name VARCHAR(255),
    representative_email VARCHAR(255),
    representative_phone VARCHAR(20),
    party_affiliation VARCHAR(100),
    boundary_coordinates JSONB, -- GeoJSON polygon
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE constituency_type AS ENUM ('parliamentary', 'assembly', 'municipal');
```

### 12. Notifications Table

System notifications for users.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_issue_id UUID REFERENCES issues(id),
    related_comment_id UUID REFERENCES comments(id),
    related_user_id UUID REFERENCES users(id),
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE TYPE notification_type AS ENUM (
    'issue_status_update',
    'issue_comment',
    'issue_upvoted',
    'issue_assigned',
    'comment_reply',
    'comment_liked',
    'follow_update',
    'system_announcement',
    'weekly_digest'
);
```

### 13. Reports Table

User reports for inappropriate content.

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_issue_id UUID REFERENCES issues(id),
    reported_comment_id UUID REFERENCES comments(id),
    reported_user_id UUID REFERENCES users(id),
    reason report_reason NOT NULL,
    description TEXT,
    status report_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE report_reason AS ENUM ('spam', 'inappropriate', 'false_information', 'harassment', 'duplicate', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');
```

### 14. Activity Logs Table

Audit trail for important actions.

```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 15. Settings Table

User preferences and settings.

```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications JSONB DEFAULT '{"status_updates": true, "comments": true, "weekly_digest": false}',
    push_notifications JSONB DEFAULT '{"status_updates": true, "comments": false}',
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "location_sharing": true, "show_activity": true}',
    theme VARCHAR(20) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_radius_km INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 16. Analytics Tables

For tracking usage and generating insights.

```sql
-- Page views and interactions
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    event_type VARCHAR(50) NOT NULL,
    page_url TEXT,
    referrer_url TEXT,
    issue_id UUID REFERENCES issues(id),
    properties JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily aggregated statistics
CREATE TABLE daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_issues INTEGER DEFAULT 0,
    new_issues INTEGER DEFAULT 0,
    resolved_issues INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category_id);
CREATE INDEX idx_issues_location ON issues(latitude, longitude);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_issues_reported_by ON issues(reported_by);
CREATE INDEX idx_issues_ward ON issues(ward_id);

CREATE INDEX idx_votes_issue ON votes(issue_id);
CREATE INDEX idx_votes_user ON votes(user_id);

CREATE INDEX idx_comments_issue ON comments(issue_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

CREATE INDEX idx_follows_user ON follows(user_id);
CREATE INDEX idx_follows_issue ON follows(issue_id);

-- Text search indexes
CREATE INDEX idx_issues_text_search ON issues USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_users_text_search ON users USING gin(to_tsvector('english', name || ' ' || COALESCE(bio, '')));
```

## Views

```sql
-- Issue summary view with vote counts and user info
CREATE VIEW issue_summary AS
SELECT 
    i.*,
    u.name as reporter_name,
    u.avatar_url as reporter_avatar,
    c.name as category_name,
    w.name as ward_name,
    d.name as department_name,
    (SELECT COUNT(*) FROM votes v WHERE v.issue_id = i.id AND v.vote_type = 'upvote') as upvotes,
    (SELECT COUNT(*) FROM votes v WHERE v.issue_id = i.id AND v.vote_type = 'downvote') as downvotes,
    (SELECT COUNT(*) FROM comments cm WHERE cm.issue_id = i.id AND cm.deleted_at IS NULL) as comments_count
FROM issues i
LEFT JOIN users u ON i.reported_by = u.id
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN wards w ON i.ward_id = w.id
LEFT JOIN departments d ON i.assigned_department_id = d.id
WHERE i.deleted_at IS NULL;

-- User statistics view
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.created_at as joined_date,
    COUNT(DISTINCT i.id) as issues_reported,
    COUNT(DISTINCT v.id) as votes_cast,
    COUNT(DISTINCT c.id) as comments_made,
    COUNT(DISTINCT f.id) as issues_following
FROM users u
LEFT JOIN issues i ON u.id = i.reported_by AND i.deleted_at IS NULL
LEFT JOIN votes v ON u.id = v.user_id
LEFT JOIN comments c ON u.id = c.user_id AND c.deleted_at IS NULL
LEFT JOIN follows f ON u.id = f.user_id
GROUP BY u.id, u.name, u.email, u.created_at;
```

## Triggers

```sql
-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update vote counts when votes are added/removed
CREATE OR REPLACE FUNCTION update_issue_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE issues SET upvotes_count = upvotes_count + 1 WHERE id = NEW.issue_id;
        ELSE
            UPDATE issues SET downvotes_count = downvotes_count + 1 WHERE id = NEW.issue_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE issues SET upvotes_count = upvotes_count - 1 WHERE id = OLD.issue_id;
        ELSE
            UPDATE issues SET downvotes_count = downvotes_count - 1 WHERE id = OLD.issue_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle vote type change
        IF OLD.vote_type != NEW.vote_type THEN
            IF OLD.vote_type = 'upvote' THEN
                UPDATE issues SET upvotes_count = upvotes_count - 1, downvotes_count = downvotes_count + 1 WHERE id = NEW.issue_id;
            ELSE
                UPDATE issues SET upvotes_count = upvotes_count + 1, downvotes_count = downvotes_count - 1 WHERE id = NEW.issue_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_issue_vote_counts
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_issue_vote_counts();
```

## Security & Permissions

```sql
-- Row Level Security policies
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY user_notifications ON notifications
    FOR ALL USING (user_id = current_user_id());

-- Users can vote on any active issue
CREATE POLICY issue_voting ON votes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM issues 
            WHERE id = issue_id 
            AND status NOT IN ('deleted', 'rejected')
        )
    );
```

## Sample Data

```sql
-- Insert sample categories
INSERT INTO categories (name, description, icon_name, color_hex) VALUES
('Infrastructure', 'Roads, bridges, utilities', 'construction', '#3B82F6'),
('Environment', 'Pollution, waste management', 'leaf', '#10B981'),
('Public Safety', 'Crime, lighting, traffic', 'shield', '#EF4444'),
('Transportation', 'Public transport, parking', 'car', '#F59E0B'),
('Health & Sanitation', 'Healthcare, cleanliness', 'heart', '#EC4899');

-- Insert sample departments
INSERT INTO departments (name, description, email, response_time_sla) VALUES
('Roads Department', 'Responsible for road maintenance and construction', 'roads@city.gov', 72),
('Waste Management', 'Garbage collection and disposal', 'waste@city.gov', 24),
('Police Department', 'Law enforcement and public safety', 'police@city.gov', 2),
('Health Department', 'Public health and sanitation', 'health@city.gov', 48);
```

This comprehensive schema supports all the features of the Civicfix platform including user management, issue tracking, community engagement, notifications, analytics, and administrative functions. The design is scalable and includes proper indexing, security measures, and data integrity constraints.
