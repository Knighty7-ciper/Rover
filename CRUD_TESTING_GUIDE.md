# ROVER Platform - CRUD Operations Testing Guide

## Pre-Testing Setup

### 1. Database Setup (Required First)
Execute these SQL scripts in your Supabase SQL Editor in this exact order:

\`\`\`sql
-- Step 1: Notifications System
-- Run: scripts/007_create_notifications.sql

-- Step 2: Database Functions  
-- Run: scripts/database_functions.sql

-- Step 3: Search Functions
-- Run: scripts/008_create_search_functions.sql
\`\`\`

### 2. Environment Variables
Ensure these are set in your `.env.local`:
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## CRUD Operations Testing Checklist

### 1. Authentication Testing
**Test:** User login and JWT token generation
\`\`\`bash
# Login via your UI and verify:
- JWT tokens are generated
- User session is maintained
- API calls include authentication headers
\`\`\`

### 2. Posts CRUD Testing

#### Create Post
\`\`\`bash
# Create text post
POST /api/posts
{
  "content": "This is a test post for project milestone update",
  "content_type": "text"
}

# Create milestone post
POST /api/posts  
{
  "content": "Milestone 1 completed! #projectUpdate",
  "content_type": "milestone",
  "milestone_id": "milestone-uuid-here"
}
\`\`\`
**Expected:** Post created, mentions processed, notifications sent

#### Read Posts
\`\`\`bash
# List posts
GET /api/posts?limit=10&offset=0

# Get specific post
GET /api/posts/[post-id]

# Filter by user
GET /api/posts?user_id=[user-id]&content_type=milestone
\`\`\`
**Expected:** Posts returned with profile data, comments, likes count

#### Update Post
\`\`\`bash
PUT /api/posts/[post-id]
{
  "content": "Updated post content with new information",
  "content_type": "text"
}
\`\`\`
**Expected:** Post updated, only by owner

#### Delete Post
\`\`\`bash
DELETE /api/posts/[post-id]
\`\`\`
**Expected:** Post and related data (comments, likes) deleted

### 3. Comments CRUD Testing

#### Create Comment
\`\`\`bash
POST /api/posts/[post-id]/comments
{
  "content": "Great milestone achievement!"
}
\`\`\`
**Expected:** Comment created, notification sent to post author

#### Read Comments
\`\`\`bash
GET /api/posts/[post-id]/comments?limit=20&offset=0
\`\`\`
**Expected:** Comments with author profile data

#### Update Comment
\`\`\`bash
PUT /api/comments/[comment-id]
{
  "content": "Updated comment content"
}
\`\`\`
**Expected:** Comment updated, only by owner

#### Delete Comment
\`\`\`bash
DELETE /api/comments/[comment-id]
\`\`\`
**Expected:** Comment deleted

### 4. Likes CRUD Testing

#### Create Like
\`\`\`bash
POST /api/posts/[post-id]/likes
\`\`\`
**Expected:** Like created, notification sent to post author

#### Read Likes
\`\`\`bash
GET /api/posts/[post-id]/likes?limit=10&offset=0
\`\`\`
**Expected:** List of users who liked the post

#### Remove Like
\`\`\`bash
DELETE /api/likes/[like-id]
\`\`\`
**Expected:** Like removed, only by owner

### 5. Messages CRUD Testing

#### Send Direct Message
\`\`\`bash
POST /api/messages
{
  "recipient_id": "[recipient-user-id]",
  "content": "Direct message content"
}
\`\`\`

#### Send Group Message
\`\`\`bash
POST /api/messages
{
  "is_group_message": true,
  "group_name": "Project Team",
  "content": "Group message content"
}
\`\`\`

#### Read Messages
\`\`\`bash
GET /api/messages?limit=20&offset=0&conversation_with=[user-id]
\`\`\`
**Expected:** Messages with sender/recipient profiles

#### Update Message (Mark as Read)
\`\`\`bash
PUT /api/messages/[message-id]
{
  "is_read": true
}
\`\`\`

#### Delete Message
\`\`\`bash
DELETE /api/messages/[message-id]
\`\`\`

### 6. Projects CRUD Testing

#### Create Project
\`\`\`bash
POST /api/projects
{
  "name": "Government Digital Initiative 2025",
  "description": "Modernization of government services",
  "department": "IT",
  "budget": 500000,
  "estimated_completion_date": "2025-12-31"
}
\`\`\`

#### Read Projects
\`\`\`bash
# List projects
GET /api/projects?limit=10&offset=0

# Filter by department
GET /api/projects?department=IT&status=active

# Get specific project
GET /api/projects/[project-id]
\`\`\`
**Expected:** Projects with creator profile and milestones

#### Update Project
\`\`\`bash
PUT /api/projects/[project-id]
{
  "name": "Updated Project Name",
  "description": "Updated project description",
  "status": "in_progress",
  "budget": 600000
}
\`\`\`

#### Delete Project
\`\`\`bash
DELETE /api/projects/[project-id]
\`\`\`
**Expected:** Project and related milestones deleted

### 7. Milestones CRUD Testing

#### Create Milestone
\`\`\`bash
POST /api/projects/[project-id]/milestones
{
  "title": "Phase 1 Complete",
  "description": "Initial setup and planning completed",
  "due_date": "2025-03-31",
  "budget_allocated": 100000
}
\`\`\`

#### Read Milestones
\`\`\`bash
GET /api/projects/[project-id]/milestones?limit=10&offset=0
\`\`\`

#### Update Milestone
\`\`\`bash
PUT /api/milestones/[milestone-id]
{
  "status": "completed",
  "completion_percentage": 100,
  "actual_budget": 95000
}
\`\`\`
**Expected:** Project progress automatically updated

#### Delete Milestone
\`\`\`bash
DELETE /api/milestones/[milestone-id]
\`\`\`

### 8. Tags CRUD Testing

#### Create Tag
\`\`\`bash
POST /api/tags
{
  "name": "projectUpdate"
}
\`\`\`

#### Read Tags
\`\`\`bash
# List all tags
GET /api/tags?limit=20&offset=0

# Get trending tags
GET /api/tags?trending=true&limit=10

# Get specific tag with posts
GET /api/tags/[tag-id]
\`\`\`

#### Update Tag
\`\`\`bash
PUT /api/tags/[tag-id]
{
  "name": "updated-tag-name"
}
\`\`\`

#### Delete Tag
\`\`\`bash
DELETE /api/tags/[tag-id]
\`\`\`

### 9. Profiles CRUD Testing

#### Update Current Profile
\`\`\`bash
PUT /api/profiles
{
  "full_name": "John Doe",
  "title": "Senior Government Official",
  "department": "Administration",
  "bio": "Experienced in digital transformation",
  "phone": "+1-555-0123",
  "office_location": "Building A, Floor 3"
}
\`\`\`

#### Read Profiles
\`\`\`bash
# List profiles
GET /api/profiles?limit=20&offset=0&department=IT&title=Manager

# Get specific profile
GET /api/profiles/[user-id]
\`\`\`
**Expected:** Profiles with follower counts, recent posts, projects

#### Update Profile (Admin)
\`\`\`bash
PUT /api/profiles/[user-id]
{
  "role": "admin",
  "department": "IT"
}
\`\`\`

#### Delete Profile (Admin)
\`\`\`bash
DELETE /api/profiles/[user-id]
\`\`\`

### 10. Follow System Testing

#### Follow User
\`\`\`bash
POST /api/follow/[user-id]
\`\`\`
**Expected:** Follow record created, follower count updated

#### Unfollow User
\`\`\`bash
DELETE /api/follow/[user-id]
\`\`\`
**Expected:** Follow record removed, follower count updated

### 11. Notifications Testing

#### Read Notifications
\`\`\`bash
GET /api/notifications?limit=20&offset=0
\`\`\`
**Expected:** Notifications with actor profiles

#### Mark All Read
\`\`\`bash
POST /api/notifications/mark-all-read
\`\`\`
**Expected:** All user notifications marked as read

### 12. Search Testing

#### Global Search
\`\`\`bash
GET /api/search?q=budget&type=all&limit=10&offset=0
\`\`\`

#### Search by Type
\`\`\`bash
# Search posts
GET /api/search?q=project&type=posts&limit=10

# Search people  
GET /api/search?q=john&type=people&limit=10

# Search projects
GET /api/search?q=digital&type=projects&limit=10

# Search tags
GET /api/search?q=update&type=tags&limit=10
\`\`\`

#### Search Suggestions (Autocomplete)
\`\`\`bash
GET /api/search/suggestions?q=proj&limit=5
\`\`\`
**Expected:** Real-time suggestions for each category

## DFD Workflow Testing

### Complete User Journey Test

1. **Authentication Flow:**
   - User logs in → JWT token generated
   - Session maintained across requests

2. **Content Creation Flow:**
   - Create post with @mentions → Mentions processed
   - Create milestone post → Notification sent to stakeholders
   - Add comments to posts → Post author notified

3. **Social Engagement Flow:**
   - Like posts → Notification sent to author
   - Follow users → Follower counts updated
   - Send messages → Real-time delivery

4. **Project Management Flow:**
   - Create project → Creator assigned
   - Add milestones → Progress tracking
   - Update milestone status → Project progress recalculated

5. **Search & Discovery Flow:**
   - Search content → Full-text search across all types
   - Use autocomplete → Instant suggestions
   - Filter by department/role → Role-based results

6. **Notification Flow:**
   - All actions trigger notifications
   - Real-time delivery in app
   - Email integration configured

## Performance Testing

### Database Performance
\`\`\`bash
# Test search performance with large datasets
# Verify index usage in Supabase query planner
# Check search response times under load
\`\`\`

### API Response Times
- All endpoints should respond within 500ms
- Search suggestions within 200ms
- List operations with pagination under 300ms

## Error Testing

### Authentication Errors
\`\`\`bash
# Test without authentication
# Test with invalid tokens
# Test expired sessions
\`\`\`

### Permission Errors
\`\`\`bash
# Test editing others' posts
# Test deleting others' content  
# Test admin-only operations
\`\`\`

### Validation Errors
\`\`\`bash
# Test empty content
# Test invalid user IDs
# Test malformed JSON
\`\`\`

## Success Criteria

### ✅ All CRUD operations working
- ✅ Create operations successful
- ✅ Read operations return proper data
- ✅ Update operations with permission checks
- ✅ Delete operations with cascade handling

### ✅ DFD compliance
- ✅ Authentication & Authorization flow
- ✅ Content Management with mentions
- ✅ Social Features (likes, comments, follows)
- ✅ Messaging with real-time delivery
- ✅ Milestone Tracking with progress/budget
- ✅ Search & Discovery across all content
- ✅ Notification System (real-time, email, in-app)
- ✅ Admin Functions with role-based access

### ✅ Database integration
- ✅ All 3 SQL scripts executed successfully
- ✅ Search functions working
- ✅ Notification functions working
- ✅ Follower/following counts updating
- ✅ Tag posts_count updating

### ✅ Real-time features
- ✅ Live notifications
- ✅ Real-time message delivery
- ✅ Search autocomplete
- ✅ Notification counters

## Post-Testing

After completing all tests:
1. Review `CRUD_OPERATIONS_COMPLETE.md` for verification
2. Test the complete user interface
3. Verify all DFD workflows are functional
4. Check database performance with real data

## Troubleshooting

### Common Issues:
1. **Authentication fails** → Check environment variables and Supabase config
2. **Database errors** → Verify SQL scripts executed in correct order
3. **Search not working** → Ensure pg_trgm extension enabled and indexes created
4. **Notifications not sending** → Check RLS policies and notification functions
5. **Real-time features not working** → Verify WebSocket connections and triggers

### Database Verification Queries:
\`\`\`sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if functions exist
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- Check if triggers exist
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table IN ('posts', 'profiles');

-- Test search function
SELECT * FROM global_search('test', auth.uid(), 10);
\`\`\`
