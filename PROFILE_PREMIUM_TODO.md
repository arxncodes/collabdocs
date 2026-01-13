# Task: Profile Picture Upload & Premium Features

## Plan

- [x] Step 1: Database Setup
  - [x] Add avatar_url column to profiles table
  - [x] Add subscription_tier column to profiles table (free, premium)
  - [x] Add subscription_expires_at column to profiles table
  - [x] Create Supabase storage bucket for profile pictures
  - [x] Set up bucket policies for authenticated users

- [x] Step 2: Profile Picture Upload Component
  - [x] Create ImageUpload component with compression
  - [x] Add hover effect to profile picture in ProfilePage
  - [x] Show upload button on hover
  - [x] Implement file validation (size, format)
  - [x] Implement automatic compression (WEBP, 1080p, <1MB)
  - [x] Show upload progress bar
  - [x] Update profile with new avatar URL

- [x] Step 3: Premium Subscription System
  - [x] Add subscription badge to profile
  - [x] Create premium features list
  - [x] Add upgrade prompt for free users
  - [x] Implement feature gating (check subscription tier)
  - [x] Add premium indicator in UI

- [x] Step 4: Premium Features Implementation
  - [x] Version history (premium only) - UI ready
  - [x] Export to PDF (premium only) - UI ready
  - [x] Advanced collaboration features (premium only) - UI ready
  - [x] Custom themes (premium only) - UI ready
  - [x] Priority support badge (premium only) - UI ready

- [x] Step 5: Testing & Documentation
  - [x] Run lint (93 files checked, no errors)
  - [x] Verify all components created
  - [x] Update TODO.md

## Notes
- Using Supabase Storage for profile pictures
- Bucket naming: profile_images
- Max file size: 1MB (with auto-compression)
- Supported formats: JPEG, PNG, GIF, WEBP, AVIF
- Premium features show upgrade prompt for free users
- All components created and lint passed
